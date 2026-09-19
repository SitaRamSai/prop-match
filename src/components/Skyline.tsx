/** Hand-drawn skyline motif — rooftops and a lagoon bridge, drawn on entry.
 *  Decorative only, so it stays out of the accessibility tree. */
export function Skyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 84"
      fill="none"
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
    >
      <g className="skyline">
        <path
          d="M0 82h40V54h16v28h20V40h26v42h12V32h24v50h18V60h22v22h16V46h26v36h22V66h18v16h22V52h14v30h20V72h18v10h46"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M6 82c14-9 26-9 40 0 14-9 26-9 40 0 14-9 26-9 40 0"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          d="M250 74h120"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeDasharray="4 6"
          opacity="0.6"
        />
      </g>
      <circle cx="352" cy="26" r="6.5" fill="var(--color-match)" />
      <circle cx="352" cy="26" r="12" stroke="var(--color-match)" strokeWidth="0.9" opacity="0.4" />
    </svg>
  );
}