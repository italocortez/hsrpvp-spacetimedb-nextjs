# GSD SDK local shim

**Created:** 2026-04-19
**GSD version at time of fix:** 1.37.1

## Why this exists

GSD 1.37.1 workflow files emit `gsd-sdk query <ns.cmd>` commands, but no `gsd-sdk` binary is installed anywhere:

- `@gsd-build/sdk@0.1.0` on npm is missing the `query` subcommand entirely (only `run`, `auto`, `init` shipped — the registry-based query dispatcher exists on GitHub `main` but was never published).
- The `get-shit-done-cc` installer parses `--sdk` / `--no-sdk` flags but never acts on them, so the SDK is never linked.

Every `/gsd-*` workflow that touches `execute-phase`, `plan-phase`, `verify-work`, `progress`, etc. was broken until this shim landed.

## What was done

1. `.claude/get-shit-done/bin/gsd-sdk.cjs` — 18-line Node wrapper. Strips the leading `query` token, splits the first `.` in the next arg (`init.execute-phase` → `init execute-phase`), execs `gsd-tools.cjs`.
2. All `.md` files under `.claude/` rewritten: `gsd-sdk query ` → `node .claude/get-shit-done/bin/gsd-sdk.cjs query ` (97 files, 479 executable call sites). 17 prose backtick references left untouched.

## Survival across `/gsd-update`

`/gsd-update` wipes `.claude/get-shit-done/` and `.claude/commands/gsd/`. Both the shim and the rewritten workflows live inside those dirs, so every update will undo this fix.

Recovery path after an update:
1. `.claude/gsd-local-patches/` catches any files the installer detected as modified. Run `/gsd-reapply-patches` — it will re-merge the 97 workflow rewrites.
2. The shim itself (`gsd-sdk.cjs`) is a **new file** the installer doesn't know about, so the wipe will delete it. Recreate from this note or from git history (`git show HEAD:.claude/get-shit-done/bin/gsd-sdk.cjs`).

If `/gsd-reapply-patches` conflicts, the rewrite is deterministic — rerun this one-liner from project root:
```
node -e "const fs=require('fs'),path=require('path');(function w(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())w(p);else if(e.name.endsWith('.md')){const b=fs.readFileSync(p,'utf8'),a=b.replace(/gsd-sdk query /g,'node .claude/get-shit-done/bin/gsd-sdk.cjs query ');if(a!==b)fs.writeFileSync(p,a);}}})('.claude');"
```

## Removal path

When upstream ships a real `gsd-sdk` binary (either by publishing the main-branch SDK build to npm, or by wiring `--sdk` in `get-shit-done-cc`):

1. `npm install -g @gsd-build/sdk@latest` (or whatever the fix uses)
2. Revert the rewrite: same Node one-liner with source/target swapped
3. `rm .claude/get-shit-done/bin/gsd-sdk.cjs`
4. Delete this note

## Related

- Upstream repo: https://github.com/gsd-build/get-shit-done (v1.37.1)
- Published SDK (stale): https://www.npmjs.com/package/@gsd-build/sdk (v0.1.0)
- Other projects on this machine likely need the same fix — copy `gsd-sdk.cjs` + run the rewrite one-liner in each.
