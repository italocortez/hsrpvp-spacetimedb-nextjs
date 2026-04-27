"use client";

import { useState, useEffect, memo, useMemo, useCallback } from "react";
import styles from "./Teamslot.module.css";
import { ClearIcon, LoadingSpinner, SynergyIcon } from "@/components/globals/icons";
import { iconMaps } from "../../hooks/useIconMaps";
import { LightconeSelector } from "../../drafting/components/lightcone-selector/LightconeSelector";
import { Character, CharacterRank, Eidolons, Lightcone, LightconeRank, SuperImpositions, Synergy } from "../../types/enums";
import { ResolvedTeamMember } from "../LoadoutManager";

interface TeamSlotProps {
	index: number;
	member: ResolvedTeamMember | undefined;
	character: Character | undefined;
	lightcones: Lightcone[];
	synergies: Synergy[];
	resolvedTeam: ResolvedTeamMember[];
	characters: Character[];

	// Whether the raw TeamMember entry exists (for loading state)
	hasRawEntry: boolean;
	onUpdate: (index: number, updates: Partial<ResolvedTeamMember>) => void;
	onRemove: (index: number) => void;

	// Dragging functionality
	isDragging: boolean;
	isDropTarget: boolean;
	onDragStart: (index: number, e: React.DragEvent) => void;
	onDragOver: (e: React.DragEvent, index: number) => void;
	onDragLeave: () => void;
	onDragEnd: () => void;
	onDrop: (index: number, e: React.DragEvent) => void;
}

export const TeamSlot = memo(function TeamSlot({
	index,
	member,
	character,
	lightcones,
	synergies,
	resolvedTeam,
	characters,
	hasRawEntry,
	onUpdate,
	onRemove,
	isDragging,
	isDropTarget,
	onDragStart,
	onDragOver,
	onDragLeave,
	onDragEnd,
	onDrop,
}: TeamSlotProps) {
	// ── Empty slot ──────────────────────────────────────────────────────
	if (!member || !character) {
		return (
			<div className={`${styles.slot} ${styles.empty}`}>
				{hasRawEntry ? <LoadingSpinner /> : <h3>Empty</h3>}
			</div>
		);
	}

	// ── Memoized helpers ────────────────────────────────────────────────
	const elementIconUrl = useMemo(() => iconMaps.elements[character.element], [character.element]);
	const pathIconUrl = useMemo(() => iconMaps.paths[character.path], [character.path]);

	const hasActivePairing = useMemo(() => {
		const teamNames = resolvedTeam
			.map((m) => characters.find((c) => c.name === m.characterName)?.name)
			.filter((n): n is string => !!n);
		return synergies.some(
			(p) =>
				(p.sourceName === character.name && teamNames.includes(p.targetName)) ||
				(p.targetName === character.name && teamNames.includes(p.sourceName)),
		);
	}, [resolvedTeam, characters, synergies, character.name]);

	const slotClass = useMemo(() => [
		styles.slot,
		isDragging ? styles.dragging : "",
		isDropTarget ? styles.dropTarget : "",
	]
		.filter(Boolean)
		.join(" "), [isDragging, isDropTarget]);

	// ── Memoized event handlers ─────────────────────────────────────────
	const handleRemove = useCallback(() => onRemove(index), [onRemove, index]);
	const handleDragStart = useCallback((e: React.DragEvent) => onDragStart(index, e), [onDragStart, index]);
	const handleDragOver = useCallback((e: React.DragEvent) => onDragOver(e, index), [onDragOver, index]);
	const handleDrop = useCallback((e: React.DragEvent) => onDrop(index, e), [onDrop, index]);

	const handleRankChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		onUpdate(index, { rank: e.target.value as CharacterRank });
		e.currentTarget.blur();
	}, [onUpdate, index]);

	const handleLightconeRankChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
		onUpdate(index, { lightconeRank: e.target.value as LightconeRank });
		e.currentTarget.blur();
	}, [onUpdate, index]);

	const handleLightconeChange = useCallback(
		(lcName: string | undefined, rank: LightconeRank | undefined) =>
			onUpdate(index, { lightconeName: lcName, lightconeRank: rank }),
		[onUpdate, index],
	);

	return (
		<div
			className={slotClass}
			data-rarity={character.rarity}
			data-component="teamSlot"
			style={{ background: `var(--gradient-${character.rarity}star)` }}
            
			draggable
			onDragStart={handleDragStart}
			onDragOver={handleDragOver}
			onDragLeave={onDragLeave}
			onDragEnd={onDragEnd}
			onDrop={handleDrop}
		>
			{/* Path background icon */}
			<img
				src={pathIconUrl}
				className={styles.path}
				alt={character.path}
			/>

			{/* Portrait */}
			<img
				src={character.imageUrl || ""}
				className={styles.portrait}
				alt={character.displayName}
			/>

			{/* Remove button */}
			<button
				onClick={handleRemove}
				className={styles.clearButton}
				title={`Remove ${character.displayName}`}
			>
				<ClearIcon />
			</button>

			{/* Character info overlay */}
			<div className={styles.character}>
				<div className={styles.icons}>
					<img
						src={elementIconUrl}
						className={styles.element}
						alt={character.element}
					/>
					{hasActivePairing && <SynergyIcon />}
				</div>

				{/* Eidolon / Super Imposition selectors */}
				<div className={styles.verticals}>
					<select
						value={member.rank}
						onChange={handleRankChange}
						className={styles.eidolon}
						name="eidolon"
						style={{
							paddingRight: member.lightconeName ? "0" : undefined,
							marginRight: member.lightconeName ? "0" : undefined,
						}}
					>
						{Eidolons.map((rank) => (
							<option key={rank} value={rank}>
								{rank}
							</option>
						))}
					</select>

					{member.lightconeName && (
						<select
							value={(member.lightconeRank || "S1") as LightconeRank}
							onChange={handleLightconeRankChange}
							className={styles.imposition}
							name="imposition"
						>
							{SuperImpositions.map((rank) => (
								<option key={rank} value={rank}>
									{rank}
								</option>
							))}
						</select>
					)}
				</div>
			</div>

			{/* Lightcone selector */}
			<LightconeSelector
				lightcones={lightcones}
				selectedLightconeName={member.lightconeName}
				selectedRank={member.lightconeRank}
				onLightconeChange={handleLightconeChange}
				equippingCharacter={character}
				size="large"
			/>
		</div>
	);
});
