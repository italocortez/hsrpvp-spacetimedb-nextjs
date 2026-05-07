<purpose>
Retroactive 6-pillar visual audit of implemented frontend code. Standalone command that works on any project — GSD-managed or not. Produces scored UI-REVIEW.md with actionable findings.
</purpose>

<required_reading>
@D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/get-shit-done/references/ui-brand.md
</required_reading>

<available_agent_types>
Valid GSD subagent types (use exact names — do not fall back to 'general-purpose'):
- gsd-ui-auditor — Audits UI against design requirements
</available_agent_types>

<process>

## 0. Initialize

```bash
INIT=$(node .claude/get-shit-done/bin/gsd-sdk.cjs query init.phase-op "${PHASE_ARG}")
if [[ "$INIT" == @file:* ]]; then INIT=$(cat "${INIT#@file:}"); fi
AGENT_SKILLS_UI_REVIEWER=$(node .claude/get-shit-done/bin/gsd-sdk.cjs query agent-skills gsd-ui-auditor)
```

Parse: `phase_dir`, `phase_number`, `phase_name`, `phase_slug`, `padded_phase`, `commit_docs`.

```bash
UI_AUDITOR_MODEL=$(node .claude/get-shit-done/bin/gsd-sdk.cjs query resolve-model gsd-ui-auditor --raw)
```

Display banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► UI AUDIT — PHASE {N}: {name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 1. Detect Input State

```bash
SUMMARY_FILES=$(ls "${PHASE_DIR}"/*-SUMMARY.md 2>/dev/null)
UI_SPEC_FILE=$(ls "${PHASE_DIR}"/*-UI-SPEC.md 2>/dev/null | head -1)
UI_REVIEW_FILE=$(ls "${PHASE_DIR}"/*-UI-REVIEW.md 2>/dev/null | head -1)
```

**If `SUMMARY_FILES` empty:** Exit — "Phase {N} not executed. Run /gsd-execute-phase {N} first."


**Text mode (`workflow.text_mode: true` in config or `--text` flag):** Set `TEXT_MODE=true` if `--text` is present in `$ARGUMENTS` OR `text_mode` from init JSON is `true`. When TEXT_MODE is active, replace every `AskUserQuestion` call with a plain-text numbered list and ask the user to type their choice number. This is required for non-Claude runtimes (OpenAI Codex, Gemini CLI, etc.) where `AskUserQuestion` is not available.
**If `UI_REVIEW_FILE` non-empty:** Use AskUserQuestion:
- header: "Existing UI Review"
- question: "UI-REVIEW.md already exists for Phase {N}."
- options:
  - "Re-audit — run fresh audit"
  - "View — display current review and exit"

If "View": display file, exit.
If "Re-audit": continue.

## 2. Gather Context Paths

Build file list for auditor:
- All SUMMARY.md files in phase dir
- All PLAN.md files in phase dir
- UI-SPEC.md (if exists — audit baseline)
- CONTEXT.md (if exists — locked decisions)

## 3. Spawn gsd-ui-auditor

```
◆ Spawning UI auditor...
```

Build prompt:

```markdown
Read D:/GitsWork/hsrpvp-spacetimedb-nextjs/.claude/agents/gsd-ui-auditor.md for instructions.

<objective>
Conduct 6-pillar visual audit of Phase {phase_number}: {phase_name}
{If UI-SPEC exists: "Audit against UI-SPEC.md design contract."}
{If no UI-SPEC: "Audit against abstract 6-pillar standards."}
</objective>

<files_to_read>
- {summary_paths} (Execution summaries)
- {plan_paths} (Execution plans — what was intended)
- {ui_spec_path} (UI Design Contract — audit baseline, if exists)
- {context_path} (User decisions, if exists)
</files_to_read>

${AGENT_SKILLS_UI_REVIEWER}

<config>
phase_dir: {phase_dir}
padded_phase: {padded_phase}
</config>
```

Omit null file paths.

```
Task(
  prompt=ui_audit_prompt,
  subagent_type="gsd-ui-auditor",
  model="{UI_AUDITOR_MODEL}",
  description="UI Audit Phase {N}"
)
```

## 4. Handle Return

**If `## UI REVIEW COMPLETE`:**

Display score summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► UI AUDIT COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {N}: {Name}** — Overall: {score}/24

| Pillar | Score |
|--------|-------|
| Copywriting | {N}/4 |
| Visuals | {N}/4 |
| Color | {N}/4 |
| Typography | {N}/4 |
| Spacing | {N}/4 |
| Experience Design | {N}/4 |

Top fixes:
1. {fix}
2. {fix}
3. {fix}

Full review: {path to UI-REVIEW.md}

───────────────────────────────────────────────────────────────

## ▶ Next

`/clear` then one of:

- `/gsd-verify-work {N}` — UAT testing
- `/gsd-plan-phase {N+1}` — plan next phase

- `/gsd-verify-work {N}` — UAT testing
- `/gsd-plan-phase {N+1}` — plan next phase

───────────────────────────────────────────────────────────────
```

## Automated UI Verification (Playwright CLI or Playwright-MCP)

Two browser backends are supported. Detect at runtime and prefer CLI (lower
token overhead — no MCP tool-schema bloat):

```bash
# Backend detection (run once at start of audit step)
HAS_CLI=$(command -v playwright-cli >/dev/null 2>&1 && echo "true" || echo "false")
HAS_MCP=$(compgen -A function mcp__playwright__ 2>/dev/null | head -1 | grep -q . && echo "true" || echo "false")
```

If `HAS_CLI=true` OR `HAS_MCP=true`:

1. Start the dev server if not already running (`npm run dev` in background).
2. Open a browser session:
   - **CLI (preferred):** `rtk proxy playwright-cli open <base-url>` — opens once, reused across components
   - **MCP:** `mcp__playwright__navigate` per component
3. For each component described in UI-SPEC.md, navigate and screenshot:
   - **CLI:** `rtk proxy playwright-cli goto <route>` then `rtk proxy playwright-cli screenshot --filename {phase_dir}/screenshots/{component}.png`
   - **MCP:** `mcp__playwright__screenshot` per component
4. `Read` each PNG. Compare against the spec's visual requirements — dimensions,
   color palette, layout, spacing scale, and typography.
5. Report any dimension, color, or layout discrepancies as additional findings
   within the relevant pillar section of UI-REVIEW.md.
6. Flag items that require human judgment (brand feel, content tone) as
   `needs_human_review: true` — surfaced to the user separately after the
   automated pass.
7. **CLI only:** close the session with `rtk proxy playwright-cli close` at audit end.

If NEITHER backend is available, this section is skipped entirely and the audit
falls back to the standard code-only review. No configuration change is required
— backend availability is detected at runtime.

**Note:** Screenshots are dropped under `{phase_dir}/screenshots/` for review
traceability. This path is intentionally committed (unlike ephemeral `tmp/pw/`
drops used during execution) so the audit artifact is durable alongside
UI-REVIEW.md.

## 5. Commit (if configured)

```bash
node .claude/get-shit-done/bin/gsd-sdk.cjs query commit "docs(${padded_phase}): UI audit review" "${PHASE_DIR}/${PADDED_PHASE}-UI-REVIEW.md"
```

</process>

<success_criteria>
- [ ] Phase validated
- [ ] SUMMARY.md files found (execution completed)
- [ ] Existing review handled (re-audit/view)
- [ ] gsd-ui-auditor spawned with correct context
- [ ] UI-REVIEW.md created in phase directory
- [ ] Score summary displayed to user
- [ ] Next steps presented
</success_criteria>
