---
title: Hook-based context injection for GSD discussion phases
planted_date: 2026-04-14
trigger_condition: "Doc-update checkpoint is running reliably AND re-explanation cost at start of new phases is still high"
status: deferred
---

# Hook-based context injection for discussion phases

## The idea

Use Claude Code SessionStart + UserPromptSubmit hooks to auto-inject relevant context into discussion phases, solving the "decisions from prior phases disappear across sessions" problem. Borrows the architectural pattern from agentmemory (which we evaluated and rejected, see `.planning/notes/context-persistence-evaluation.md`) without any of its infrastructure cost.

## Why deferred

Any retrieval system is only as good as its source docs. We prioritized the doc-update checkpoint first (`memory/feedback_doc_updates_human_gated.md`) because injecting stale docs is worse than injecting nothing — Claude acts on bad info with confidence.

Until the doc-update checkpoint proves `docs/*/architecture.md` and `docs/*/contract.md` stay current across phases, building injection is premature. Trust chain: staleness-prevention → injection → gate-enforcement.

## Trigger to revisit

Surface this seed when BOTH conditions hold:

1. **Doc checkpoint is working.** Verify-work runs have produced consistent `docs(phase-N): sync {feature}` commits for 3+ consecutive phases. Docs are demonstrably current.
2. **Re-explanation pain persists.** You still find yourself re-explaining prior-phase decisions at the start of discuss-phase for phase 17, 18, 19+. The doc-update checkpoint alone didn't close the gap.

If condition 1 fails: fix the checkpoint before building injection.
If condition 2 doesn't manifest: the checkpoint was sufficient — injection was unnecessary. Keep this seed dormant.

## Proposed scope (when promoted)

Three layers from the exploration:

**Layer 1 — Enable GSD's existing tools.** Flip config flags for `intel.enabled` and `graphify.enabled`. Run `/gsd-intel refresh` and `/gsd-graphify build` to seed `.planning/intel/*.json` and `.planning/graphs/graph.json`.

**Layer 2 — SessionStart intel injection hook.** `.claude/hooks/inject-intel.js`:
- Reads `.planning/intel/arch-decisions.json` (last 20 decisions)
- Reads `.planning/intel/api-map.json` (reducer → consumers map)
- Emits as system context at session start
- Includes staleness warning if intel data is >24h old

**Layer 3 — UserPromptSubmit phase-context injector.** `.claude/hooks/inject-phase-context.js`:
- Detects phase numbers, feature names, or reducer names in the prompt
- Greps `.planning/phases/*/DISCUSSION.md` for matches
- Greps `docs/*/contract.md` Phase History entries for related decisions
- Injects truncated excerpts with file refs as additional context

Estimated scope when promoted: 3-5 hours, 2-3 plans.

## Hard constraints

- Hooks must be project-local (`.claude/hooks/`), not global — respect per-project isolation
- Staleness checks must be cheap (git log timestamps, not AST parsing)
- Must not burn through subscription tokens via LLM summarization — this is a grep-and-inject pattern, not a semantic-search pattern
- Must not modify `docs/*/contract.md` or `docs/*/architecture.md` itself — read-only consumer of those docs

## References from the exploration

- Full comparison of repowise / agentmemory / gsd-intel / gsd-graphify: `.planning/notes/context-persistence-evaluation.md`
- Why agentmemory was rejected (global DB scoping, subagent isolation, summarization cost model): same note
- Doc staleness reasoning (why content-diff was rejected in favor of human-gated checkpoint): `memory/feedback_doc_updates_human_gated.md`
