import { useState, type CSSProperties, type ReactNode } from "react";
import { Building2 } from "lucide-react";
import { cn, initials } from "@/lib/utils";

/* ------------------------------------------------------------------ Photo */

type PhotoProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

/** Lazy photo with a warm ink placeholder and a geometric fallback, so the
 *  layout never breaks if a CDN image fails. */
export function Photo({ src, alt, className, imgClassName, priority }: PhotoProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div className={cn("relative overflow-hidden bg-ink-lift", className)}>
      {status === "loading" && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-ink-lift via-ink-soft to-ink"
        />
      )}
      {status === "error" ? (
        <div
          className="absolute inset-0 grid place-items-center bg-gradient-to-br from-ink-lift to-ink-soft"
          role="img"
          aria-label={alt}
        >
          <Building2 className="size-9 text-bone-faint" strokeWidth={1.2} />
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-700 ease-out",
            status === "ready" ? "opacity-100" : "opacity-0",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------- Monogram */

type MonogramProps = {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  tone?: "paper" | "ink" | "match";
  className?: string;
};

const MONO_SIZE: Record<NonNullable<MonogramProps["size"]>, string> = {
  xs: "size-8 text-[13px]",
  sm: "size-10 text-sm",
  md: "size-12 text-base",
  lg: "size-16 text-xl",
  xl: "size-24 text-3xl",
};

/** Monograms instead of headshots — privacy by default, and it keeps the
 *  brand's editorial feel instead of showing a grid of stock faces. */
export function Monogram({ name, size = "sm", tone = "paper", className }: MonogramProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-semibold tracking-tight",
        MONO_SIZE[size],
        tone === "paper" && "bg-paper text-ink",
        tone === "ink" && "bg-ink-lift text-bone ring-1 ring-ink-line",
        tone === "match" && "bg-match text-paper",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------ MatchScore */

type MatchScoreProps = {
  score: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
};

/** Conic gauge. 90+ turns vermillion; lower scores stay quiet bone so the
 *  strongest matches are the only thing shouting. */
export function MatchScore({ score, size = 54, showLabel = false, className }: MatchScoreProps) {
  const ring =
    score >= 90 ? "var(--color-match)" : score >= 80 ? "var(--color-gold)" : "var(--color-bone-dim)";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="score-ring grid place-items-center rounded-full p-[3px]"
        style={{ width: size, height: size, "--score": score, "--ring-color": ring } as CSSProperties}
        role="img"
        aria-label={`${score} percent match`}
      >
        <span
          className="grid size-full place-items-center rounded-full bg-ink/85 backdrop-blur-sm"
          style={{ fontSize: size * 0.31 }}
        >
          <span className="font-mono tabular leading-none text-bone">
            {score}
            <span className="text-[0.6em] text-bone-dim">%</span>
          </span>
        </span>
      </div>
      {showLabel && (
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-bone-dim">match</span>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- Chip */

type ChipProps = {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "outline" | "paper" | "match" | "gold" | "verify" | "ink";
  size?: "sm" | "md";
  className?: string;
};

export function Chip({ children, icon, tone = "outline", size = "sm", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill border font-medium whitespace-nowrap",
        size === "sm" ? "px-2.5 py-1 text-[12px]" : "px-3.5 py-1.5 text-[13px]",
        tone === "outline" && "border-ink-line bg-ink-soft/70 text-bone-dim",
        tone === "ink" && "border-ink-line bg-ink text-bone",
        tone === "paper" && "border-paper-line/60 bg-paper/95 text-ink",
        tone === "match" && "border-match/45 bg-match/15 text-match-soft",
        tone === "gold" && "border-gold/40 bg-gold/15 text-gold",
        tone === "verify" && "border-verify/40 bg-verify/15 text-verify",
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/* --------------------------------------------------------------- Section */

export function SectionTitle({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.24em] text-bone-faint">{children}</h2>
      {action}
    </div>
  );
}