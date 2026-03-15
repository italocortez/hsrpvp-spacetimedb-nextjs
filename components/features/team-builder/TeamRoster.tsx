"use client";

import { useState, useCallback } from "react";
import styles from "@/app/(landing-page)/teambuilder/page.module.css";
import { Loadout, ResolvedTeamMember, TEAM_SIZE, TeamMember } from "./LoadoutManager";
import { Character, Lightcone, RuleSet, Synergy } from "../types/enums";
import { TeamSlot } from "./Teamslot";
import { SynergyDisplay } from "./SynergyDisplay";

interface TeamRosterProps {
	currentLoadout: Loadout;
	resolvedTeam: ResolvedTeamMember[];
	characters: Character[];
	lightcones: Lightcone[];
	synergies: Synergy[];
	ruleSet: RuleSet;
	onUpdateMember: (index: number, updates: Partial<ResolvedTeamMember>) => void;
	onRemoveMember: (index: number) => void;
	onReorderTeam: (team: TeamMember[]) => void;
}

export function TeamRoster({
	currentLoadout,
	resolvedTeam,
	characters,
	lightcones,
	synergies,
	ruleSet,
	onUpdateMember,
	onRemoveMember,
	onReorderTeam,
}: TeamRosterProps) {
	const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
	const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

	const handleDragStart = useCallback((index: number, e: React.DragEvent) => {
		setDraggedIndex(index);
		e.dataTransfer.effectAllowed = "move";
	}, []);

	const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
		e.preventDefault();
		setDragOverIndex(index);
	}, []);

	const handleDragLeave = useCallback(() => setDragOverIndex(null), []);
	const handleDragEnd = useCallback(() => {
		setDraggedIndex(null);
		setDragOverIndex(null);
	}, []);

	const handleDrop = useCallback(
		(targetIndex: number, e: React.DragEvent) => {
			e.preventDefault();
			if (draggedIndex === null || draggedIndex === targetIndex) {
				setDraggedIndex(null);
				setDragOverIndex(null);
				return;
			}
			const newTeam = [...currentLoadout.team];
			[newTeam[draggedIndex], newTeam[targetIndex]] = [
				newTeam[targetIndex],
				newTeam[draggedIndex],
			];
			onReorderTeam(newTeam);
			setDraggedIndex(null);
			setDragOverIndex(null);
		},
		[draggedIndex, currentLoadout.team, onReorderTeam],
	);

	return (
		<div className={`${styles.roster} Box`}>
			<div className={styles.charactersContainer}>
				{Array.from({ length: TEAM_SIZE }, (_, index) => {
					const member = resolvedTeam[index];
					const character = member ? characters.find((c) => c.name === member.characterName) : undefined;

					return (
						<TeamSlot
							key={index}
							index={index}
							member={member}
							character={character}
							lightcones={lightcones}
							synergies={synergies}
							resolvedTeam={resolvedTeam}
							characters={characters}
							hasRawEntry={!!currentLoadout.team[index]}
							onUpdate={onUpdateMember}
							onRemove={onRemoveMember}
							isDragging={draggedIndex === index}
							isDropTarget={
								dragOverIndex === index &&
								draggedIndex !== null &&
								draggedIndex !== index
							}
							onDragStart={handleDragStart}
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDragEnd={handleDragEnd}
							onDrop={handleDrop}
						/>
					);
				})}
			</div>

			<SynergyDisplay
				resolvedTeam={resolvedTeam}
				characters={characters}
				synergies={synergies}
				ruleSet={ruleSet}
			/>
		</div>
	);
}
