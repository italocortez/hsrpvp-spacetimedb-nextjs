"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/app/(public)/teambuilder/page.module.css";
import { Loadout, TEAM_SIZE, TeamMember } from "./LoadoutManager";
import { Character } from "../types/enums";
import { DropdownIcon } from "@/components/globals/icons";
import { iconMaps } from "../hooks/useIconMaps";
import { NOT_FOUND_IMAGE, handleImageError } from "@/lib/image-fallback";

interface LoadoutDropdownProps {
	loadouts: Loadout[];
	loadoutIndex: number;
	characters: Character[];
	onSelectIndex: (index: number) => void;
}

export function LoadoutDropdown({
	loadouts,
	loadoutIndex,
	characters,
	onSelectIndex,
}: LoadoutDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	// WR-06: close-on-select replaces the dual-listener pattern (mousedown outside-close +
	// click inside-button-close). Single mousedown handles outside-click; inner buttons close
	// the menu by calling handleSelect directly.
	const handleSelect = (idx: number) => {
		onSelectIndex(idx);
		setIsOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className={styles.rosters}>
			<button
				ref={triggerRef}
				onClick={() => setIsOpen((o) => !o)}
				className={styles.selectButton}
				title="Select Team"
			>
				<DropdownIcon isOpen={isOpen} />
				<span>Select Loadout</span>
			</button>

			{isOpen && (
				<div className={styles.rostersList} ref={dropdownRef}>
					<div className={styles.dropdownHeader}>
						<h2 className={styles.dropdownTitle}>Loadout Overview</h2>
					</div>

					{loadouts.map((loadout, idx) => (
						<button
							key={idx}
							disabled={idx === loadoutIndex}
							onClick={() => handleSelect(idx)}
							className={styles.teamOption}
						>
							<h3
								className={styles.teamOptionTitle}
								style={{ color: idx === loadoutIndex ? "rgb(229, 203, 148)" : undefined }}
							>
								{`${loadout.name}${idx === loadoutIndex ? " (Selected)" : ""}`}
							</h3>

							<div className={styles.miniGrid}>
								{Array.from({ length: TEAM_SIZE }, (_, ci) => {
									const member: TeamMember | undefined = loadout.team[ci];
									if (!member) {
										return (
											<div
												key={ci}
												className={`${styles.miniSlot} ${styles.miniEmpty}`}
											>
												<h3>Empty</h3>
											</div>
										);
									}

									const char = characters.find((c) => c.name === member.characterName);
									if (!char) return null;

									return (
										<div
											key={ci}
											className={styles.miniSlot}
											data-rarity={char.rarity}
											style={{ background: `var(--gradient-${char.rarity}star)` }}
										>
											<img
												src={iconMaps.elements[char.element] || NOT_FOUND_IMAGE}
												className={styles.miniElement}
												alt={char.element}
												decoding="async"
												onError={handleImageError}
											/>
											<img
												src={char.imageUrl || NOT_FOUND_IMAGE}
												className={styles.miniPortrait}
												alt={char.displayName}
												decoding="async"
												onError={handleImageError}
											/>
										</div>
									);
								})}
							</div>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
