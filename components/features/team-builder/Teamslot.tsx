"use client";

import { useState } from "react";
import styles from "@/app/(public)/teambuilder/page.module.css";
import { ResolvedTeamMember } from "./LoadoutManager";
import { Character, CharacterRank, Eidolons, Lightcone, LightconeRank, SuperImpositions, Synergy } from "../types/enums";
import { iconMaps } from "../hooks/useIconMaps";
import { ClearIcon, LoadingSpinner, SynergyIcon } from "@/components/globals/icons";
import { LightconeSelector } from "../drafting/components/LightconeSelector";

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

export function TeamSlot({
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
	const [isHovered, setIsHovered] = useState<boolean>(false);

	// ── Empty slot ──────────────────────────────────────────────────────
	if (!member || !character) {
		return (
			<div className={`${styles.slot} ${styles.empty}`}>
				{hasRawEntry ? <LoadingSpinner /> : <h3>Empty</h3>}
			</div>
		);
	}

	// ── Helpers ─────────────────────────────────────────────────────────
	const elementIconUrl = iconMaps.elements[character.element];
	const pathIconUrl = iconMaps.paths[character.path];

	const hasActivePairing = (() => {
		const teamNames = resolvedTeam
			.map((m) => characters.find((c) => c.name === m.characterName)?.name)
			.filter((n): n is string => !!n);
		return synergies.some(
			(p) =>
				(p.sourceName === character.name && teamNames.includes(p.targetName)) ||
				(p.targetName === character.name && teamNames.includes(p.sourceName)),
		);
	})();

	const slotClass = [
		styles.slot,
		isDragging ? styles.dragging : "",
		isDropTarget ? styles.dropTarget : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className={slotClass}
			data-rarity={character.rarity}
			style={{ background: `var(--gradient-${character.rarity}star)` }}
            
			data-slot-hover={isHovered || undefined}
			draggable
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onDragStart={(e) => onDragStart(index, e)}
			onDragOver={(e) => onDragOver(e, index)}
			onDragLeave={onDragLeave}
			onDragEnd={onDragEnd}
			onDrop={(e) => onDrop(index, e)}
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
				onClick={() => onRemove(index)}
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
						onChange={(e) => {
							onUpdate(index, { rank: e.target.value as CharacterRank });
							e.currentTarget.blur();
						}}
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
							onChange={(e) => {
								onUpdate(index, {
									lightconeRank: e.target.value as LightconeRank,
								});
								e.currentTarget.blur();
							}}
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
				onLightconeChange={(lcName, rank) => onUpdate(index, { lightconeName: lcName, lightconeRank: rank })}
				equippingCharacter={character}
			/>
		</div>
	);
}
