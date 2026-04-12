# Phase 11: Account Rating — Examples & Calculation Flow

**Reference only** — not an implementation spec. For sharing/discussion purposes.

## Role-Based Account Examples

Formula: 40% vertical (eidolon depth x age weight) + 60% horizontal (archetype coverage). Normalized so all-chars-at-E6 = 1000.

| Account | Roster | Eidolons | Rating | Why |
|---------|--------|----------|--------|-----|
| Mega Whale | 20 DPS, 12 Sup, 8 Sus (40) | DPS E4, rest E2 | 836 | Huge breadth + solid eidolons |
| E6 Collector | 4 DPS, 2 Sup, 2 Sus (8) | All E6 | 764 | Maxed eidolons carry vertical (88%), but only 8 chars limits archetypes (42%) |
| Balanced Veteran | 8 DPS, 8 Sup, 6 Sus (22) | All E1 | 694 | Best archetype coverage (76%) of the mid-tier — breadth beats depth |
| Support Main | 3 DPS, 10 Sup, 5 Sus (18) | Sup E2, Sus E1, DPS E0 | 651 | Good coverage but DPS gaps hurt horizontal |
| DPS Whale | 12 DPS, 2 Sup, 2 Sus (16) | DPS E2, rest E0 | 643 | 12 DPS covers many archetypes but support/sustain gaps drag horizontal down |
| Sustain Hoarder | 3 DPS, 3 Sup, 8 Sus (14) | Sus E3, rest E0 | 561 | Heavy sustain investment but sustains share few archetypes |
| New F2P | 5 DPS, 2 Sup, 1 Sus (8) | All E0 | 376 | Small roster, low investment |

Key takeaways:
- Breadth wins: Balanced Veteran (694) beats DPS Whale (643) and Support Main (651) despite lower eidolons
- Eidolons still matter: E6 Collector (764) punches above their roster size
- Older DPS characters contribute less to rating (age decay x role exponent 2.0)
- Supports/sustains retain value longer (exponents 1.3 and 1.0)

## Calculation Flow

### Step 1 — Age Weight (per character in the game)

Each character has a relevance weight based on release patch and role. Newer = more relevant. DPS lose relevance fastest, sustains keep it longest.

```
version = treatAsVersion > 0 ? treatAsVersion : versionReleased
effective = floor(version) + (version - floor(version)) x compression
age_weight = sqrt(effective / max_version) ^ role_exponent
```

Sample outputs:
- Acheron (DPS, patch 2.1): 0.28
- Robin (Support, patch 2.2): 0.63
- Fu Xuan (Sustain, patch 1.3): 0.52
- Aglaea (DPS, patch 3.0): 0.75

### Step 2 — Vertical Score ("How invested are your characters?")

For each owned character: `depth = ((1 + eidolonLevel) / 7) x age_weight`
Then average across all owned characters.

```
Account owns: Acheron E2, Robin E0, Fu Xuan E1
  Acheron E2:  (3/7) x 0.28 = 0.12
  Robin E0:    (1/7) x 0.63 = 0.09
  Fu Xuan E1:  (2/7) x 0.52 = 0.15
  Vertical = mean(0.12, 0.09, 0.15) = 0.12  (12%)
```

### Step 3 — Horizontal Score ("How many playstyles can you field?")

12 archetypes in the game. For each, check how many of YOUR characters belong to it (weighted by age):

```
Archetype "Debuff" (18 chars in game, threshold=3):
  Account owns 2: Acheron (0.28) + Kafka (0.13)
  Ownership = min((0.28 + 0.13) / 3, 1.0) = 13.7%

Archetype "Elation" (2 chars, threshold=min(3,2)=2):
  Account owns 0.  Ownership = 0%
```

Average ownership across all 12 archetypes = horizontal score.

### Step 4 — Combine + Normalize

```
combined = vertical x 0.4 + horizontal x 0.6
maxPossible = combined score if account owned ALL chars at E6 (~0.789)
rating = round((combined / maxPossible) x 1000)
```

### Worked Comparison

**Balanced Veteran** (8 DPS E1, 8 Support E1, 6 Sustain E1):

| Step | Value |
|------|-------|
| Vertical (avg depth per char) | 22.7% |
| Horizontal (archetype coverage) | 76.1% |
| Combined | 0.227 x 0.4 + 0.761 x 0.6 = 0.548 |
| Normalized | 0.548 / 0.789 x 1000 = **694** |

**E6 Collector** (4 DPS E6, 2 Support E6, 2 Sustain E6):

| Step | Value |
|------|-------|
| Vertical | 88.0% — maxed eidolons |
| Horizontal | 41.8% — only 8 chars, limited archetypes |
| Combined | 0.880 x 0.4 + 0.418 x 0.6 = 0.603 |
| Normalized | 0.603 / 0.789 x 1000 = **764** |

E6 Collector has 4x the eidolons but only 70 more rating points — breadth matters.
