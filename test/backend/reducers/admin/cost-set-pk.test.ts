/**
 * Phase 15, D-09, D-21 — HsrCharacterCost / HsrLightconeCost / HsrSynergyCost:
 * distinct costSetId rows must not collide on admin_bulk_upsert.
 *
 * Regression guard for the pre-Plan-03 bug where the existence check matched on
 * `(characterName, gameMode)` only — silently overwriting a non-default cost
 * set (costSetId=5) whenever the default set (costSetId=0) was upserted.
 *
 * The fix (admin.ts:478-486 for HsrCharacterCost, :528-535 for HsrLightconeCost,
 * :574-583 for HsrSynergyCost) matches on the full composite tuple INCLUDING
 * costSetId — this file asserts distinct cost sets coexist and the default set
 * does not overwrite a non-default one.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createVerifiedTestHarness,
    hasServerToken,
    queryPrivateTable,
    type TestHarness,
} from '../../../shared/connection';
import { promoteToRole } from '../../../shared/helpers/promoteUser';

// Distinct namespaces to avoid collision with seeded data.
const TEST_CHAR = 'cs-test-char';
const TEST_LC = 'cs-test-lc';
const TEST_SRC = 'cs-test-src';
const TEST_TGT = 'cs-test-tgt';

const eidolonCost = (base: number) => ({
    e0: base, e1: base, e2: base, e3: base, e4: base, e5: base, e6: base,
});

const superpositionCost = (base: number) => ({
    s1: base, s2: base, s3: base, s4: base, s5: base,
});

describe.skipIf(!hasServerToken())('admin_bulk_upsert — costSetId PK tuple isolation (D-09)', () => {
    let admin: TestHarness;

    beforeAll(async () => {
        admin = await createVerifiedTestHarness();
        await promoteToRole(admin, 'Admin');
        await admin.sync(1000);

        // Ensure parent rows exist so the cost rows are well-formed.
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacter',
            jsonData: JSON.stringify([{
                name: TEST_CHAR, displayName: 'CS', aliases: [], rarity: 5,
                path: 'Destruction', element: 'Physical', role: 'Dps',
                imageUrl: '', versionReleased: 1, treatAsVersion: 1,
                skelUrl: null, atlasUrl: null, atlasImgUrls: [],
                posX: 0, posY: 0, width: 0,
            }, {
                name: TEST_SRC, displayName: 'CS Src', aliases: [], rarity: 5,
                path: 'Destruction', element: 'Physical', role: 'Dps',
                imageUrl: '', versionReleased: 1, treatAsVersion: 1,
                skelUrl: null, atlasUrl: null, atlasImgUrls: [],
                posX: 0, posY: 0, width: 0,
            }, {
                name: TEST_TGT, displayName: 'CS Tgt', aliases: [], rarity: 5,
                path: 'Destruction', element: 'Physical', role: 'Dps',
                imageUrl: '', versionReleased: 1, treatAsVersion: 1,
                skelUrl: null, atlasUrl: null, atlasImgUrls: [],
                posX: 0, posY: 0, width: 0,
            }]),
        });
        await admin.call.adminBulkUpsert({
            tableName: 'HsrLightcone',
            jsonData: JSON.stringify([{
                name: TEST_LC, displayName: 'CS LC', aliases: [],
                path: 'Destruction', rarity: 5, imageUrl: '',
                posX: 0, posY: 0, width: 0,
            }]),
        });
        await admin.sync(1000);
    }, 60000);

    afterAll(async () => {
        await admin?.disconnect();
    });

    it('HsrCharacterCost: costSetId=0 and costSetId=5 rows for same (characterName, gameMode) coexist', async () => {
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacterCost',
            jsonData: JSON.stringify([
                {
                    characterName: TEST_CHAR,
                    gameMode: 'MemoryOfChaos',
                    classicCosts: eidolonCost(10),
                    auctionBaseBid: eidolonCost(10),
                    costSetId: 0,
                },
                {
                    characterName: TEST_CHAR,
                    gameMode: 'MemoryOfChaos',
                    classicCosts: eidolonCost(20),
                    auctionBaseBid: eidolonCost(20),
                    costSetId: 5,
                },
            ]),
        });
        await admin.sync(1000);

        const rows = await queryPrivateTable(
            `SELECT cost_set_id FROM hsr_character_cost WHERE character_name = '${TEST_CHAR}'`
        );
        const setIds = rows.map(r => Number(r.cost_set_id)).sort();
        expect(setIds).toContain(0);
        expect(setIds).toContain(5);
        expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('HsrLightconeCost: distinct costSetId rows coexist', async () => {
        await admin.call.adminBulkUpsert({
            tableName: 'HsrLightconeCost',
            jsonData: JSON.stringify([
                {
                    lightconeName: TEST_LC,
                    gameMode: 'MemoryOfChaos',
                    classicCosts: superpositionCost(10),
                    auctionBaseBid: superpositionCost(10),
                    costSetId: 0,
                },
                {
                    lightconeName: TEST_LC,
                    gameMode: 'MemoryOfChaos',
                    classicCosts: superpositionCost(99),
                    auctionBaseBid: superpositionCost(99),
                    costSetId: 7,
                },
            ]),
        });
        await admin.sync(1000);

        const rows = await queryPrivateTable(
            `SELECT cost_set_id FROM hsr_lightcone_cost WHERE lightcone_name = '${TEST_LC}'`
        );
        const setIds = rows.map(r => Number(r.cost_set_id)).sort();
        expect(setIds).toContain(0);
        expect(setIds).toContain(7);
        expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('HsrSynergyCost: distinct costSetId rows coexist for same (source, target, mode)', async () => {
        await admin.call.adminBulkUpsert({
            tableName: 'HsrSynergyCost',
            jsonData: JSON.stringify([
                {
                    sourceName: TEST_SRC,
                    targetName: TEST_TGT,
                    gameMode: 'MemoryOfChaos',
                    costModifier: 0.5,
                    costSetId: 0,
                },
                {
                    sourceName: TEST_SRC,
                    targetName: TEST_TGT,
                    gameMode: 'MemoryOfChaos',
                    costModifier: 1.5,
                    costSetId: 3,
                },
            ]),
        });
        await admin.sync(1000);

        const rows = await queryPrivateTable(
            `SELECT cost_set_id, cost_modifier FROM hsr_synergy_cost WHERE source_name = '${TEST_SRC}' AND target_name = '${TEST_TGT}'`
        );
        const setIds = rows.map(r => Number(r.cost_set_id)).sort();
        expect(setIds).toContain(0);
        expect(setIds).toContain(3);
        expect(rows.length).toBeGreaterThanOrEqual(2);
    });

    it('Re-seeding with costSetId=0 does NOT overwrite a pre-existing costSetId=5 row (live bug regression)', async () => {
        // Seed a custom cost set first.
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacterCost',
            jsonData: JSON.stringify([{
                characterName: TEST_CHAR,
                gameMode: 'ApocalypticShadow',
                classicCosts: eidolonCost(99),
                auctionBaseBid: eidolonCost(99),
                costSetId: 5,
            }]),
        });
        await admin.sync(500);

        // Then upsert the default set (costSetId=0) for the same (char, mode).
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacterCost',
            jsonData: JSON.stringify([{
                characterName: TEST_CHAR,
                gameMode: 'ApocalypticShadow',
                classicCosts: eidolonCost(1),
                auctionBaseBid: eidolonCost(1),
                costSetId: 0,
            }]),
        });
        await admin.sync(1000);

        // The costSetId=5 row must still exist with its custom values untouched.
        // Note: spacetime SQL cannot parse enum tag literals for game_mode, so
        // filter in JS after the SQL WHERE on the scalar columns.
        const set5All = await queryPrivateTable(
            `SELECT cost_set_id, game_mode, classic_costs FROM hsr_character_cost
             WHERE character_name = '${TEST_CHAR}' AND cost_set_id = 5`
        );
        const set5 = set5All.filter((r: any) => String(r.game_mode).toLowerCase().includes('apocalypticshadow'));
        expect(set5.length).toBe(1);  // exactly one — extra rows indicate a different regression
        // classic_costs comes back as a tuple literal "(e_0 = 99, e_1 = 99, ...)"; grep e_0.
        const e0Match = String(set5[0].classic_costs).match(/e_0\s*=\s*(-?\d+)/);
        expect(e0Match).not.toBeNull();
        expect(Number(e0Match![1])).toBe(99);  // custom value survived, not overwritten to 1

        const set0 = await queryPrivateTable(
            `SELECT cost_set_id FROM hsr_character_cost
             WHERE character_name = '${TEST_CHAR}' AND cost_set_id = 0`
        );
        // Pre-existing set=0 row for MemoryOfChaos + newly inserted set=0 for ApocalypticShadow
        expect(set0.length).toBe(2);  // exact count — catches duplicate-insert bugs
    });
});
