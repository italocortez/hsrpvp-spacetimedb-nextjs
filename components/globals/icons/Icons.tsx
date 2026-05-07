export interface Icon {
	name: string;
	imageUrl: string;
}

interface IconProps {
	className?: string;
}

export function ClearIcon({ className }: IconProps) {
	return (
		<svg
			className={className}
			width="1.375rem"
			height="1.375rem"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M18 6L6 18M6 6L18 18"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function EditIcon() {
  return (
    <svg width="1rem" height="1rem" viewBox="0 0 528.899 528.899" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ cursor: "text" }}>
      <path d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z" />
    </svg>
  );
}

export function SynergyIcon() {
  return (
    <svg className="synergy-icon" xmlns="http://www.w3.org/2000/svg" fill="#b800b8ff" viewBox="0 0 24 24">
      <title>Synergizes greatly with a teammate</title>
      <path d="M10.962 15.867a2.469 2.469 0 0 1-.69 1.377l-1.029 1.028a2.5 2.5 0 0 1-3.536-3.536l1.029-1.029a2.464 2.464 0 0 1 1.423-.694l1.781-1.781a4.425 4.425 0 0 0-4.619 1.062l-1.028 1.028a4.5 4.5 0 0 0 6.364 6.364l1.029-1.029a4.489 4.489 0 0 0 1.073-4.587zM19.686 4.293a4.511 4.511 0 0 0-6.364 0l-1.029 1.029a4.49 4.49 0 0 0-1.063 4.62l1.779-1.779a2.476 2.476 0 0 1 .7-1.427l1.029-1.029a2.5 2.5 0 0 1 3.536 3.536l-1.029 1.029a2.484 2.484 0 0 1-1.379.693l-1.796 1.794a4.409 4.409 0 0 0 4.587-1.072l1.029-1.029a4.5 4.5 0 0 0 0-6.365z" />
      <path d="M9 16a1 1 0 0 1-.707-1.707l6-6a1 1 0 0 1 1.414 1.414l-6 6A1 1 0 0 1 9 16z" />
    </svg>
  );
}

export function DropdownIcon({ isOpen = false }: { isOpen?: boolean }) {
  return (
    <svg
      width="1.5rem"
      height="1.5rem"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transition: "transform 200ms", transform: isOpen ? "rotate(180deg)" : undefined }}
    >
      <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: "1.5rem",
        height: "1.5rem",
        border: "2px solid rgba(255,255,255,0.2)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.6s linear infinite",
      }}
    />
  );
}

export function SortIcon({ direction, isActive }: { direction: 'ascending' | 'descending'; isActive: boolean }) {
  const activeColor = 'rgb(34, 211, 238)';
  const inactiveColor = 'rgb(156, 163, 175)';
  const upActive = isActive && direction === 'ascending';
  const downActive = isActive && direction === 'descending';

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: '0.25rem', opacity: 0.6 }}>
      <svg
        style={{ width: '0.75rem', height: '0.75rem', color: upActive ? activeColor : inactiveColor, transition: 'color 200ms, transform 200ms', transform: upActive ? 'scale(1.1)' : undefined, opacity: upActive ? 1 : undefined }}
        fill="currentColor" viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
      </svg>
      <svg
        style={{ width: '0.75rem', height: '0.75rem', color: downActive ? activeColor : inactiveColor, transition: 'color 200ms, transform 200ms', transform: downActive ? 'scale(1.1)' : undefined, opacity: downActive ? 1 : undefined, marginTop: '-0.25rem' }}
        fill="currentColor" viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export function ExpanderIcon({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      width="1rem" height="1rem" viewBox="0 0 16 16"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ transition: 'transform 200ms', transform: isExpanded ? 'rotate(90deg)' : undefined }}
    >
      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
