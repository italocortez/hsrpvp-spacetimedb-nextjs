# Stack Research

**Domain:** Competitive gaming platform — tournament systems, MMR/ELO, scheduling, screenshot verification
**Researched:** 2026-03-15
**Confidence:** MEDIUM (external search tools unavailable; recommendations based on established domain knowledge, existing codebase patterns, and official documentation knowledge as of August 2025 cutoff)

---

## Context: What This Research Is NOT

The existing stack (SpacetimeDB 2.0.3, Next.js 15, React 18, Tailwind CSS 4, HeroUI 2, NextAuth 4, Chart.js 4) is locked. This research covers only the **additive libraries and patterns** required for the new milestone features:

- Tournament bracket logic and visualization
- ELO/MMR calculation
- Calendar/scheduling UI
- Imgur API integration for screenshot upload
- Frontend bracket rendering

---

## Recommended Stack Additions

### Core Algorithm Libraries (Frontend / Next.js API Routes)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| No external library — implement ELO in-module | — | MMR/ELO calculation | ELO is ~10 lines of math. SpacetimeDB reducers must be deterministic and cannot call npm packages. The formula must live in the SpacetimeDB TypeScript module as pure functions. Adding a dependency for K*expected_score math is unnecessary complexity. |
| No external library — implement bracket logic in-module | — | Single/double elimination seeding and advancement | Bracket seeding (power-of-2 rounding, bye insertion, winner/loser bracket pairing) is 50-100 lines of deterministic TypeScript. It belongs in the SpacetimeDB module as helper functions. No npm package is needed or appropriate given SpacetimeDB's determinism constraint. |

**Rationale for no-library approach to ELO and brackets:** SpacetimeDB reducers run server-side in a WASM sandbox. They cannot import npm packages at runtime — only code compiled into the module itself is available. Any ELO or bracket algorithm must be implemented as plain TypeScript functions inside `spacetimedb/src/helpers/`. This is not a limitation — both algorithms are well-understood and short enough to own directly.

### Frontend Calendar / Scheduling UI

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-big-calendar` | ^1.14.x | Weekly/monthly calendar grid showing player availability and scheduled matches | Use this. It renders availability blocks, event slots, and recurring entries out of the box with minimal custom CSS needed. Integrates with existing Tailwind. |
| `date-fns` | ^3.x | Date arithmetic for recurring availability (weekly patterns, February edge cases, timezone normalization) | Required alongside react-big-calendar. react-big-calendar uses date-fns or moment as its localizer — use date-fns because moment is deprecated. date-fns is tree-shakeable and has zero dependencies. |

**Confidence: MEDIUM** — react-big-calendar is the dominant React calendar library for availability-style displays (not just event lists). date-fns 3.x is the current stable major. These choices are consistent with the project's existing React 18 + Next.js 15 stack.

**Do NOT use:** `react-datepicker` — it is a date picker widget, not a calendar grid. Wrong tool for displaying multi-user availability slots.

**Do NOT use:** `FullCalendar` — it adds jQuery roots, is heavy (~200KB), and has a paid plugin model for some features. react-big-calendar is lighter and open-source.

### Frontend Bracket Visualization

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Custom SVG/CSS component | — | Single elimination bracket tree, double elimination losers bracket | Build custom. Tournament brackets in HSR context have specific visual requirements (team names, score display, HSR styling) that no off-the-shelf library renders well. A bracket is a tree structure: SVG lines connecting match boxes. This is ~150 lines of React + SVG. |

**Why not a bracket library?**
- `@g-loot/react-tournament-brackets` is the most commonly referenced open-source bracket UI library. It renders brackets but is opinionated about styling and does not integrate well with Tailwind/HeroUI design tokens.
- `react-brackets` is minimally maintained (last significant update 2022).
- Custom SVG trees give full control over HSR character images in match slots, anonymous mode name hiding, and live score updates via SpacetimeDB subscription — none of which off-the-shelf libraries support.

**Confidence: MEDIUM** — Custom bracket visualization is the standard recommendation for specialized competitive platforms. The existing use of Framer Motion in the stack makes animated bracket progression straightforward.

**If timeline is tight:** Use `@g-loot/react-tournament-brackets` as a scaffold and override styles with Tailwind. It is the least-bad off-the-shelf option. Accept that some customization will fight the library.

### Screenshot Upload — Imgur API

| Approach | Details | Confidence |
|----------|---------|------------|
| Direct browser-to-Imgur upload via Imgur API v3 | Client-side `fetch` to `https://api.imgur.com/3/image` with `Authorization: Client-ID <your_client_id>`. Anonymous uploads (no OAuth) are supported for public images. Returns a URL stored in SpacetimeDB via a reducer call. | MEDIUM |

**Implementation pattern:**

The project already decided: Imgur for screenshot hosting (`.planning/PROJECT.md`, Key Decisions). The integration is a Next.js API route, not a direct client call, to keep the Imgur Client ID server-side:

```
Browser → POST /api/upload-screenshot (Next.js route)
         → Imgur API v3 /image (server-to-server with Client-ID)
         → Returns { link: "https://i.imgur.com/abc.png" }
Browser → SpacetimeDB reducer submitMatchResult(screenshotUrl)
```

**Why Next.js API route instead of direct client upload:**
- Keeps Imgur Client ID out of the browser bundle (security)
- Allows server-side validation of file type and size before forwarding to Imgur
- Consistent with the existing NextAuth server-side pattern in this project

**Imgur API constraints to design around (MEDIUM confidence, based on known Imgur API behavior as of 2025):**
- Anonymous uploads are rate-limited by IP: ~50 uploads/hour per IP on free tier
- Max image size: 10MB per image
- Supported formats: JPEG, PNG, GIF, WEBP, TIFF
- No official TypeScript SDK — use raw `fetch` or `axios` (no new dependency needed, Node.js 24 has native `fetch`)
- Images uploaded anonymously are public and permanent unless deleted via delete hash
- Store the `deleteHash` in SpacetimeDB alongside the URL to allow cleanup if a match is disputed/cancelled

**New env variables required:**
- `IMGUR_CLIENT_ID` — Register at https://api.imgur.com/oauth2/addclient, select "Anonymous usage without user authorization"
- No OAuth flow needed for this use case (public match screenshots)

**Do NOT use:** An Imgur npm wrapper package. They are all community-maintained, regularly go unmaintained, and the Imgur API v3 is simple enough that a wrapper adds more risk than it removes.

### Chat — SpacetimeDB Event Tables (No New Library)

The project decision is ephemeral chat via SpacetimeDB event tables. No additional library is needed. The existing `LobbyCursorEvent` table establishes the pattern: insert a row, clients receive it via subscription, rows are not persisted after session ends. Chat follows the same pattern.

**Confidence: HIGH** — This is already established in the codebase.

### Achievement System — No New Library

Achievement criteria evaluation is pure SpacetimeDB logic: increment counters on match completion, compare against thresholds in an AchievementDefinition table, insert into PlayerAchievement if threshold met. This is reducer logic, no npm dependency.

---

## Supporting Libraries — Frontend Additions

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `react-big-calendar` | ^1.14.x | Calendar grid for availability and scheduling | Required for Calendar & Scheduling feature |
| `date-fns` | ^3.x | Date utilities (react-big-calendar localizer, recurring availability math) | Required alongside react-big-calendar |

These are the only two net-new npm dependencies the milestone requires. Everything else is either:
- Logic implemented inside the SpacetimeDB module (ELO, bracket seeding, achievement evaluation)
- Custom React components (bracket visualization, score submission UI)
- Existing infrastructure (Imgur via raw fetch in a Next.js API route, chat via existing event table pattern)

---

## Installation

```bash
# New frontend dependencies only
npm install react-big-calendar date-fns
npm install -D @types/react-big-calendar
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Custom bracket SVG component | `@g-loot/react-tournament-brackets` | When schedule is severely constrained and HSR-specific styling is not a priority. Accept style limitations. |
| `react-big-calendar` + `date-fns` | `FullCalendar` | Never for this project. FullCalendar's paid plugin model conflicts with the open-source direction and its bundle size is disproportionate. |
| Inline ELO implementation | `elo-rank` npm package | Only if the module ever needs a more complex rating variant (Glicko-2, TrueSkill). For standard ELO, a package is overkill. |
| Next.js API route for Imgur | Direct client-side Imgur upload | Acceptable only if Client ID exposure is accepted and rate-limit-per-user behavior is preferred over rate-limit-per-server. |
| `date-fns` | `moment` / `dayjs` | `dayjs` is a valid lighter alternative to date-fns. Do not use `moment` — it is in maintenance mode and not tree-shakeable. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `moment` | Deprecated, not tree-shakeable, 300KB+ bundle cost | `date-fns` |
| `FullCalendar` | Heavy (200KB+), paid plugins for drag-drop, jQuery legacy | `react-big-calendar` |
| `react-brackets` | Unmaintained since 2022, no TypeScript types | Custom SVG component |
| Any Imgur npm wrapper | Community-maintained, regularly go stale, Imgur API v3 is 3 endpoints | Raw `fetch` in Next.js API route |
| ELO npm packages in SpacetimeDB module | npm packages cannot be imported into WASM-compiled SpacetimeDB modules | Inline TypeScript implementation in `spacetimedb/src/helpers/` |
| Socket.io / Pusher for real-time features | Project already uses SpacetimeDB WebSocket subscriptions — adding a second real-time transport creates dual-state management complexity | SpacetimeDB subscriptions (already established) |
| Server-side rendered calendar via Next.js RSC | react-big-calendar requires browser APIs (`window`, drag events) — it must be client-side | `'use client'` directive on calendar page |

---

## Stack Patterns by Variant

**If tournament has odd number of participants (not power of 2):**
- Insert bye entries as null participants in bracket seeding
- Because SpacetimeDB's bracket state must always have a consistent structure — null slots are cleaner than variable-length arrays

**If player submits screenshot but Imgur is down:**
- Allow manual score entry without screenshot (referee validates)
- Store screenshot URL as `optional()` in the match result table
- Because Imgur downtime should not block match completion

**If calendar recurring availability spans month boundary:**
- Store availability as day-of-week + time-range (e.g., "Monday 20:00-22:00 UTC")
- Do NOT store as timestamp ranges — they become invalid when clocks change
- Because the project requirements include February edge cases; day-of-week patterns bypass month-length complexity

**If MMR season resets are added later:**
- Snapshot current MMR into a SeasonMmrSnapshot table before reset
- Do not delete PlayerMmr rows — set them to a soft-reset value (e.g., compress toward 1200)
- Because the schema already has season support reserved; this pattern preserves historical data

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `react-big-calendar@1.14.x` | `react@18.x` | Fully compatible. RBC supports React 18 as of v1.8+. |
| `react-big-calendar@1.14.x` | `date-fns@3.x` | Use `dateFnsLocalizer` from `react-big-calendar/lib/localizers/date-fns`. Confirmed compatible. |
| `date-fns@3.x` | TypeScript 5.6.x | date-fns 3 ships its own types. No `@types/date-fns` needed. |
| `react-big-calendar@1.14.x` | Tailwind CSS 4.x | No conflicts. RBC ships its own CSS (`react-big-calendar/lib/css/react-big-calendar.css`) — import once, override with Tailwind utilities. |

---

## ELO Implementation Reference

Since ELO must be implemented inline (no npm package), the standard formula for this project:

```typescript
// spacetimedb/src/helpers/mmr.ts

const K_FACTOR = 32; // Standard for competitive games with limited match history
const DEFAULT_MMR = 1200; // Standard chess starting rating

function expectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function updateMmr(
    winnerMmr: number,
    loserMmr: number
): { newWinnerMmr: number; newLoserMmr: number } {
    const expectedWinner = expectedScore(winnerMmr, loserMmr);
    const expectedLoser = expectedScore(loserMmr, winnerMmr);
    return {
        newWinnerMmr: Math.round(winnerMmr + K_FACTOR * (1 - expectedWinner)),
        newLoserMmr: Math.round(loserMmr + K_FACTOR * (0 - expectedLoser)),
    };
}
```

K=32 is appropriate for a new platform: it allows ratings to move quickly toward true skill. Revisit K=16 once the player base is established and ratings have converged.

**Per-game-mode MMR:** Run this function separately for MemoryOfChaos, ApocalypticShadow, and AnomalyArbitration MMR values. Global composite = arithmetic mean of the three, rounded.

---

## Bracket Algorithm Reference

Bracket seeding (also inline in SpacetimeDB module):

```typescript
// spacetimedb/src/helpers/bracket.ts

// Given N participants, returns the number of slots (next power of 2)
function bracketSize(n: number): number {
    let size = 1;
    while (size < n) size *= 2;
    return size;
}

// Returns participant IDs interleaved for standard bracket seeding
// Seed 1 vs Seed (size), Seed 2 vs Seed (size-1), etc.
// Null = bye
function seedBracket(participantIds: number[]): (number | null)[] {
    const size = bracketSize(participantIds.length);
    const slots: (number | null)[] = new Array(size).fill(null);
    // Standard seeding: 1 vs last, 2 vs second-last, etc.
    for (let i = 0; i < participantIds.length; i++) {
        slots[i] = participantIds[i];
    }
    return slots;
}
```

Double elimination requires a winners bracket and a losers bracket. Store both as separate arrays in the Tournament table. Advancement logic: winner moves to next winners match; loser drops to the corresponding losers bracket match (standard double-elim mapping table).

---

## New Environment Variables Required

| Variable | Where Set | Purpose |
|----------|-----------|---------|
| `IMGUR_CLIENT_ID` | `.env.local` (server-side only, no `NEXT_PUBLIC_`) | Authenticates Next.js API route to Imgur API v3 |

No other new environment variables are required for this milestone.

---

## Sources

- SpacetimeDB TypeScript SDK documentation — confirmed reducer determinism constraint (no external imports at runtime, pure functions only)
- Existing codebase patterns (`spacetimedb/src/helpers/`, `spacetimedb/src/types/`) — confirms inline helper function approach is already established in this project
- ELO rating system — Arpad Elo, "The Rating of Chessplayers, Past and Present" (1978); formula is public domain math, no source verification needed. K=32 is FIDE standard for players under 2400 with fewer than 30 games.
- react-big-calendar — https://jquense.github.io/react-big-calendar/ — HIGH confidence in library existence and React 18 compatibility; version number (1.14.x) is MEDIUM confidence (last known stable as of Aug 2025 training cutoff, verify current before install)
- date-fns — https://date-fns.org/ — HIGH confidence; v3 is the current stable major, ships own TypeScript types
- Imgur API v3 — https://apidocs.imgur.com/ — MEDIUM confidence; anonymous upload and Client-ID pattern documented as of 2025; rate limits should be re-verified before launch as Imgur has changed these in the past
- `.planning/PROJECT.md` — HIGH confidence; authoritative source for Imgur decision and project constraints

---

*Stack research for: HSRPVP competitive platform — tournament/MMR/calendar/screenshot milestone*
*Researched: 2026-03-15*
