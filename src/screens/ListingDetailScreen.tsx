import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Bath,
  BedDouble,
  CalendarClock,
  Check,
  ChevronLeft,
  Heart,
  MapPin,
  MessageCircle,
  Ruler,
  Share2,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Chip, MatchScore, Monogram, Photo, SectionTitle } from "@/components/ui";
import { getListing, listingPhoto } from "@/data/listings";
import { cn, firstName, inrExact, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

const SLOTS = ["Sat 11:00 AM", "Sun 3:00 PM", "Mon 6:00 PM"];

export function ListingDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { decisions, decide, getOrCreateThread } = useApp();
  const listing = getListing(id);
  const [index, setIndex] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const gallery = useRef<HTMLDivElement>(null);

  if (!listing) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.2em] text-bone-faint uppercase">
          Listing not found
        </p>
        <button
          type="button"
          onClick={() => navigate("/discover")}
          className="tap rounded-pill bg-match px-5 py-3 text-[14px] font-semibold text-paper"
        >
          Back to the deck
        </button>
      </div>
    );
  }

  const decision = decisions[listing.id];

  function step(to: number) {
    const next = Math.max(0, Math.min(listing!.photos.length - 1, to));
    const width = gallery.current?.clientWidth ?? 0;
    gallery.current?.scrollTo({ left: next * width, behavior: "smooth" });
    setIndex(next);
  }

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: listing!.title,
          text: `${listing!.title} in ${listing!.area} · ${inrShort(listing!.price)}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="scroll-area no-scrollbar flex-1 pb-28">
        {/* gallery */}
        <div className="relative">
          <div
            ref={gallery}
            onScroll={(event) => {
              const el = event.currentTarget;
              setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
            }}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          >
            {listing.photos.map((photo, i) => (
              <Photo
                key={photo}
                src={listingPhoto(listing, i, 1000)}
                alt={`${listing.title} — photo ${i + 1}`}
                className="aspect-[4/5] w-full shrink-0 snap-center"
                priority={i === 0}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-3 top-[max(0.75rem,env(safe-area-inset-top))] flex gap-1">
            {listing.photos.map((photo, i) => (
              <span
                key={photo}
                className={cn("h-1 flex-1 rounded-pill", i === index ? "bg-paper" : "bg-paper/35")}
              />
            ))}
          </div>

          <div className="absolute inset-x-3 top-[max(1.9rem,calc(env(safe-area-inset-top)+1.15rem))] flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="tap grid size-10 place-items-center rounded-full bg-ink/75 text-bone backdrop-blur-sm"
            >
              <ChevronLeft className="size-5" strokeWidth={1.8} />
              <span className="sr-only">Go back</span>
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => decide(listing.id, decision === "shortlist" ? "pass" : "shortlist")}
              aria-pressed={decision === "shortlist"}
              className={cn(
                "tap grid size-10 place-items-center rounded-full backdrop-blur-sm",
                decision === "shortlist" ? "bg-gold text-ink" : "bg-ink/75 text-bone",
              )}
            >
              <Star className="size-5" strokeWidth={1.8} />
              <span className="sr-only">Shortlist this property</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="tap relative grid size-10 place-items-center rounded-full bg-ink/75 text-bone backdrop-blur-sm"
            >
              <Share2 className="size-4.5" />
              <span className="sr-only">Share this listing</span>
              {copied && (
                <span className="pointer-events-none absolute -bottom-8 right-0 rounded bg-match px-2 py-0.5 text-[10px] text-paper whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>

          <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[24px] leading-none text-paper drop-shadow">
                {inrShort(listing.price)}
                {listing.listingKind === "rent" && (
                  <span className="text-[12px] text-paper/80">/month</span>
                )}
              </p>
              <p className="mt-1 font-mono text-[10.5px] tracking-[0.16em] text-paper/80 uppercase">
                {inrExact(listing.price)}
              </p>
            </div>
            <MatchScore score={listing.matchScore} size={56} />
          </div>
        </div>

        <div className="px-4 pt-5">
          <div className="flex flex-wrap gap-1.5">
            <Chip tone="paper" icon={<MapPin className="size-3.5" />}>
              {listing.area}, Hyderabad
            </Chip>
            <Chip tone="verify" icon={<BadgeCheck className="size-3.5" />}>
              TG RERA Approved
            </Chip>
            {listing.featured && <Chip tone="gold">Featured</Chip>}
          </div>

          <h1 className="mt-3 font-display text-[28px] leading-[1.04] text-bone">{listing.title}</h1>
          <p className="mt-2 font-mono text-[10.5px] tracking-[0.18em] text-bone-faint uppercase">
            {listing.type} · {listing.tenure}
          </p>

          <div className="mt-4 flex items-center gap-2">
            <div className="flex flex-1 gap-1.5">
              {listing.photos.map((photo, i) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => step(i)}
                  aria-label={`Show photo ${i + 1} of ${listing.photos.length}`}
                  className={cn("h-1.5 flex-1 rounded-pill", i === index ? "bg-match" : "bg-ink-line")}
                />
              ))}
            </div>
            <span className="font-mono text-[10.5px] text-bone-faint">
              {index + 1}/{listing.photos.length}
            </span>
          </div>

          <section className="paper-stock mt-5 rounded-card border border-paper-line p-4 shadow-paper">
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] tracking-[0.2em] text-ink/55 uppercase">
                Why this matched
              </p>
              <MatchScore score={listing.matchScore} size={44} />
            </div>
            <ul className="mt-3 space-y-2">
              {listing.matchReasons.map((reason) => (
                <li key={reason} className="flex gap-2 text-[13.5px] leading-relaxed text-ink/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-match-deep" strokeWidth={2.2} />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <dl className="mt-4 grid grid-cols-2 gap-2.5">
            {[
              { icon: BedDouble, label: "Bedrooms", value: listing.beds > 0 ? `${listing.beds} BHK` : "Plot" },
              { icon: Bath, label: "Bathrooms", value: listing.baths > 0 ? `${listing.baths} Bath` : "—" },
              { icon: Ruler, label: "Super Built-up", value: `${listing.sqm.toLocaleString()} sq.ft` },
              {
                icon: CalendarClock,
                label: "Maintenance",
                value: listing.serviceCharge ? `${inrShort(listing.serviceCharge)}/yr` : "Nil stated",
              },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-card border border-ink-line bg-ink-soft/60 p-3.5"
              >
                <Icon className="size-4 text-bone-faint" strokeWidth={1.6} />
                <dt className="mt-2 font-mono text-[10px] tracking-[0.16em] text-bone-faint uppercase">
                  {label}
                </dt>
                <dd className="mt-0.5 font-mono text-[15px] text-bone">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-6">
            <SectionTitle>About this home</SectionTitle>
            <p className="font-display text-[15.5px] leading-relaxed text-bone-dim italic">
              “{listing.blurb}”
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {listing.tags.map((tag) => (
                <Chip key={tag}>{tag}</Chip>
              ))}
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle
              action={
                <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-verify uppercase">
                  <ShieldCheck className="size-3.5" />
                  audited
                </span>
              }
            >
              Documents & legal diligence
            </SectionTitle>
            <ul className="overflow-hidden rounded-card border border-ink-line bg-ink-soft/60">
              {[
                { label: "Approval Authority", value: listing.tenure, ok: true },
                { label: "RERA Registration", value: listing.seller.reraNumber || "TG RERA Registered", ok: true },
                { label: "Title Diligence", value: "30-Year Encumbrance Certificate (EC) cleared", ok: true },
                {
                  label: "Bank Approvals",
                  value: "SBI, HDFC & ICICI pre-approved project",
                  ok: true,
                },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center gap-3 border-b border-ink-line/60 px-3.5 py-3 last:border-b-0"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] tracking-[0.16em] text-bone-faint uppercase">
                      {row.label}
                    </span>
                    <span className="block text-[14px] text-bone">{row.value}</span>
                  </span>
                  <BadgeCheck className="size-4 shrink-0 text-verify" />
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <SectionTitle>Verified Seller / Builder Representative</SectionTitle>
            <div className="flex items-center gap-3.5 rounded-card border border-ink-line bg-ink-soft/60 p-3.5">
              <Monogram name={listing.seller.name} size="lg" tone="paper" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-bone">
                  {listing.seller.name}
                  {listing.seller.verified && <BadgeCheck className="size-4 text-verify" />}
                </p>
                <p className="truncate font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                  {listing.seller.agency}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11px] text-bone-dim">
                  <span className="flex items-center gap-1">
                    ★ {listing.seller.rating.toFixed(1)}
                  </span>
                  <span>{listing.seller.dealsClosed} closings</span>
                  <span>~{listing.seller.respondsInMins}m replies</span>
                </p>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Select Site Visit Slot</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {SLOTS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSlot(option === slot ? null : option)}
                  aria-pressed={slot === option}
                  className={cn(
                    "tap min-h-[38px] rounded-pill border px-3.5 font-mono text-[12.5px]",
                    slot === option
                      ? "border-match bg-match text-paper"
                      : "border-ink-line bg-ink-soft/60 text-bone-dim",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
            <p className="mt-2.5 font-mono text-[10.5px] tracking-[0.12em] text-bone-faint uppercase">
              {slot
                ? `Holding ${slot} — will be confirmed directly in chat`
                : "Pick a slot and we will propose it in the conversation"}
            </p>
          </section>

          <p className="mt-6 text-center font-mono text-[10px] tracking-[0.16em] text-bone-faint uppercase">
            TG RERA Verified Listing · ID {listing.id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* sticky action bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-ink via-ink/95 to-transparent px-4 pt-6 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => decide(listing.id, decision === "like" ? "pass" : "like")}
            aria-pressed={decision === "like"}
            className={cn(
              "tap grid size-12 shrink-0 place-items-center rounded-full",
              decision === "like"
                ? "bg-match text-paper"
                : "border border-ink-line bg-ink-soft text-bone",
            )}
          >
            <Heart className="size-5" strokeWidth={2} />
            <span className="sr-only">Interested in this property</span>
          </button>

          <button
            type="button"
            onClick={() => {
              decide(listing.id, "like");
              const thread = getOrCreateThread(listing.id, "listing");
              navigate(`/chat/${thread.id}`, { state: { slot } });
            }}
            className="tap flex flex-1 items-center justify-center gap-2 rounded-pill bg-match py-3.5 text-[15px] font-semibold text-paper shadow-[0_16px_36px_-18px_var(--color-match)]"
          >
            <MessageCircle className="size-4" />
            {slot ? `Book Site Visit (${slot})` : `Connect with ${firstName(listing.seller.name)}`}
          </button>
        </div>
      </div>
    </div>
  );
}