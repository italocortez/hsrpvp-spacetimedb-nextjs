'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useReducer, useTable } from 'spacetimedb/react';
import { reducers, tables } from '@/src/module_bindings';
import { UPSERT_TABLES, UpsertTableName } from '../types';
import { UPSERT_TABLE_COLUMNS, TABLE_ENUM_COLUMNS } from '../../types/tableColumns';
import { ENUM_VALUES } from '../../types/enums';
import {
    isFatCharacter,
    isFatLightcone,
    isFatPairing,
    normalizeCharacters,
    normalizeCharacterCosts,
    extractArchetypeNames,
    extractArchetypeAssignments,
    normalizeLightcones,
    normalizeLightconeCosts,
    normalizePairings,
    type RawCharacter,
    type RawLightcone,
    type RawPairing,
} from '@/lib/seed-normalizers';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { Chip } from '@heroui/chip';

const TABLE_TEMPLATES: Record<UpsertTableName, string> = {
    HsrCharacter: `[{
  "name": "march7th",
  "display_name": "March 7th",
  "aliases": ["march"],
  "rarity": 4,
  "path": "preservation",
  "element": "ice",
  "role": "support",
  "archetype": ["Debuff"],
  "version_released": 1.4,
  "treat_as_version": 1.4,
  "image_url": "https://...",
  "skel_url": "",
  "atlas_url": "",
  "atlas_img_url": [],
  "positioning": { "x": 0, "y": 0, "width": 0 },
  "cost": {
    "cost_set_id": 0,
    "memory_of_chaos": { "classic": { "E0": 5, "E1": 7, "E2": 9, "E3": 11, "E4": 13, "E5": 15, "E6": 17 } }
  }
}]`,
    HsrLightcone: `[{
  "name": "momentofvictory",
  "display_name": "Moment of Victory",
  "aliases": [],
  "path": "preservation",
  "rarity": 5,
  "image_url": "https://...",
  "positioning": { "x": 0, "y": 0, "width": 0 },
  "cost": {
    "cost_set_id": 0,
    "memory_of_chaos": { "classic": { "S1": 2, "S2": 3, "S3": 4, "S4": 5, "S5": 6 } }
  }
}]`,
    HsrCharacterCost: `[{
  "characterName": "march7th",
  "gameMode": "MemoryOfChaos",
  "draftMode": "Classic",
  "costs": { "e0": 5, "e1": 7, "e2": 9, "e3": 11, "e4": 13, "e5": 15, "e6": 17 }
}]`,
    HsrLightconeCost: `[{
  "lightconeName": "momentofvictory",
  "gameMode": "MemoryOfChaos",
  "draftMode": "Classic",
  "costs": { "s1": 2, "s2": 3, "s3": 4, "s4": 5, "s5": 6 }
}]`,
    HsrSynergyCost: `[{
  "source_name": "cerydra",
  "target_name": "anaxa",
  "cost": {
    "cost_set_id": 0,
    "memory_of_chaos": { "classic": { "modifier": 1.5 } }
  }
}]`,
};

// ─── snake_case → camelCase conversion ───────────────────────────────────────

function snakeToCamel(str: string): string {
    return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function convertKeys(obj: any): any {
    if (Array.isArray(obj)) return obj.map(convertKeys);
    if (obj !== null && typeof obj === 'object') {
        const converted: any = {};
        for (const [key, value] of Object.entries(obj)) {
            converted[snakeToCamel(key)] = convertKeys(value);
        }
        return converted;
    }
    return obj;
}

// ─── Validation ──────────────────────────────────────────────────────────────

interface ValidationResult {
    valid: boolean;
    error: string | null;
    convertedRows: any[];
    rowCount: number;
    isFatPayload: boolean;
    rawRows: any[];
}

// Detect whether the parsed payload is the D-22 canonical "fat" seed shape for
// the given table. Fat shape carries cost/archetype/positioning sub-blocks and
// expands into multiple reducer calls (auto-split mirrors scripts/seed-data.ts).
function detectFatPayload(rawRows: any[], tableName: UpsertTableName): boolean {
    if (!rawRows.length) return false;
    const first = rawRows[0];
    if (tableName === 'HsrCharacter') return isFatCharacter(first);
    if (tableName === 'HsrLightcone') return isFatLightcone(first);
    if (tableName === 'HsrSynergyCost') return isFatPairing(first);
    return false;
}

function validateJson(jsonText: string, tableName: UpsertTableName): ValidationResult {
    const empty: ValidationResult = { valid: false, error: null, convertedRows: [], rowCount: 0, isFatPayload: false, rawRows: [] };
    if (!jsonText.trim()) return empty;

    let parsed: any;
    try {
        parsed = JSON.parse(jsonText);
    } catch (e: any) {
        return { ...empty, error: `Invalid JSON: ${e.message}` };
    }

    if (!Array.isArray(parsed)) return { ...empty, error: 'JSON must be an array' };
    if (parsed.length === 0) return { ...empty, error: 'Array is empty' };

    // Fat-shape branch: D-22 canonical seed format. Skip flat-key validation;
    // normalizers from lib/seed-normalizers handle the snake_case → multi-table
    // expansion at submit time.
    if (detectFatPayload(parsed, tableName)) {
        return { valid: true, error: null, convertedRows: [], rowCount: parsed.length, isFatPayload: true, rawRows: parsed };
    }

    // Convert snake_case keys to camelCase
    const converted: any[] = convertKeys(parsed);

    // 1. Check all elements have the same keys
    const firstKeys = Object.keys(converted[0]).sort().join(',');
    for (let i = 1; i < converted.length; i++) {
        const rowKeys = Object.keys(converted[i]).sort().join(',');
        if (rowKeys !== firstKeys) {
            const firstSet = new Set(Object.keys(converted[0]));
            const rowSet = new Set(Object.keys(converted[i]));
            const missing = [...firstSet].filter(k => !rowSet.has(k));
            const extra = [...rowSet].filter(k => !firstSet.has(k));
            const parts: string[] = [];
            if (missing.length) parts.push(`missing: ${missing.join(', ')}`);
            if (extra.length) parts.push(`extra: ${extra.join(', ')}`);
            return { ...empty, error: `Row ${i} has inconsistent keys (${parts.join('; ')})` };
        }
    }

    // 2. Check keys match expected DB columns exactly
    const expectedColumns = UPSERT_TABLE_COLUMNS[tableName];
    const actualKeys = Object.keys(converted[0]).sort();
    const expectedSorted = [...expectedColumns].sort();

    if (actualKeys.join(',') !== expectedSorted.join(',')) {
        const expectedSet = new Set<string>(expectedColumns);
        const actualSet = new Set(actualKeys);
        const missing = expectedColumns.filter(c => !actualSet.has(c));
        const extra = actualKeys.filter(k => !expectedSet.has(k));
        const parts: string[] = [];
        if (missing.length) parts.push(`Missing columns: ${missing.join(', ')}`);
        if (extra.length) parts.push(`Unknown columns: ${extra.join(', ')}`);
        return {
            ...empty,
            error: `Key mismatch for ${tableName}. ${parts.join('. ')}. Expected: [${expectedColumns.join(', ')}]`,
        };
    }

    // 3. Validate enum column values (case-sensitive)
    const enumColumns = TABLE_ENUM_COLUMNS[tableName];
    for (let i = 0; i < converted.length; i++) {
        const row = converted[i];
        for (const [col, enumKey] of Object.entries(enumColumns)) {
            const value = row[col];
            const allowed = ENUM_VALUES[enumKey];
            if (!allowed.includes(value)) {
                return {
                    ...empty,
                    error: `Row ${i}, column "${col}": invalid value "${value}". Must be exactly one of: ${allowed.join(', ')}`,
                };
            }
        }
    }

    return { valid: true, error: null, convertedRows: converted, rowCount: converted.length, isFatPayload: false, rawRows: [] };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BulkUpsert() {
    const adminBulkUpsert = useReducer(reducers.adminBulkUpsert);
    const adminAssignCharacterArchetypes = useReducer(reducers.adminAssignCharacterArchetypes);
    // Subscribed by GameDataProvider layer-0 already; this hook reads from the cache.
    // Used to resolve archetype name → id post-upsert when handling a fat HsrCharacter payload.
    const [archetypeRows] = useTable(tables.Archetype);
    const [selectedTable, setSelectedTable] = useState<UpsertTableName>('HsrCharacter');
    const [jsonText, setJsonText] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validation = useMemo(
        () => validateJson(jsonText, selectedTable),
        [jsonText, selectedTable]
    );

    const handleFileRead = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const parsed = JSON.parse(text);
                setJsonText(JSON.stringify(parsed, null, 2));
                setMessage(null);
            } catch (err: any) {
                setMessage({
                    type: 'error',
                    text: `File "${file.name}" is not valid JSON: ${err?.message || 'parse error'}`,
                });
            }
        };
        reader.readAsText(file);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.json')) {
            handleFileRead(file);
        } else {
            setMessage({ type: 'error', text: 'Please drop a .json file' });
        }
    }, [handleFileRead]);

    const handleSubmit = useCallback(() => {
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error || 'Validation failed' });
            return;
        }
        setIsSubmitting(true);
        setMessage(null);

        // Flat-shape: single reducer call (existing path)
        if (!validation.isFatPayload) {
            adminBulkUpsert({
                tableName: selectedTable,
                jsonData: JSON.stringify(validation.convertedRows),
            })
                .then(() => {
                    setMessage({ type: 'success', text: `Bulk upsert sent for ${validation.rowCount} rows into ${selectedTable}` });
                    setJsonText('');
                    if (fileInputRef.current) fileInputRef.current.value = '';
                })
                .catch((err: any) => {
                    setMessage({ type: 'error', text: `Upsert failed: ${err.message || err}` });
                })
                .finally(() => setIsSubmitting(false));
            return;
        }

        // Fat-shape: D-22 canonical seed format. Mirror scripts/seed-data.ts ordering:
        //   1. Primary table (HsrCharacter / HsrLightcone / HsrSynergyCost)
        //   2. Cost rows (one per gameMode × draftMode sub-block)
        //   3. Archetype names (HsrCharacter only)
        //   4. Archetype assignments via admin_assign_character_archetypes (HsrCharacter only)
        const raw = validation.rawRows;

        const dispatch = async () => {
            const summary: string[] = [];

            if (selectedTable === 'HsrCharacter') {
                const characterRows = normalizeCharacters(raw as RawCharacter[]);
                const costRows = normalizeCharacterCosts(raw as RawCharacter[]);
                const archetypeNames = extractArchetypeNames(raw as RawCharacter[]);
                const assignments = extractArchetypeAssignments(raw as RawCharacter[]);

                await adminBulkUpsert({ tableName: 'HsrCharacter', jsonData: JSON.stringify(characterRows) });
                summary.push(`HsrCharacter ${characterRows.length}`);

                if (costRows.length) {
                    await adminBulkUpsert({ tableName: 'HsrCharacterCost', jsonData: JSON.stringify(costRows) });
                    summary.push(`HsrCharacterCost ${costRows.length}`);
                }

                if (archetypeNames.length) {
                    const archetypePayload = archetypeNames.map(name => ({ name, description: '' }));
                    await adminBulkUpsert({ tableName: 'Archetype', jsonData: JSON.stringify(archetypePayload) });
                    summary.push(`Archetype ${archetypeNames.length}`);

                    // Resolve name→id from the live Archetype subscription cache.
                    const archetypeMap = new Map<string, number>();
                    for (const row of (archetypeRows ?? []) as any[]) {
                        archetypeMap.set(row.name, row.id);
                    }

                    let assignedCount = 0;
                    for (const { characterName, archetypeNames: names } of assignments) {
                        const ids = names.map(n => archetypeMap.get(n)).filter((id): id is number => id !== undefined);
                        if (ids.length > 0) {
                            await adminAssignCharacterArchetypes({
                                characterName,
                                archetypeIdsJson: JSON.stringify(ids),
                            });
                            assignedCount++;
                        }
                    }
                    if (assignedCount > 0) summary.push(`HsrCharacterArchetype assignments ${assignedCount}`);
                }
            } else if (selectedTable === 'HsrLightcone') {
                const lightconeRows = normalizeLightcones(raw as RawLightcone[]);
                const costRows = normalizeLightconeCosts(raw as RawLightcone[]);

                await adminBulkUpsert({ tableName: 'HsrLightcone', jsonData: JSON.stringify(lightconeRows) });
                summary.push(`HsrLightcone ${lightconeRows.length}`);

                if (costRows.length) {
                    await adminBulkUpsert({ tableName: 'HsrLightconeCost', jsonData: JSON.stringify(costRows) });
                    summary.push(`HsrLightconeCost ${costRows.length}`);
                }
            } else if (selectedTable === 'HsrSynergyCost') {
                const synergyRows = normalizePairings(raw as RawPairing[]);
                if (synergyRows.length === 0) {
                    throw new Error('Pairing fat-shape parsed but no cost sub-blocks present — nothing to upsert.');
                }
                await adminBulkUpsert({ tableName: 'HsrSynergyCost', jsonData: JSON.stringify(synergyRows) });
                summary.push(`HsrSynergyCost ${synergyRows.length}`);
            } else {
                throw new Error(`Fat-shape detected but no normalizer for tableName="${selectedTable}".`);
            }

            return summary.join(', ');
        };

        dispatch()
            .then((summary) => {
                setMessage({ type: 'success', text: `Fat-shape upsert complete: ${summary}` });
                setJsonText('');
                if (fileInputRef.current) fileInputRef.current.value = '';
            })
            .catch((err: any) => {
                setMessage({ type: 'error', text: `Fat-shape upsert failed: ${err.message || err}` });
            })
            .finally(() => setIsSubmitting(false));
    }, [adminBulkUpsert, adminAssignCharacterArchetypes, archetypeRows, selectedTable, validation]);

    return (
        <div className="flex flex-col gap-4 p-4">
            {message && (
                <Chip
                    color={message.type === 'success' ? 'success' : 'danger'}
                    variant="flat"
                    onClose={() => setMessage(null)}
                    classNames={{ base: 'max-w-full' }}
                >
                    {message.text}
                </Chip>
            )}

            <div className="flex items-end gap-3 flex-wrap">
                <Select
                    placeholder="Select table"
                    aria-label="Table"
                    selectedKeys={new Set([selectedTable])}
                    onSelectionChange={(keys) => {
                        const val = [...keys][0] as UpsertTableName;
                        if (val) {
                            setSelectedTable(val);
                            setMessage(null);
                        }
                    }}
                    className="w-[220px]"
                    size="sm"
                    variant="bordered"
                    classNames={{
                        value: 'text-default-100',
                        trigger: 'border-content3',
                    }}
                >
                    {UPSERT_TABLES.map(t => (
                        <SelectItem key={t}>{t}</SelectItem>
                    ))}
                </Select>

                <Button
                    variant="solid"
                    color="primary"
                    size="sm"
                    onPress={() => setJsonText(TABLE_TEMPLATES[selectedTable])}
                >
                    Show Template
                </Button>

                <span className="text-xs text-default-300">
                    Expected: [{UPSERT_TABLE_COLUMNS[selectedTable].join(', ')}]
                </span>
            </div>

            {/* File drop zone */}
            <div
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors ${
                    isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-default-300 hover:border-default-400'
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <span className="text-sm text-default-500">
                    Drop a .json file here or click to browse
                </span>
                <span className="text-xs text-default-300">
                    snake_case keys are auto-converted to camelCase
                </span>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileRead(file);
                    }}
                />
            </div>

            {/* JSON editor */}
            <Textarea
                value={jsonText}
                onValueChange={setJsonText}
                placeholder="Paste or drop JSON array here..."
                minRows={12}
                maxRows={24}
                variant="bordered"
                classNames={{
                    inputWrapper: 'border-content3 bg-content1',
                    input: 'text-default-100 font-mono text-sm',
                }}
            />

            {validation.error && jsonText.trim() && (
                <Chip color="danger" variant="flat" classNames={{ base: 'max-w-full h-auto py-1' }}>
                    {validation.error}
                </Chip>
            )}

            {validation.valid && (
                <Chip color="success" variant="flat" classNames={{ base: 'max-w-full' }}>
                    {validation.rowCount} row{validation.rowCount !== 1 ? 's' : ''} validated — all keys match {selectedTable} columns
                </Chip>
            )}

            <div>
                <Button
                    color="primary"
                    onPress={handleSubmit}
                    isDisabled={!validation.valid || isSubmitting}
                    isLoading={isSubmitting}
                >
                    {isSubmitting ? 'Uploading...' : `Upsert ${validation.rowCount} rows into ${selectedTable}`}
                </Button>
            </div>
        </div>
    );
}
