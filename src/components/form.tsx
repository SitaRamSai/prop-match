import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ Field */

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <p className="font-mono text-[10.5px] tracking-[0.2em] text-ink/55 uppercase">{label}</p>
      {children}
      {hint && <p className="mt-1.5 text-[12px] leading-snug text-ink/50">{hint}</p>}
    </div>
  );
}

export function TextInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "mt-2 w-full rounded-xl border border-ink/15 bg-paper-warm px-3.5 py-3 text-[15px] text-ink",
        "placeholder:text-ink/35 focus:border-match focus:bg-paper focus:outline-none",
        className,
      )}
    />
  );
}

/* ------------------------------------------------------------ ToggleChip */

type ToggleChipProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
};

/** Multi-select chip designed for thumbs: 40px tall, generous hit area. */
export function ToggleChip({ active, onClick, children, icon, className }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "tap inline-flex min-h-[38px] items-center gap-1.5 rounded-pill border px-3.5 text-[13px] font-medium",
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/18 bg-paper-warm/70 text-ink/70 hover:border-ink/35",
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- RangeField */

type RangeFieldProps = {
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  format: (value: number) => string;
  minLabel?: string;
  maxLabel?: string;
  /** Single-thumb mode for values like an asking price. */
  single?: boolean;
};

/** Dual-thumb budget control: two native sliders over a shared track, with the
 *  selected band painted in match-red. Native inputs keep it accessible. */
export function RangeField({
  min,
  max,
  step,
  value,
  onChange,
  format,
  minLabel = "Minimum",
  maxLabel = "Maximum",
  single = false,
}: RangeFieldProps) {
  const [lo, hi] = value;
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  // The two sliders overlap, so each input ignores pointer events and only its
  // thumb is interactive — otherwise the top input would swallow every touch.
  const slider =
    "pointer-events-none absolute inset-0 w-full appearance-none bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-6 " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full " +
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-paper " +
    "[&::-webkit-slider-thumb]:bg-ink [&::-moz-range-thumb]:pointer-events-auto " +
    "[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-paper [&::-moz-range-thumb]:bg-ink";

  return (
    <div>
      <div className="flex items-baseline justify-between">
        {single ? (
          <span className="font-mono text-[22px] text-match-deep">{format(hi)}</span>
        ) : (
          <>
            <span className="font-mono text-[17px] text-match-deep">{format(lo)}</span>
            <span className="font-mono text-[11px] text-ink/45">to</span>
            <span className="font-mono text-[17px] text-match-deep">{format(hi)}</span>
          </>
        )}
      </div>

      <div className="relative mt-3 h-10">
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-pill bg-ink/12" />
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-pill bg-match"
          style={single ? { left: 0, width: `${pct(hi)}%` } : { left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        {!single && (
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={lo}
            aria-label={minLabel}
            onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
            className={slider}
          />
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label={maxLabel}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className={slider}
        />
      </div>
    </div>
  );
}