import { BadgeCheck, Bath, BedDouble, ChevronRight, MapPin, Ruler, Sparkles } from "lucide-react";
import type { Listing } from "@/data/types";
import { cn, inrShort } from "@/lib/utils";
import { listingPhoto } from "@/data/listings";
import { Chip, MatchScore, Monogram, Photo } from "./ui";

type Variant = "deck" | "grid";

type PropertyCardProps = {
  listing: Listing;
  variant?: Variant;
  priority?: boolean;
  /** Deck cards carry their own "open dossier" button — a real button, so it is
   *  reachable by keyboard and never fights the drag gesture. */
  onOpen?: () => void;
  className?: string;
};

const STATUS_COPY: Record<Listing["status"], string> = {
  verified: "Verified listing",
  new: "New this week",
  relisted: "Back on market",
};

/** The "profile" of a property: photo-led, price set in ledger mono, and the
 *  seller tucked into the corner like a business card. */
export function PropertyCard({ listing, variant = "deck", priority, onOpen, className }: PropertyCardProps) {
  if (variant === "grid") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-card border border-ink-line bg-ink-soft shadow-print",
          className,
        )}
      >
        <div className="relative">
          <Photo
            src={listingPhoto(listing, 0, 700)}
            alt={`${listing.title}, ${listing.area}`}
            className="aspect-[4/3] w-full"
          />
          <div className="absolute top-2.5 right-2.5">
            <MatchScore score={listing.matchScore} size={44} />
          </div>
          <div className="absolute bottom-2.5 left-2.5">
            <Chip tone="paper" icon={<MapPin className="size-3.5" />}>
              {listing.area}
            </Chip>
          </div>
        </div>
        <div className="px-3.5 pt-3 pb-3.5">
          <h3 className="font-display text-[17px] leading-snug text-bone">{listing.title}</h3>
          <p className="mt-1.5 font-mono text-[15px] text-match-soft">
            {inrShort(listing.price)}
            {listing.listingKind === "rent" && (
              <span className="text-[12px] text-bone-faint">/mo</span>
            )}
          </p>
          <ListingSpecs listing={listing} className="mt-2" />
        </div>
      </article>
    );
  }

  return (
    <div className={cn("absolute inset-0 flex flex-col overflow-hidden rounded-card bg-ink-soft", className)}>
      {/* hero: fully visible, only a whisper of scrim behind the chips */}
      <div className="relative min-h-0 flex-1">
        <Photo
          src={listingPhoto(listing, 0, 1000)}
          alt={`${listing.title} in ${listing.area}, ${listing.city}`}
          className="absolute inset-0"
          priority={priority}
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/70 to-transparent"
        />

        {/* story bar — signals more photos exist without stealing taps */}
        <div className="absolute inset-x-3 top-[max(0.6rem,env(safe-area-inset-top))] z-10 flex gap-1">
          {listing.photos.map((photo, i) => (
            <span
              key={photo}
              className={cn("h-[3px] flex-1 rounded-pill", i === 0 ? "bg-paper" : "bg-paper/40")}
            />
          ))}
        </div>

        <div className="absolute inset-x-3 top-6 z-10 flex items-start justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="paper" icon={<MapPin className="size-3.5" />}>
              {listing.area}
            </Chip>
            {listing.featured ? (
              <Chip tone="gold" icon={<Sparkles className="size-3.5" />}>
                Featured
              </Chip>
            ) : (
              <Chip
                tone={listing.status === "verified" ? "verify" : "outline"}
                icon={listing.status === "verified" ? <BadgeCheck className="size-3.5" /> : undefined}
                className={listing.status !== "verified" ? "bg-ink/70 text-bone" : undefined}
              >
                {STATUS_COPY[listing.status]}
              </Chip>
            )}
          </div>
          <MatchScore score={listing.matchScore} size={56} />
        </div>
      </div>

      {/* caption panel: the ledger — no gradient fighting the type */}
      <div className="shrink-0 border-t border-ink-line bg-ink-soft px-4 pt-3 pb-3.5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.18em] text-bone-dim uppercase">
            {listing.type} · {listing.tenure}
          </p>
          <p className="shrink-0 font-mono text-[22px] leading-none text-match-soft">
            {inrShort(listing.price)}
            {listing.listingKind === "rent" && <span className="text-[12px] text-bone-dim">/mo</span>}
          </p>
        </div>
        <h2 className="mt-1.5 font-display text-[23px] leading-[1.08] text-bone">{listing.title}</h2>

        <ListingSpecs listing={listing} className="mt-2" />

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {listing.tags.slice(0, 2).map((tag) => (
            <Chip key={tag}>{tag}</Chip>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="tap mt-3 flex w-full items-center gap-2.5 rounded-xl border border-paper-line/40 bg-paper/95 px-3 py-2.5 text-left text-ink"
        >
          <Monogram name={listing.seller.name} size="xs" tone="match" />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 truncate text-[13px] font-semibold">
              {listing.seller.name}
              {listing.seller.verified && <BadgeCheck className="size-3.5 text-match-deep" />}
            </span>
            <span className="block truncate font-mono text-[10.5px] tracking-wide text-ink/60 uppercase">
              {listing.seller.agency} · {listing.seller.dealsClosed} closings
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-0.5 font-mono text-[10px] tracking-[0.14em] text-ink/75 uppercase">
            Dossier
            <ChevronRight className="size-3.5" />
          </span>
        </button>
      </div>
    </div>
  );
}

/** BHK · baths · size in sq.ft */
export function ListingSpecs({ listing, className }: { listing: Listing; className?: string }) {
  const items = [
    listing.beds > 0 && { icon: BedDouble, label: `${listing.beds} BHK` },
    listing.baths > 0 && { icon: Bath, label: `${listing.baths} Bath` },
    { icon: Ruler, label: `${listing.sqm.toLocaleString()} sq.ft` },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string }[];

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-3.5 gap-y-1", className)}>
      {items.map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5 text-[13px] text-bone">
          <Icon className="size-4 text-bone-dim" strokeWidth={1.6} />
          <span className="tabular">{label}</span>
        </li>
      ))}
    </ul>
  );
}