"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Character, DEFAULT_LIGHTCONE_ANCHOR, DraftMode, LightconeAnchor, Lightcone, LightconeRank } from "@/components/features/types/enums";
import { LoadingSpinner } from "@/components/globals/icons";
import styles from "./LightconeSelector.module.css";

function EmptyLightconeIcon() {
	return (
		<svg
			className={styles.lcEmpty}
			viewBox="0 0 140 160"
			xmlns="http://www.w3.org/2000/svg"
		>
			<polygon
				points="0,0 140,0 90,80 140,160 0,160 50,80"
				fill="none"
				stroke="#cfcfd6"
				strokeWidth="8"
				opacity="0.6"
				strokeLinejoin="round"
			/>
			<rect x="60" y="20" width="20" height="120" fill="white" rx="2" />
			<rect x="10" y="70" width="52" height="20" fill="white" rx="2" />
			<rect x="88" y="70" width="38" height="20" fill="white" rx="2" />
		</svg>
	);
}

interface LightconeSelectorProps {
	lightcones: Lightcone[];
	selectedLightconeName?: string;
	selectedRank?: LightconeRank;
	onLightconeChange: (lightconeName?: string, rank?: LightconeRank) => void;
	equippingCharacter?: Character;
	draftMode?: DraftMode;
}

export function LightconeSelector({
	lightcones,
	selectedLightconeName,
	selectedRank,
	onLightconeChange,
	equippingCharacter,
	draftMode = "Classic",
}: LightconeSelectorProps) {
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [isLightconeImageLoaded, setIsLightconeImageLoaded] = useState<boolean>(false);
	const [isOpen, setIsOpen] = useState<boolean>(false);
	const [isSearching, setIsSearching] = useState<boolean>(false);

	const [signatureLightcone, setSignatureLightcone] = useState<Lightcone | undefined>();
	const [searchTerm, setSearchTerm] = useState("");
	const [filteredLightcones, setFilteredLightcones] = useState<Lightcone[]>([]);

	const selectedLightcone = selectedLightconeName ? lightcones.find((l) => l.name === selectedLightconeName) : undefined;

	// ── Close on outside click ──────────────────────────────────────────
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
				setIsSearching(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// ── Filter lightcones on search ─────────────────────────────────────
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredLightcones([]);
			return;
		}
		const term = searchTerm.toLowerCase().replace(/\s/g, "");
		setFilteredLightcones(
			lightcones.filter(
				(lc) =>
					lc.name !== selectedLightconeName &&
					(lc.displayName.toLowerCase().includes(term) ||
						lc.aliases.some((a) => a.toLowerCase().includes(term))),
			),
		);
	}, [searchTerm, lightcones, selectedLightconeName]);

	// ── Detect signature lightcone ──────────────────────────────────────
	useEffect(() => {
		if (!equippingCharacter) {
			setSignatureLightcone(undefined);
			return;
		}
		if (equippingCharacter.rarity === 5) {
			const charName = equippingCharacter.displayName
				.toLowerCase()
				.replace(/\s/g, "");
			const sig = lightcones.find((lc) =>
				lc.aliases.some(
					(alias) =>
						alias.toLowerCase() === charName ||
						equippingCharacter.aliases.some(
							(ca) => alias.toLowerCase() === ca.toLowerCase(),
						),
				),
			);
			setSignatureLightcone(sig);
		} else {
			setSignatureLightcone(undefined);
		}
	}, [equippingCharacter, lightcones]);

	// ── Image load tracking ─────────────────────────────────────────────
	const handleImageRef = (img: HTMLImageElement | null) => {
		if (img?.complete && img.naturalHeight > 0) setIsLightconeImageLoaded(true);
	};
	useEffect(() => setIsLightconeImageLoaded(false), [selectedLightconeName]);

	// ── Handlers ────────────────────────────────────────────────────────
	const handleChangeInput = (e: ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setIsOpen(true);
		setIsSearching(true);
	};

	const handleFocusInput = () => {
		if (selectedLightcone && !isSearching) {
			setIsSearching(true);
			setSearchTerm("");
		}
		setIsOpen(true);
	};

	const handleSelectLightcone = (lc: Lightcone) => {
		// Limited = S1 default, shop/free = S5
		const isLimited = lc.rarity === 5 && !lc.aliases.some((a) => a.toLowerCase() === "shop");

		onLightconeChange(lc.name, isLimited ? "S1" : "S5");
		setSearchTerm("");
		setIsOpen(false);
		setIsSearching(false);
	};

	const handleClearLightcone = () => {
		onLightconeChange(undefined, undefined);
		setSearchTerm("");
		setIsOpen(false);
		setIsSearching(false);
	};

	// ── Render ──────────────────────────────────────────────────────────
	const anchor: LightconeAnchor = selectedLightcone?.anchor ?? DEFAULT_LIGHTCONE_ANCHOR;

	return (
		<div className={styles.root} ref={dropdownRef}>
			{/* Search input */}
			<div
				className={styles.inputWrapper}
				title={
					selectedLightcone
						? `${selectedRank ?? "S1"} ${selectedLightcone.displayName}`
						: undefined
				}
			>
				<input
					className={styles.searchBar}
					value={
						isSearching || !selectedLightcone
							? searchTerm
							: selectedLightcone.displayName
					}
					onChange={handleChangeInput}
					onFocus={handleFocusInput}
					placeholder={selectedLightcone?.displayName || "Select Lightcone"}
					name="lightcone"
					autoComplete="off"
					style={{
						color:
							selectedLightcone && !isSearching
								? `var(--lc-${selectedLightcone.rarity}star)`
								: undefined,
					}}
				/>
			</div>

			{/* Art divider (border behind LC image) */}
			{selectedLightcone && isLightconeImageLoaded && (
				<div className={`${styles.lightconeSlot} ${styles.divider}`} />
			)}

			{/* Lightcone art preview */}
			<div className={styles.lightconeSlot}>
				{selectedLightcone ? (
					<>
						{!isLightconeImageLoaded && (
							<LoadingSpinner className={styles.loading} />
						)}
						<img
							src={selectedLightcone.imageUrl || ""}
							className={styles.lcArt}
							alt={selectedLightcone.name}
							ref={handleImageRef}
							onLoad={() => setIsLightconeImageLoaded(true)}
							style={{
								opacity: isLightconeImageLoaded ? 1 : 0,
								width: `${anchor!.width}%`,
								transform: `translate(${anchor!.x}%, ${anchor!.y}%)`,
							}}
						/>
					</>
				) : (
					<EmptyLightconeIcon />
				)}
			</div>

			{/* Dropdown results */}
			{isOpen && (
				<div className={styles.resultSet}>
					{selectedLightcone && (
						<button
							onClick={handleClearLightcone}
							className={styles.unequipButton}
						>
							Unequip Lightcone
						</button>
					)}

					{filteredLightcones.length > 0 ? (
						filteredLightcones.slice(0, 12).map((lc) => (
							<button
								key={lc.name}
								onClick={() => handleSelectLightcone(lc)}
								className={styles.lightcone}
							>
								<span
									className={styles.lcName}
									style={{ color: `var(--lc-${lc.rarity}star)` }}
								>
									{lc.displayName}
								</span>
								<span className={styles.cost}>
									{lc.cost[draftMode].S1.toFixed(1)}
								</span>
							</button>
						))
					) : (
						<h3 className={styles.info}>
							{searchTerm.trim() === ""
								? "Start typing to search..."
								: "No Lightcones found."}
						</h3>
					)}

					{!selectedLightcone &&
						signatureLightcone &&
						searchTerm.trim() === "" && (
							<button
								onClick={() => handleSelectLightcone(signatureLightcone)}
								className={styles.sigLc}
							>
								<span className={styles.sigName}>
									{signatureLightcone.displayName}
								</span>
								<span
									className={styles.sigInfo}
								>{`${equippingCharacter?.displayName}'s Signature`}</span>
							</button>
						)}
				</div>
			)}
		</div>
	);
}
