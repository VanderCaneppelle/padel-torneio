export function DiagonalLines({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <path
        d="M 620 -40 L 900 260"
        stroke="var(--color-accent)"
        strokeOpacity="0.35"
        strokeWidth="2"
      />
      <path
        d="M 520 -60 L 860 320"
        stroke="var(--color-accent)"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      <path
        d="M 420 -80 L 820 380"
        stroke="var(--color-accent)"
        strokeOpacity="0.12"
        strokeWidth="2"
      />
    </svg>
  );
}
