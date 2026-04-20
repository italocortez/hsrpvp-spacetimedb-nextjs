---
name: draw
description: Draw diagrams on an Excalidraw canvas using the official Excalidraw MCP server. Use when the user asks to draw, diagram, visualize anything, or create architecture/ERD/flow diagrams.
user_invocable: true
---

# Excalidraw Drawing Skill

Uses the official Excalidraw MCP server (`mcp__excalidraw`) which renders hand-drawn SVG diagrams with streaming animations.

## Priority Hierarchy

**THIS SKILL is the primary authority** for all design decisions:
- Colors → use the Color-by-Role Mapping below
- Sizing → use the Sizing Constants and Font Size tables below
- Layout → use the Layout Templates below
- Workflow → follow Steps 0-5 below

**The MCP `read_me` tool is ONLY a JSON syntax reference** — it tells you how to format element JSON (property names, binding syntax, pseudo-elements). It does NOT dictate colors, sizes, layout, or workflow. When in doubt, this skill wins.

## Subcommands

Check ARGUMENTS at the bottom of this skill. Route based on the first word:

| Argument starts with | Action |
|---------------------|--------|
| `update-patch` | Run the **Updating from Upstream** procedure below. Do NOT draw anything. |
| anything else / empty | Normal drawing workflow (Steps 1-5) |

## MCP Tools

| Tool | Purpose |
|------|---------|
| `mcp__excalidraw__read_me` | Returns element JSON syntax reference ONLY. Call ONCE at start for format details. |
| `mcp__excalidraw__create_view` | Renders elements as animated Excalidraw SVG. Takes `elements` (JSON string). Returns `checkpointId`. |
| `mcp__excalidraw__export_to_file` | Save diagram to a local `.excalidraw` file for persistence. Takes `checkpointId` + `filePath`. |
| `mcp__excalidraw__query_elements` | Inspect what's in a checkpoint — returns compact summary of IDs, positions, labels, bindings. |
| `mcp__excalidraw__get_screenshot` | Capture the currently displayed diagram as PNG. Returns image inline. Requires viewer open at localhost:4000. |

## Workflow

### Step 0: Establish the working file

At the start of a drawing session, determine the diagram name:
- If the user provides one, use it. Otherwise ask: **"What should I name this diagram?"**
- The working file is always: `notes/{name}.excalidraw` (relative to project root)
- If the file already exists, this is a **resume session** — read it to understand current state

### Step 1: Load the JSON syntax reference

Call `mcp__excalidraw__read_me()` once at the start of the conversation. This returns ONLY the element JSON format (property names, binding syntax, pseudo-elements). All design decisions (colors, sizing, layout) come from THIS skill — not the read_me output.

### Step 2: Plan the layout

Use the **Sizing Constants** and **Layout Templates** below. Do NOT guess coordinates.

If resuming from an existing `.excalidraw` file, read it first to understand element IDs, positions, and structure before planning changes.

**Element ordering in the JSON array (CRITICAL for streaming):**
1. Zone backgrounds (large low-opacity rectangles)
2. Shapes with labels (progressively: shape → its arrows → next shape)
3. Standalone text (titles, annotations)
4. Cross-section arrows last

### Step 3: Draw

Call `mcp__excalidraw__create_view({ elements: "<JSON array string>" })`.

**Critical rules:**
- ALWAYS start with a `cameraUpdate` element (4:3 ratio: 400x300, 600x450, 800x600, 1200x900, 1600x1200)
- Use `label` property on shapes for auto-centered text (preferred over separate text elements)
- Arrow bindings use `startBinding`/`endBinding` with `fixedPoint` coordinates
- For large diagrams: use camera pans between sections, draw cross-section arrows last

### Step 4: Auto-save working copy

**After EVERY `create_view` call**, immediately save the working copy:
```
export_to_file(checkpointId, "notes/{name}.excalidraw")
```
This ensures the file on disk always matches what's on screen. If the server crashes or Claude Code restarts, no work is lost.

### Step 5: Self-critique (diagrams > 6 elements)

After render + save, take a screenshot and visually inspect the result:

1. Call `mcp__excalidraw__get_screenshot()` — returns the rendered diagram as a PNG image
2. Inspect the image for:
   - [ ] Overlapping shapes or labels
   - [ ] Clipped text (label overflows box)
   - [ ] Missing title or centering issues
   - [ ] Arrows crossing through shapes they shouldn't
   - [ ] Font too small for camera size (see sizing table)
3. If `get_screenshot` fails (viewer not open), fall back to `query_elements` and check coordinates for obvious overlaps (shapes with < 30px gap)

If issues found: `restoreCheckpoint` → `delete` broken elements → redraw fixes → auto-save again. **Max 2 fix rounds**, then present as-is.

### Editing existing diagrams

For changes to the current session's diagram:
1. `restoreCheckpoint` from latest checkpointId + `delete` + new elements
2. Auto-save overwrites the working file

**Never reuse deleted IDs** — always assign new IDs to replacement elements.

### Resuming from a previous session

When the `.excalidraw` file exists but no checkpoint is available (new session):
1. Read the file — it contains a standard `elements` array
2. Use those elements as the base for a fresh `create_view` call
3. The new checkpoint becomes the working state
4. Continue with edits as normal

## Sizing Constants

These prevent overlapping and cramped layouts. Use them as minimums.

| Dimension | Value | Notes |
|-----------|-------|-------|
| **Box min size** | 200w x 60h | For labeled rectangles with 1-2 lines |
| **Box with PK/FK** | 220-280w x 65h | ERD table boxes |
| **Column gap** | 80-120px | Between adjacent boxes (no arrows) |
| **Labeled arrow gap** | 150-200px | Between boxes connected by labeled arrow |
| **Row gap** | 130-160px | Between rows of boxes |
| **Zone padding** | 50-60px | Around children inside a zone background |
| **Title offset** | y = top_element_y - 60 | Title text above diagram |
| **Zone x formula** | `leftmost_child_x - 50` | Zone left edge |
| **Zone width formula** | `rightmost_child_x + child_w + 50 - zone_x` | Zone total width |

### Font Size by Camera

| Camera | Size | Min body | Min title | Min annotation |
|--------|------|----------|-----------|----------------|
| S | 400x300 | 16 | 20 | 14 |
| M | 600x450 | 16 | 20 | 14 |
| L | 800x600 | 16 | 20 | 14 |
| XL | 1200x900 | 18 | 22 | 16 |
| XXL | 1600x1200 | 21 | 28 | 18 |

## Layout Templates

### Vertical Flow (3 layers)

Good for: architecture diagrams, data pipelines, process flows.

```
Camera: 800x600 at (0, -30)
Zone 1: x=20, y=20, w=760, h=150    (top layer)
Zone 2: x=20, y=220, w=760, h=150   (middle layer)
Zone 3: x=20, y=420, w=760, h=150   (bottom layer)

Boxes per zone: x=40 (col 1), x=300 (col 2), x=560 (col 3)
Box size: 200x60, fontSize 16
Arrow gap between zones: 50px
```

### Hub-and-Spoke

Good for: entity relationships, star schemas, feature maps.

```
Camera: 800x600 at (0, 0)
Hub: x=310, y=250, w=180, h=65 (center, thicker stroke)

Spokes at radius ~200px from hub center:
  Top:    x=340, y=50      (use fixedPoint [0.5,0] → hub [0.5,0])
  Right:  x=560, y=250     (use fixedPoint [0,0.5] → hub [1,0.5])
  Bottom: x=340, y=450     (use fixedPoint [0.5,0] → hub [0.5,1])
  Left:   x=60, y=250      (use fixedPoint [1,0.5] → hub [0,0.5])
  Diagonals: offset ±180px both axes
```

### ERD Grid (chunked)

Good for: database schemas, large entity models. Draw in chunks with camera pans.

```
Per chunk: 1200x900 camera
  Zone bg: chunk_color at opacity 30
  Tables: 220-280w x 65h, label "table_name\nPK: field(s)" fontSize 18
  Row spacing: 140px, Column spacing: 100-140px
  3-4 tables per row, 2-3 rows per chunk

Chunk layout (spatial):
  Chunk 1 (center-top)  → core/identity tables
  Chunk 2 (left)        → domain A
  Chunk 3 (right)       → domain B
  Chunk 4 (center-bottom) → joining/transactional tables
  Final: XXL camera overview + cross-chunk arrows
```

## Color-by-Role Mapping

For multi-component diagrams, use consistent colors per domain:

| Role | Fill | Stroke | Zone |
|------|------|--------|------|
| Core / Identity | `#a5d8ff` | `#4a9eed` | `#dbe4ff` |
| Data / Storage | `#b2f2bb` | `#22c55e` | `#d3f9d8` |
| Logic / Processing | `#d0bfff` | `#8b5cf6` | `#e5dbff` |
| External / API | `#ffd8a8` | `#f59e0b` | — |
| Errors / Critical | `#ffc9c9` | `#ef4444` | — |
| Analytics / Stats | `#eebefa` | `#ec4899` | — |
| Config / System | `#c3fae8` | `#06b6d4` | — |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Boxes overlap — coords too close | Enforce min gaps from sizing table |
| Label overflows box | Increase box width or shorten text |
| Arrow label vanishes | Arrow too short for label — increase gap to 150px+ |
| Font unreadable at zoom level | Check font size vs camera size table |
| Camera doesn't show all content | Content bounds + 100px padding on each side |
| Reused deleted ID | Always use fresh IDs after delete |
| Zone covers shapes | Zone must come BEFORE shapes in array (z-order) |

## Element JSON Syntax

Call `mcp__excalidraw__read_me()` in Step 1 for the JSON element format (property names, binding syntax, pseudo-elements like cameraUpdate/delete/restoreCheckpoint). That reference covers ONLY syntax — all design decisions (which colors, which sizes, which layout) are defined in THIS skill above.

## Viewer (localhost:4000)

When the MCP server starts in stdio mode (Claude Code CLI), it also launches an HTTP viewer at **http://localhost:4000**. Open this URL in your browser BEFORE drawing.

The viewer:
- Shows a "waiting for diagram" screen until you call `create_view`
- When `create_view` fires, elements stream to the browser via SSE
- Renders with animated hand-drawn Excalidraw styling
- Auto-updates on each new `create_view` call — no page refresh needed

**Before drawing, tell the user:** "Open http://localhost:4000 in your browser to see the diagram."

## Updating from Upstream

When the user asks to update the excalidraw MCP (e.g. "update remote repo and patch"), run these commands:

```bash
cd "D:/AI Playground/excalidraw-mcp"

# 1. Fetch latest from upstream
git fetch upstream

# 2. Check what's new
git log --oneline HEAD..upstream/main

# 3. Rebase our commits on top of upstream
git rebase upstream/main

# 4. If rebase conflicts — resolve using patches/ as reference
#    Our changes: callback in server.ts, viewer server in main.ts, new tools (export_to_file, query_elements)

# 5. Reinstall deps + rebuild
npm install && npm run build

# 6. Regenerate patch backup
git format-patch origin/main -o patches/

# 7. Tell user to restart Claude Code
```

If rebase fails badly: `git rebase --abort`, then `git reset --hard upstream/main && git am patches/*.patch`

Full details in `D:/AI Playground/excalidraw-mcp/UPDATE.md`.

## MCP Server Location

Built from source at: `D:\AI Playground\excalidraw-mcp`
Configured in `~/.claude.json` as stdio MCP server.

If the MCP tools aren't available, the server may need rebuilding:
```bash
cd "D:/AI Playground/excalidraw-mcp" && npm run build
```
Then restart Claude Code to pick up the MCP connection.
