/**
 * Purely decorative. Abstract, not a stand-in for a real fundus photo, so
 * it's marked aria-hidden and carries no alt text: nothing here conveys
 * information that isn't already in the surrounding page copy.
 */
export function RetinaScanIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className={className}>
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="var(--color-muted)"
        stroke="var(--color-border)"
        strokeWidth="2"
      />
      <g stroke="var(--color-primary)" strokeWidth="2" fill="none" opacity="0.25">
        <circle cx="200" cy="200" r="140" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="100" strokeDasharray="4 10" />
      </g>
      <g
        stroke="var(--color-primary)"
        strokeWidth="3"
        fill="none"
        opacity="0.55"
        strokeLinecap="round"
      >
        <path d="M 200 90 C 160 130, 230 160, 200 200" />
        <path d="M 200 200 C 175 235, 240 250, 220 300" />
        <path d="M 200 200 C 230 180, 260 210, 280 190" />
      </g>
      <circle cx="200" cy="200" r="26" fill="none" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" />
      <circle cx="200" cy="200" r="14" fill="var(--color-primary)" />
    </svg>
  );
}
