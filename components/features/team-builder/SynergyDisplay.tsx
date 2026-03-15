"use client";

import { Character, RuleSet, Synergy } from "../types/enums";
import { ResolvedTeamMember } from "./LoadoutManager";
import styles from "@/app/(landing-page)/teambuilder/page.module.css";

interface SynergyDisplayProps {
	resolvedTeam: ResolvedTeamMember[];
	characters: Character[];
	synergies: Synergy[];
	ruleSet: RuleSet;
}

export function SynergyDisplay({
	resolvedTeam,
	characters,
	synergies,
	ruleSet,
}: SynergyDisplayProps) {
	const teamNames = resolvedTeam
		.map((m) => characters.find((c) => c.name === m.characterName)?.name)
		.filter((n): n is string => !!n);

	const activePairings = synergies.filter(
		(p) =>
			teamNames.includes(p.sourceName) &&
			teamNames.includes(p.targetName) &&
			p.ruleSet === ruleSet,
	);

	return (
		<div className={styles.synergies}>
			<h2>Synergies:</h2>
			{activePairings.length === 0 ? (
				<h3 className={styles.emptyMessage}>none</h3>
			) : (
				activePairings.map((p) => {
					const sourceName =
						characters.find((c) => c.name === p.sourceName)?.displayName ??
						p.sourceName;
					const targetName =
						characters.find((c) => c.name === p.targetName)?.displayName ??
						p.targetName;
					const cost = p.costModifier;

					return (
						<h3
							key={`${p.sourceName}-${p.targetName}`}
							className={styles.pair}
							title={`Additional cost due to strong synergy between ${sourceName} and ${targetName}`}
						>
							{`${cost > 0 ? "+" : ""}${cost} ${sourceName} - ${targetName}`}
						</h3>
					);
				})
			)}
		</div>
	);
}
