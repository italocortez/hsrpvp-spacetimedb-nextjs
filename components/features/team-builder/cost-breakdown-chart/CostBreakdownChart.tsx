"use client";

import { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar } from "react-chartjs-2";
import styles from "./CostBreakdownChart.module.css";
import { Character, DraftMode, Lightcone, RuleSet, Synergy } from "@/components/features/types/enums";
import { ResolvedTeamMember } from "../LoadoutManager";
import { LoadingSpinner } from "@/components/globals/icons";
import { iconMaps } from "@/components/features/hooks/useIconMaps";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	ChartDataLabels,
);

// ─── Props ──────────────────────────────────────────────────────────

interface CostBreakdownChartProps {
	resolvedTeam: ResolvedTeamMember[];
	characters: Character[];
	lightcones: Lightcone[];
	synergies: Synergy[];
	ruleSet: RuleSet;
	draftMode?: DraftMode;
	onToggleRuleSet: () => void;
	/** Whether raw team entries exist (for loading state when team is resolving). */
	hasRawEntries: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────

function getChartColors(ruleSet: RuleSet) {
	return {
		character: ruleSet === "MemoryOfChaos" ? "#3b82f6" : "#8b5cf6",
		lightcone: ruleSet === "MemoryOfChaos" ? "#60a5fa" : "#a78bfa",
		pairing: ruleSet === "MemoryOfChaos" ? "#1d4ed8" : "#6d28d9",
	};
}

function getPairingCostForCharacter(
	characterName: string,
	teamCharacterNames: string[],
	synergies: Synergy[],
	ruleSet: RuleSet,
): number {
	return synergies
		.filter(
			(p) =>
				p.sourceName === characterName &&
				teamCharacterNames.includes(p.targetName) &&
				p.ruleSet === ruleSet,
		)
		.reduce((total, p) => total + p.costModifier, 0);
}

// ─── Component ──────────────────────────────────────────────────────

export function CostBreakdownChart({
	resolvedTeam,
	characters,
	lightcones,
	synergies,
	ruleSet,
	draftMode = "Classic",
	onToggleRuleSet,
	hasRawEntries,
}: CostBreakdownChartProps) {
	const colors = getChartColors(ruleSet);
	const modeLabel = ruleSet === "MemoryOfChaos" ? "MoC" : "AS";

	const teamCharacterNames = useMemo(
		() =>
			resolvedTeam
				.map((m) => characters.find((c) => c.name === m.characterName)?.name)
				.filter((n): n is string => !!n),
		[resolvedTeam, characters],
	);

	const totalCost = useMemo(() => {
		return resolvedTeam.reduce((total, member) => {
			const char = characters.find((c) => c.name === member.characterName);
			if (!char) return total;

			let cost = char.cost[draftMode][ruleSet][member.rank];

			if (member.lightconeName && member.lightconeRank) {
				const lc = lightcones.find((l) => l.name === member.lightconeName);
				if (lc) cost += lc.cost[draftMode][member.lightconeRank];
			}

			cost += getPairingCostForCharacter(
				char.name,
				teamCharacterNames,
				synergies,
				ruleSet,
			);
			return total + cost;
		}, 0);
	}, [
		resolvedTeam,
		characters,
		lightcones,
		synergies,
		ruleSet,
		teamCharacterNames,
	]);

	// ── Chart data ────────────────────────────────────────────────────
	const chartData = useMemo(
		() => ({
			labels: resolvedTeam.map((m) => m.characterDisplayName),
			datasets: [
				{
					label: "Character",
					data: resolvedTeam.map((m) => {
						const char = characters.find((c) => c.name === m.characterName);
						return char ? char.cost[draftMode][ruleSet][m.rank] : 0;
					}),
					backgroundColor: colors.character,
					borderSkipped: true as const,
				},
				{
					label: "Lightcone",
					data: resolvedTeam.map((m) => {
						if (m.lightconeName && m.lightconeRank) {
							const lc = lightcones.find((l) => l.name === m.lightconeName);
							return lc ? lc.cost[draftMode][m.lightconeRank] : 0;
						}
						return 0;
					}),
					backgroundColor: colors.lightcone,
					borderSkipped: true as const,
				},
				{
					label: "Pairing",
					data: resolvedTeam.map((m) => {
						const char = characters.find((c) => c.name === m.characterName);
						return char
							? getPairingCostForCharacter(
									char.name,
									teamCharacterNames,
									synergies,
									ruleSet,
								)
							: 0;
					}),
					backgroundColor: colors.pairing,
					borderSkipped: true as const,
				},
			],
		}),
		[
			resolvedTeam,
			characters,
			lightcones,
			synergies,
			ruleSet,
			colors,
			teamCharacterNames,
		],
	);

	// ── Chart options ─────────────────────────────────────────────────
	const chartOptions = useMemo(
		() => ({
			responsive: true,
			clip: false as const,
			interaction: { intersect: false, mode: "index" as const },
			maintainAspectRatio: false,
			layout: { padding: { top: 24, right: 8 } },
			plugins: {
				legend: { display: false, position: "bottom" as const },
				tooltip: {
					callbacks: {
						label(context: any) {
							const label = context.dataset.label || "";
							const value = context.parsed.y;

							if (label !== "Pairing" || value === 0)
								return `${label}: ${value}`;

							const member = resolvedTeam[context.dataIndex];
							const sourceChar = characters.find(
								(c) => c.name === member.characterName,
							);
							if (!sourceChar) return `${label}: ${value}`;

							const breakdown = synergies
								.filter(
									(p) =>
										p.sourceName === sourceChar.name &&
										teamCharacterNames.includes(p.targetName) &&
										p.ruleSet === ruleSet,
								)
								.map((p) => {
									const targetName =
										characters.find((c) => c.name === p.targetName)
											?.displayName ?? p.targetName;
									return `${targetName}: ${p.costModifier}`;
								})
								.join(", ");

							return `Pairing: ${value} (from ${breakdown})`;
						},
					},
				},
				datalabels: {
					display: true,
					anchor: "end" as const,
					align: "top" as const,
					offset: -4,
					clamp: true,
					color: "rgb(244, 206, 122)",
					font: { weight: "bold" as const, size: 16 },
					formatter(value: number, ctx: any) {
						// Only render on the last dataset (Pairing) to show column totals
						if (ctx.datasetIndex !== 2) return "";

						const member = resolvedTeam[ctx.dataIndex];
						const char = characters.find(
							(c) => c.name === member.characterName,
						);
						if (!char) return "";

						let memberTotal = char.cost[draftMode][ruleSet][member.rank];

						if (member.lightconeName && member.lightconeRank) {
							const lc = lightcones.find(
								(l) => l.name === member.lightconeName,
							);
							if (lc) memberTotal += lc.cost[draftMode][member.lightconeRank];
						}

						memberTotal += getPairingCostForCharacter(
							char.name,
							teamCharacterNames,
							synergies,
							ruleSet,
						);
						return `Σ ${memberTotal.toFixed(1)}`;
					},
				},
			},
			scales: {
				x: {
					stacked: true,
					ticks: {
						color: "white",
						maxRotation: 45,
						minRotation: 0,
						font: { size: 12, weight: "bold" as const },
					},
					grid: { display: false },
				},
				y: {
					stacked: true,
					beginAtZero: true,
					ticks: { display: false },
					grid: { display: true, color: "rgb(55, 65, 81)" },
					title: {
						display: true,
						text: `Cost — ${modeLabel}`,
						color: "rgb(209, 213, 219)",
						font: { size: 14, weight: "bold" as const },
					},
				},
			},
		}),
		[
			resolvedTeam,
			characters,
			lightcones,
			synergies,
			ruleSet,
			teamCharacterNames,
			modeLabel,
		],
	);

	// ── Render ────────────────────────────────────────────────────────
	return (
		<div className={`${styles.costBreakdown} Box`}>
			{/* Header */}
			<div className={styles.header}>
				<h3 className={styles.title}>{`Cost Breakdown — ${modeLabel}`}</h3>

				{/* Mode switch */}
				<button
					onClick={onToggleRuleSet}
					className={`${styles.modeSwitch} ${styles[ruleSet]}`}
					title={`Switch to ${ruleSet === "MemoryOfChaos" ? "Apocalyptic Shadow" : "Memory of Chaos"} rules`}
				>
					<div className={styles.trackBar} />
					<div className={styles.thumb}>
						<img
							className={styles.thumbIcon}
							src={iconMaps.ruleSets[ruleSet]}
							alt={modeLabel}
						/>
					</div>
				</button>
			</div>

			{/* Chart area */}
			<div className={styles.content}>
				{resolvedTeam.length > 0 ? (
					<Bar
						style={{
							position: "absolute",
							bottom: 0,
							left: 0,
							height: "100%",
							width: "100%",
						}}
						data={chartData}
						options={chartOptions}
					/>
				) : (
					<div className={styles.emptyState}>
						{hasRawEntries ? (
							<LoadingSpinner />
						) : (
							<h3>No characters selected</h3>
						)}
					</div>
				)}
			</div>

			{/* Footer: legend + total */}
			<div className={styles.footer}>
				<div className={styles.legend}>
					<div className={styles.legendSection}>
						<div
							className={styles.legendSquare}
							style={{ backgroundColor: colors.character }}
						/>
						<h3 className={styles.legendName}>Character</h3>
					</div>
					<div className={styles.legendSection}>
						<div
							className={styles.legendSquare}
							style={{ backgroundColor: colors.lightcone }}
						/>
						<h3 className={styles.legendName}>Lightcone</h3>
					</div>
					<div className={styles.legendSection}>
						<div
							className={styles.legendSquare}
							style={{ backgroundColor: colors.pairing }}
						/>
						<h3 className={styles.legendName}>Pairing</h3>
					</div>
				</div>

				<h2 className={styles.totalCost}>{`Σ ${totalCost.toFixed(1)}`}</h2>
			</div>
		</div>
	);
}
