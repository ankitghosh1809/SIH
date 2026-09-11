/**
 * Purely decorative. Abstract, not a stand-in for a real fundus photo, so
 * it's marked aria-hidden and carries no alt text: nothing here conveys
 * information that isn't already in the surrounding page copy. Recolored
 * for the light hero as part of the minimalist-ui pass — same structure,
 * now built entirely from --color-primary at varying opacity instead of
 * a dedicated dark-mode accent pair.
 */
export function RetinaScanIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" aria-hidden="true" className={className}>
      <defs>
        <filter id="retina-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="retina-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="200" cy="200" r="190" fill="url(#retina-fade)" />
      <circle
        cx="200"
        cy="200"
        r="180"
        fill="none"
        stroke="var(--color-border)"
        strokeWidth="1.5"
      />
      <g stroke="var(--color-primary)" strokeWidth="1.5" fill="none" opacity="0.35">
        <circle cx="200" cy="200" r="140" strokeDasharray="4 10" />
        <circle cx="200" cy="200" r="100" strokeDasharray="4 10" />
      </g>
      <g
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        fill="none"
        opacity="0.9"
        strokeLinecap="round"
        filter="url(#retina-glow)"
      >
        <path d="M 200 90 C 160 130, 230 160, 200 200" />
        <path d="M 200 200 C 175 235, 240 250, 220 300" />
        <path d="M 200 200 C 230 180, 260 210, 280 190" />
      </g>
      <circle
        cx="200"
        cy="200"
        r="26"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        opacity="0.5"
      />
      <circle cx="200" cy="200" r="12" fill="var(--color-primary)" filter="url(#retina-glow)" />
    </svg>
  );
}
