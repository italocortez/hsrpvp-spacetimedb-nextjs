<!-- Sources:
  - SpacetimeDB CLI reference: https://github.com/clockworklabs/SpacetimeDB/blob/1a1fe7859e43ce1372139b6b868b51fa44aec065/docs/docs/00300-resources/01000-reference/00100-cli-reference/00300-spacetime-json.md
-->

# spacetime.json Configuration Reference

The `spacetime.json` file provides project-level configuration for the SpacetimeDB CLI, eliminating repetitive flags for `publish`, `generate`, and `dev`.

---

## Field Reference

| Field | Type | Inherited | Purpose |
|-------|------|-----------|---------|
| `database` | string | No | Database name/identity (required) |
| `module-path` | string | Yes* | Source module directory path |
| `bin-path` | string | Yes* | Precompiled WASM binary location |
| `js-path` | string | Yes* | Bundled JavaScript file path |
| `server` | string | Yes | Server nickname, domain, or URL |
| `build-options` | string | Yes | Flags passed to build command |
| `break-clients` | boolean | Yes | Allow breaking changes |
| `num-replicas` | number | Yes | Database replica count |
| `anonymous` | boolean | Yes | Use anonymous identity |
| `organization` | string | Yes | Organization name/identity |
| `generate` | array | No | Bindings generation targets |
| `children` | array | No | Child database entities |
| `dev` | object | No | Dev server config (root-level only) |

*`module-path`, `bin-path`, and `js-path` are mutually exclusive. When a child specifies one, the others don't inherit from parent.

---

## Generate Configuration

Each entry in the `generate` array requires:
- `language`: `typescript`, `csharp`, `rust`, `unrealcpp`
- `out-dir`: Output directory

Language-specific options:
- **C#**: `namespace`
- **Unreal C++**: `unreal-module-name`, `uproject-dir`
- **All**: `include-private` (boolean — include private tables in generated bindings)

---

## Children and Inheritance

Child databases inherit all fields marked "Yes" above. Never inherited: `database`, `generate`, `children`, `dev`.

### Source conflict rule
When a child specifies `module-path`, `bin-path`, or `js-path`, the other two sources don't inherit from parent.

---

## spacetime dev

The `dev` field (root-level only) specifies the client dev server:

```json
{ "dev": { "run": "pnpm dev" } }
```

**Execution sequence:**
1. Build all configured modules
2. Generate bindings for all databases
3. Publish all databases
4. Run client dev server
5. Watch for changes and repeat

Flags: `--run` overrides `dev.run`, `--server` overrides server, `--skip-publish` and `--skip-generate` skip those steps.

**Auto-generation:** Running `spacetime dev` without a config file generates `spacetime.json` (server + module path) and `spacetime.local.json` (database name).

---

## Database Selection with Glob Patterns

When `spacetime.json` exists, the database name argument selects targets:
- No argument: operates on all databases
- Specific name: `spacetime publish world-highlands`
- Glob pattern: `spacetime publish "world-*"`

---

## Flag Overrides

| Scope | Flags |
|-------|-------|
| **Global** (all databases) | `--server`, `--break-clients`, `--delete-data`, `--yes`/`--force` |
| **Per-database** (error if multiple selected) | `--module-path`, `--bin-path`, `--js-path`, `--build-options`, `--num-replicas` |
| **Per-generate-entry** (error if multiple entries) | `--lang`, `--out-dir`, `--namespace`, `--unreal-module-name`, `--uproject-dir` |

Use `--no-config` to ignore `spacetime.json` entirely.

---

## Environment and Local Overrides

| File | Purpose | Git-tracked |
|------|---------|-------------|
| `spacetime.json` | Project defaults | Yes |
| `spacetime.{env}.json` | Environment config | Yes |
| `spacetime.local.json` | User overrides | No |
| `spacetime.{env}.local.json` | User + env overrides | No |

Environment set via `--env` flag. `spacetime dev` implicitly uses `--env dev`.

**Priority (highest to lowest):**
1. CLI flags (explicit only)
2. `spacetime.{env}.local.json`
3. `spacetime.{env}.json`
4. `spacetime.local.json`
5. `spacetime.json`
6. Built-in defaults

Higher-priority files **replace** entire keys (no merging).

---

## Config File Discovery

CLI searches from current directory upward until `spacetime.json` is found or root is reached. All paths are relative to the config file's directory.

## Editor Support

Format uses JSON5 (comments + trailing commas). For VSCode:
```json
{ "files.associations": { "spacetime.json": "jsonc" } }
```
