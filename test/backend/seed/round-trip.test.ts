/**
 * Phase 15, D-21a — post-publish.ts reseed round-trip: clean DB reseed lands
 * Spine + positioning + 3-mode cost rows for all three cost tables.
 *
 * The integration-suite global setup (test/global-setup.ts) runs
 * `spacetime publish --clear-database` + `npx tsx scripts/post-publish.ts` once
 * before the suite. This test asserts the resulting state on maincloud —
 * i.e. the Plan 05 seed rewrite honored the D-22 canonical template shape
 * end-to-end against the Plan 02 schema and Plan 03 router.
 *
 * Assertions target invariants (row shape, column presence, 3-mode count)
 * rather than exact row totals, because the seeded data files evolve
 * independently (characters_table.json grows with patches etc.).
 */

import { describe, it, expect } from 'vitest';
import { hasServerToken, queryPrivateTable } from '../../shared/connection';

describe.skipIf(!hasServerToken())('Phase 15 seed round-trip — clean DB reseed (D-21a)', () => {
    it('HsrCharacter rows have Spine + positioning columns populated (D-05, D-05a)', async () => {
        const rows = await queryPrivateTable(
            `SELECT name, skel_url, atlas_url, atlas_img_urls, pos_x, pos_y, width FROM hsr_character LIMIT 10`
        );
        expect(rows.length).toBeGreaterThan(0);

        for (const r of rows) {
            // Positioning columns must be defined (required i32, 0 default).
            expect(r.pos_x).toBeDefined();
            expect(r.pos_y).toBeDefined();
            expect(r.width).toBeDefined();
            // Numeric parse must succeed (rejects unset / null / malformed).
            expect(Number.isFinite(Number(r.pos_x))).toBe(true);
            expect(Number.isFinite(Number(r.pos_y))).toBe(true);
            expect(Number.isFinite(Number(r.width))).toBe(true);
            // Optional Spine columns present (may be "(none = ())" or "(some = ...)"):
            expect(r.skel_url).toBeDefined();
            expect(r.atlas_url).toBeDefined();
            // atlasImgUrls is an array column — present, may be empty.
            expect(r.atlas_img_urls).toBeDefined();
        }
    });

    it('HsrCharacterCost has all 3 game modes (D-22 3-mode fan-out)', async () => {
        // SpacetimeDB SQL does not support SELECT DISTINCT — fetch rows then dedupe.
        const rows = await queryPrivateTable(
            `SELECT game_mode FROM hsr_character_cost LIMIT 300`
        );
        const modesStr = rows.map(r => String(r.game_mode)).join(' ').toLowerCase();
        expect(modesStr).toContain('memoryofchaos');
        expect(modesStr).toContain('apocalypticshadow');
        expect(modesStr).toContain('anomalyarbitration');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('HsrLightconeCost has 3 game modes (LIGHTCONE_GAME_MODES 2-mode constant dropped)', async () => {
        const rows = await queryPrivateTable(
            `SELECT game_mode FROM hsr_lightcone_cost LIMIT 300`
        );
        const modesStr = rows.map(r => String(r.game_mode)).join(' ').toLowerCase();
        expect(modesStr).toContain('memoryofchaos');
        expect(modesStr).toContain('apocalypticshadow');
        expect(modesStr).toContain('anomalyarbitration');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('HsrSynergyCost has 3 game modes (pairing fan-out covers anomaly_arbitration)', async () => {
        const rows = await queryPrivateTable(
            `SELECT game_mode FROM hsr_synergy_cost LIMIT 300`
        );
        const modesStr = rows.map(r => String(r.game_mode)).join(' ').toLowerCase();
        expect(modesStr).toContain('memoryofchaos');
        expect(modesStr).toContain('apocalypticshadow');
        expect(modesStr).toContain('anomalyarbitration');
        expect(rows.length).toBeGreaterThan(0);
    });

    it('costSetId=0 is the default sentinel present in all three cost tables', async () => {
        // Note: SpacetimeDB requires explicit uppercase AS for aggregate aliases.
        const charDefaults = await queryPrivateTable(
            `SELECT COUNT(*) AS c FROM hsr_character_cost WHERE cost_set_id = 0`
        );
        const lcDefaults = await queryPrivateTable(
            `SELECT COUNT(*) AS c FROM hsr_lightcone_cost WHERE cost_set_id = 0`
        );
        const synDefaults = await queryPrivateTable(
            `SELECT COUNT(*) AS c FROM hsr_synergy_cost WHERE cost_set_id = 0`
        );
        expect(Number(charDefaults[0]?.c ?? 0)).toBeGreaterThan(0);
        expect(Number(lcDefaults[0]?.c ?? 0)).toBeGreaterThan(0);
        expect(Number(synDefaults[0]?.c ?? 0)).toBeGreaterThan(0);
    });
});
