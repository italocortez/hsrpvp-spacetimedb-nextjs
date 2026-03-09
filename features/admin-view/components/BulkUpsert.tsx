'use client';

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { useSpacetimeDB } from 'spacetimedb/react';
import { UPSERT_TABLES, UpsertTableName } from '../types';
import { UPSERT_TABLE_COLUMNS, TABLE_ENUM_COLUMNS } from '../../types/tableColumns';
import { ENUM_VALUES } from '../../types/enums';
import styles from './BulkUpsert.module.css';

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
  "classicCosts": { "e0": 5, "e1": 7, "e2": 9, "e3": 11, "e4": 13, "e5": 15, "e6": 17 },
  "auctionBaseBid": { "e0": 3, "e1": 5, "e2": 7, "e3": 9, "e4": 11, "e5": 13, "e6": 15 }
}]`,
    HsrLightconeCost: `[{
  "lightconeName": "momentofvictory",
  "classicCosts": { "s1": 2, "s2": 3, "s3": 4, "s4": 5, "s5": 6 },
  "auctionBaseBid": { "s1": 1, "s2": 2, "s3": 3, "s4": 4, "s5": 5 }
}]`,
    HsrSynergyCost: `[{
  "sourceName": "cerydra",
  "targetName": "anaxa",
  "gameMode": "MemoryOfChaos",
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
    const { getConnection } = useSpacetimeDB();
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
        const conn = getConnection();
        if (!conn) {
            setMessage({ type: 'error', text: 'Not connected to SpacetimeDB' });
            return;
        }
        if (!validation.valid) {
            setMessage({ type: 'error', text: validation.error || 'Validation failed' });
            return;
        }

        setIsSubmitting(true);
        setMessage(null);

        try {
            // Send the converted (camelCase) rows
            (conn.reducers as any).adminBulkUpsert({
                tableName: selectedTable,
                jsonData: JSON.stringify(validation.convertedRows),
            });
            setMessage({ type: 'success', text: `Bulk upsert sent for ${validation.rowCount} rows into ${selectedTable}` });
            setJsonText('');
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (e: any) {
            setMessage({ type: 'error', text: `Upsert failed: ${e.message || e}` });
        } finally {
            setIsSubmitting(false);
        }
    }, [getConnection, selectedTable, validation]);

    return (
        <div className={styles.panel}>
            {message && (
                <div className={`${styles.message} ${message.type === 'success' ? styles.message_success : styles.message_error}`}>
                    {message.text}
                </div>
            )}

            <div className={styles.upsert_layout}>
                <div className={styles.explorer_controls}>
                    <select
                        className={styles.select}
                        value={selectedTable}
                        onChange={(e) => {
                            setSelectedTable(e.target.value as UpsertTableName);
                            setMessage(null);
                        }}
                    >
                        {UPSERT_TABLES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    <button
                        className={styles.btn_primary}
                        onClick={() => setJsonText(TABLE_TEMPLATES[selectedTable])}
                    >
                        Show Template
                    </button>

                    <span style={{ color: 'rgb(107, 114, 128)', fontSize: '0.8rem' }}>
                        Expected: [{UPSERT_TABLE_COLUMNS[selectedTable].join(', ')}]
                    </span>
                </div>

                {/* File drop zone */}
                <div
                    className={`${styles.file_drop} ${isDragging ? styles.file_drop_active : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    Drop a .json file here or click to browse
                    <br />
                    <span style={{ fontSize: '0.8rem' }}>
                        snake_case keys are auto-converted to camelCase
                    </span>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className={styles.file_input}
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileRead(file);
                        }}
                    />
                </div>

                {/* JSON editor */}
                <textarea
                    className={styles.json_preview}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder="Paste or drop JSON array here..."
                    rows={12}
                    style={{ resize: 'vertical', width: '100%' }}
                />

                {validation.error && jsonText.trim() && (
                    <div className={`${styles.message} ${styles.message_error}`}>
                        {validation.error}
                    </div>
                )}

                {validation.valid && (
                    <div className={`${styles.message} ${styles.message_success}`}>
                        {validation.rowCount} row{validation.rowCount !== 1 ? 's' : ''} validated — all keys match {selectedTable} columns
                    </div>
                )}

                <div className={styles.upsert_status}>
                    <button
                        className={styles.btn_primary}
                        onClick={handleSubmit}
                        disabled={!validation.valid || isSubmitting}
                    >
                        {isSubmitting ? 'Uploading...' : `Upsert ${validation.rowCount} rows into ${selectedTable}`}
                    </button>
                </div>
            </div>
        </div>
    );
}
