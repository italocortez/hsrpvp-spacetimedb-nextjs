/**
 * Phase 15, D-08/D-10, D-21 — admin_bulk_upsert partial-update preservation.
 *
 * Wire convention under test (see spacetimedb/src/reducers/admin.ts:73-98):
 *   - Every EXPECTED_KEYS entry must appear in the incoming JSON row
 *     (validateKeys strict-key contract).
 *   - `null` on an EXISTING row = "preserve this field" (do not overwrite).
 *   - `null` on an INSERT row = "apply schema default" (required columns)
 *     OR "stay null" (optional columns: skelUrl, atlasUrl).
 *   - Non-null value = "set to this value".
 *
 * This file is the regression guard for the pre-Plan-03 bug where the router
 * built full rows with aggressive default injection (e.g. `r.imageUrl || ''`)
 * and then spread them over existing rows, silently zeroing every unsent field.
 *
 * Contract: docs/admin/contract.md (Phase 15 partial-update scenarios — to be
 * added post-execution per project rule).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
    createVerifiedTestHarness,
    hasServerToken,
    queryPrivateTable,
    type TestHarness,
} from '../../../shared/connection';
import { promoteToRole } from '../../../shared/helpers/promoteUser';

// Test data namespace to avoid collisions with seeded characters / lightcones.
const TEST_CHAR = 'pu-test-char';
const TEST_LC = 'pu-test-lc';

const fullEidolonCost = (base: number) => ({
    e0: base,
    e1: base + 1,
    e2: base + 2,
    e3: base + 3,
    e4: base + 4,
    e5: base + 5,
    e6: base + 6,
});

describe.skipIf(!hasServerToken())('admin_bulk_upsert — partial-update preservation (D-08/D-10)', () => {
    let admin: TestHarness;

    beforeAll(async () => {
        admin = await createVerifiedTestHarness();
        await promoteToRole(admin, 'Admin');
        await admin.sync(1000);
    }, 60000);

    afterAll(async () => {
        await admin?.disconnect();
    });

    it('HsrCharacter: updating skelUrl alone preserves imageUrl, displayName, posX, etc.', async () => {
        // Seed a fully populated row.
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacter',
            jsonData: JSON.stringify([{
                name: TEST_CHAR,
                displayName: 'Partial Update Test',
                aliases: ['alpha', 'beta'],
                rarity: 5,
                path: 'Destruction',
                element: 'Physical',
                role: 'Dps',
                imageUrl: 'https://img.orig',
                versionReleased: 1.0,
                treatAsVersion: 1.0,
                skelUrl: 'https://skel.orig',
                atlasUrl: 'https://atlas.orig',
                atlasImgUrls: ['a.png'],
                posX: 10,
                posY: 20,
                width: 300,
            }]),
        });
        await admin.sync(1000);

        // Partial update: change ONLY skelUrl; every other key is null.
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacter',
            jsonData: JSON.stringify([{
                name: TEST_CHAR,
                displayName: null,
                aliases: null,
                rarity: null,
                path: null,
                element: null,
                role: null,
                imageUrl: null,
                versionReleased: null,
                treatAsVersion: null,
                skelUrl: 'https://skel.NEW',
                atlasUrl: null,
                atlasImgUrls: null,
                posX: null,
                posY: null,
                width: null,
            }]),
        });
        await admin.sync(1000);

        const rows = await queryPrivateTable(
            `SELECT * FROM hsr_character WHERE name = '${TEST_CHAR}'`
        );
        expect(rows.length).toBe(1);
        const row = rows[0];

        // Field under change:
        expect(row.skel_url).toContain('skel.NEW');

        // Preserved fields (the whole point of partial update):
        expect(row.display_name).toContain('Partial Update Test');
        expect(row.image_url).toContain('img.orig');
        expect(row.atlas_url).toContain('atlas.orig');
        expect(Number(row.pos_x)).toBe(10);
        expect(Number(row.pos_y)).toBe(20);
        expect(Number(row.width)).toBe(300);
        expect(Number(row.rarity)).toBe(5);
    });

    it('HsrLightcone: partial update preserves unsent fields', async () => {
        await admin.call.adminBulkUpsert({
            tableName: 'HsrLightcone',
            jsonData: JSON.stringify([{
                name: TEST_LC,
                displayName: 'PU LC',
                aliases: ['lc-alpha'],
                path: 'Destruction',
                rarity: 5,
                imageUrl: 'https://lc.orig',
                posX: 5,
                posY: 15,
                width: 250,
            }]),
        });
        await admin.sync(1000);

        // Change only imageUrl.
        await admin.call.adminBulkUpsert({
            tableName: 'HsrLightcone',
            jsonData: JSON.stringify([{
                name: TEST_LC,
                displayName: null,
                aliases: null,
                path: null,
                rarity: null,
                imageUrl: 'https://lc.NEW',
                posX: null,
                posY: null,
                width: null,
            }]),
        });
        await admin.sync(1000);

        const rows = await queryPrivateTable(
            `SELECT * FROM hsr_lightcone WHERE name = '${TEST_LC}'`
        );
        expect(rows.length).toBe(1);
        const row = rows[0];
        expect(row.image_url).toContain('lc.NEW');
        expect(row.display_name).toContain('PU LC');
        expect(Number(row.pos_x)).toBe(5);
        expect(Number(row.pos_y)).toBe(15);
        expect(Number(row.width)).toBe(250);
        expect(Number(row.rarity)).toBe(5);
    });

    it('Insert branch applies schema defaults when fields null on NEW row', async () => {
        const INSERT_CHAR = 'pu-insert-defaults';
        await admin.call.adminBulkUpsert({
            tableName: 'HsrCharacter',
            jsonData: JSON.stringify([{
                name: INSERT_CHAR,
                displayName: null,
                aliases: null,
                rarity: null,
                path: 'Destruction',      // required enum must be present on insert
                element: 'Physical',
                role: 'Dps',
                imageUrl: null,
                versionReleased: null,
                treatAsVersion: null,
                skelUrl: null,
                atlasUrl: null,
                atlasImgUrls: null,
                posX: null,
                posY: null,
                width: null,
            }]),
        });
        await admin.sync(1000);

        const rows = await queryPrivateTable(
            `SELECT * FROM hsr_character WHERE name = '${INSERT_CHAR}'`
        );
        expect(rows.length).toBe(1);
        const row = rows[0];
        // Required columns: default-injected (empty string / 0 / []).
        expect(row.display_name === '""' || row.display_name === '').toBe(true);
        expect(Number(row.rarity)).toBe(0);
        expect(Number(row.pos_x)).toBe(0);
        expect(Number(row.pos_y)).toBe(0);
        expect(Number(row.width)).toBe(0);
        // Optional columns (skelUrl / atlasUrl): stay null.
        // atlasImgUrls: [] default.
    });
});
