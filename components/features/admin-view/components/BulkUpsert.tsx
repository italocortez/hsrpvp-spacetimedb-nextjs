'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useReducer } from 'spacetimedb/react';
import { reducers } from '@/src/module_bindings';
import { UPSERT_TABLES, UpsertTableName } from '../types';
import { UPSERT_TABLE_COLUMNS, TABLE_ENUM_COLUMNS } from '../../types/tableColumns';
import { ENUM_VALUES } from '../../types/enums';
import { Select, SelectItem } from '@heroui/select';
import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { Chip } from '@heroui/chip';

const TABLE_TEMPLATES: Record<UpsertTableName, string> = {
    HsrCharacter: `[{
  "name": "march7th",
  "displayName": "March 7th",
  "aliases": ["march"],
  "rarity": 4,
  "path": "Preservation",
  "element": "Ice",
  "role": "Support",
  "imageUrl": "https://..."
}]`,
    HsrLightcone: `[{
  "name": "momentofvictory",
  "displayName": "Moment of Victory",
  "aliases": [],
  "path": "Preservation",
  "rarity": 5,
  "imageUrl": "https://...",
  "posX": 0,
  "posY": 0,
  "width": 0
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
  "sourceName": "cerydra",
  "targetName": "anaxa",
  "gameMode": "MemoryOfChaos",
  "draftMode": "Classic",
  "costModifier": 1.5
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
}

function validateJson(jsonText: string, tableName: UpsertTableName): ValidationResult {
    const empty: ValidationResult = { valid: false, error: null, convertedRows: [], rowCount: 0 };
    if (!jsonText.trim()) return empty;

    let parsed: any;
    try {
        parsed = JSON.parse(jsonText);
    } catch (e: any) {
        return { ...empty, error: `Invalid JSON: ${e.message}` };
    }

    if (!Array.isArray(parsed)) return { ...empty, error: 'JSON must be an array' };
    if (parsed.length === 0) return { ...empty, error: 'Array is empty' };

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

    return { valid: true, error: null, convertedRows: converted, rowCount: converted.length };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BulkUpsert() {
    const adminBulkUpsert = useReducer(reducers.adminBulkUpsert);
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
            } catch {
                setJsonText(text);
            }
            setMessage(null);
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
        // Send the converted (camelCase) rows
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
    }, [adminBulkUpsert, selectedTable, validation]);

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
