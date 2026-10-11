/** Mizan mark: a balance beam resting on a fulcrum, drawn on the 8px grid. */
export function LogoMark({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="0.5" y="0.5" width="23" height="23" rx="6.5" fill="var(--surface-3)" stroke="var(--border-strong)" />
      <path d="M5 10.5h14" stroke="var(--accent)" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M12 10.5 8.75 18h6.5L12 10.5Z" fill="var(--text)" fillOpacity="0.9" />
      <circle cx="12" cy="7" r="1.5" fill="var(--accent)" />
    </svg>
  );
}
