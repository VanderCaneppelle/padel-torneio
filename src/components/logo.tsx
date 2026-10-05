export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="24" height="28" viewBox="0 0 24 28" fill="none" aria-hidden>
        <path d="M6 0H14L8 28H0L6 0Z" fill="var(--color-accent)" />
        <path d="M16 0H24L18 28H10L16 0Z" fill="var(--color-accent)" fillOpacity="0.35" />
      </svg>
      <span className="font-display text-lg leading-none tracking-tight">
        QUORA<span className="text-accent">CUP</span>
      </span>
    </span>
  );
}
