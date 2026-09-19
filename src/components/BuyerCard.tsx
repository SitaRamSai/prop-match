import { BadgeCheck, CalendarClock, ChevronRight, Landmark, MapPin, ShieldCheck } from "lucide-react";
import type { Buyer } from "@/data/types";
import { cn, inrRange, inrShort } from "@/lib/utils";
import { Chip, MatchScore, Monogram } from "./ui";

type BuyerCardProps = {
  buyer: Buyer;
  variant?: "deck" | "grid";
  /** Deck cards open their own file — a real button, not a tap gesture. */
  onOpen?: () => void;
  className?: string;
};

export function BuyerCard({ buyer, variant = "deck", onOpen, className }: BuyerCardProps) {
  if (variant === "grid") {
    return (
      <article
        className={cn(
          "paper-stock rounded-card border border-paper-line p-3.5 shadow-paper",
          className,
        )}
      >
        <div className="flex items-center gap-3">
          <Monogram name={buyer.name} size="sm" tone="match" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-[16px] leading-tight text-ink">{buyer.name}</h3>
            <p className="font-mono text-[10.5px] tracking-wide text-ink/60 uppercase">
              {inrShort(buyer.budgetMax)} · {buyer.areas.length} corridors
            </p>
          </div>
          <MatchScore score={buyer.matchScore} size={40} />
        </div>
      </article>
    );
  }

  return (
    <div
      className={cn(
        "paper-stock absolute inset-0 flex flex-col overflow-hidden rounded-card border border-paper-line p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-[11px] tracking-[0.2em] text-ink/55 uppercase">
          Buyer file · {buyer.kind}
        </p>
        <MatchScore score={buyer.matchScore} size={56} />
      </div>

      <div className="mt-4 flex items-center gap-3.5">
        <Monogram name={buyer.name} size="lg" tone="match" />
        <div className="min-w-0">
          <h2 className="font-display text-[25px] leading-[1.05] text-ink">{buyer.name}</h2>
          <p className="mt-0.5 text-[13px] text-ink/70">{buyer.occupation}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {buyer.verified && (
              <Chip tone="paper" icon={<BadgeCheck className="size-3.5" />}>
                Aadhaar / PAN
              </Chip>
            )}
            {buyer.preApproved && (
              <Chip tone="paper" icon={<Landmark className="size-3.5" />}>
                Bank Pre-Sanctioned
              </Chip>
            )}
          </div>
        </div>
      </div>

      <div className="my-4 h-px bg-ink/15" />

      <dl className="grid grid-cols-2 gap-y-3">
        <div>
          <dt className="font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">Budget</dt>
          <dd className="mt-0.5 font-mono text-[19px] leading-none text-match-deep">
            {inrRange(buyer.budgetMin, buyer.budgetMax)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">Timeline</dt>
          <dd className="mt-0.5 text-[13px] font-medium text-ink">{buyer.timeline}</dd>
        </div>
      </dl>

      <p className="mt-4 font-display text-[14.5px] leading-relaxed text-ink/85 italic">
        “{buyer.blurb}”
      </p>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-ink/50" strokeWidth={1.6} />
          <div className="flex flex-wrap gap-1.5">
            {buyer.areas.slice(0, 3).map((area) => (
              <Chip key={area} tone="paper" className="bg-paper-warm">
                {area}
              </Chip>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-ink/50" strokeWidth={1.6} />
          <div className="flex flex-wrap gap-1.5">
            {buyer.mustHaves.map((item) => (
              <Chip key={item} tone="paper" className="bg-paper-dim/60">
                {item}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="tap mt-auto flex w-full items-end justify-between gap-3 border-t border-ink/15 pt-3.5 text-left"
      >
        <span className="min-w-0">
          <span className="block font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">
            Financing
          </span>
          <span className="mt-0.5 block truncate text-[13px] font-medium text-ink">
            {buyer.financing}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-ink/70 uppercase">
          <CalendarClock className="size-3.5" />
          {buyer.toursBooked} visit{buyer.toursBooked === 1 ? "" : "s"}
          <ChevronRight className="size-3.5" />
        </span>
      </button>

      {buyer.preApproved && (
        <span
          aria-hidden="true"
          className="stamp pointer-events-none absolute -bottom-1 right-3 rotate-[-9deg] text-match-deep opacity-80"
        >
          Pre-approved {inrShort(buyer.budgetMax)}
        </span>
      )}
    </div>
  );
}