"use client";

import { useState } from "react";
import styles from "./LoadoutControls.module.css";
import { ClearIcon, EditIcon } from "@/components/globals/icons";
import { Loadout } from "../LoadoutManager";
import { Character } from "../../types/enums";
import { LoadoutDropdown } from "../loadout-dropdown/LoadoutDropdown";

interface LoadoutControlsProps {
	loadouts: Loadout[];
	loadoutIndex: number;
	currentLoadout: Loadout;
	characters: Character[];
	onSelectIndex: (index: number) => void;
	onClearTeam: () => void;
	onRenameCurrent: (name: string) => void;
}

export function LoadoutControls({
	loadouts,
	loadoutIndex,
	currentLoadout,
	characters,
	onSelectIndex,
	onClearTeam,
	onRenameCurrent,
}: LoadoutControlsProps) {
	const [editingName, setEditingName] = useState(false);
	const [tempName, setTempName] = useState("");

	const defaultName = `Team ${loadoutIndex + 1}`;

	const handleStartEditing = () => {
		setTempName(currentLoadout.name === defaultName ? "" : currentLoadout.name);
		setEditingName(true);
	};

	const handleNameSubmit = () => {
		onRenameCurrent(tempName.trim() || defaultName);
		setEditingName(false);
	};

	return (
		<div className={`${styles.controls} Box`}>
			{/* Header: name / edit */}
			<div className={styles.controlsHeader}>
				{!editingName ? (
					<h1
						className={styles.loadoutName}
						onClick={handleStartEditing}
						title="Click to Edit"
					>
						{currentLoadout.name}
						<EditIcon />
						{currentLoadout.name !== defaultName && (
							<span className={styles.helperText}>{defaultName}</span>
						)}
					</h1>
				) : (
					<input
						className={styles.nameEditor}
						value={tempName}
						onChange={(e) => setTempName(e.target.value)}
						onBlur={handleNameSubmit}
						onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
						placeholder={defaultName}
						autoFocus
						maxLength={20}
						name="team-name"
					/>
				)}
			</div>

			{/* Action buttons */}
			<div className={styles.controlsContent}>
				<LoadoutDropdown
					loadouts={loadouts}
					loadoutIndex={loadoutIndex}
					characters={characters}
					onSelectIndex={onSelectIndex}
				/>

				<button
					onClick={onClearTeam}
					className={`${styles.button} ${styles.clearBtn}`}
					title="Clear Loadout"
				>
					<ClearIcon />
					<span>Clear</span>
				</button>

				<button
					className={`${styles.button} ${styles.menuBtn}`}
					title="Open Menu"
				>
					<span>Loadout Menu (WIP)</span>
				</button>
			</div>
		</div>
	);
}
