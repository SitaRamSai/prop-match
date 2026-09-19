import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  BadgeCheck,
  Banknote,
  Briefcase,
  CalendarClock,
  Check,
  ChevronLeft,
  Home,
  Landmark,
  MapPin,
  MessageCircle,
  Share2,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { Chip, MatchScore, Monogram, SectionTitle } from "@/components/ui";
import { getBuyer } from "@/data/buyers";
import { cn, inrRange, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

/** Standard Indian Home Loan EMI: 80% LTV over 20 years at 8.5% interest rate. */
function monthlyRepayment(price: number): number {
  const principal = price * 0.8;
  const rate = 0.085 / 12;
  const periods = 240;
  return (principal * rate * (1 + rate) ** periods) / ((1 + rate) ** periods - 1);
}

export function BuyerDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { decisions, decide, getOrCreateThread } = useApp();
  const buyer = getBuyer(id);
  const [copied, setCopied] = useState(false);

  if (!buyer) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.2em] text-bone-faint uppercase">
          Buyer profile not found
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

  const decision = decisions[buyer.id];

  async function handleShare() {
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: `Verified Buyer: ${buyer!.name}`,
          text: `${buyer!.name} · Budget: ${inrRange(buyer!.budgetMin, buyer!.budgetMax)}`,
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
        <div className="relative px-4 pt-[max(0.9rem,env(safe-area-inset-top))] pb-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="tap -ml-2 grid size-10 place-items-center rounded-full text-bone-dim"
            >
              <ChevronLeft className="size-6" strokeWidth={1.7} />
              <span className="sr-only">Go back</span>
            </button>
            <span className="flex-1 font-mono text-[10.5px] tracking-[0.22em] text-bone-faint uppercase">
              Buyer file · {buyer.id.slice(0, 8)}
            </span>
            <button
              type="button"
              onClick={() => decide(buyer.id, decision === "shortlist" ? "pass" : "shortlist")}
              aria-pressed={decision === "shortlist"}
              className={cn(
                "tap grid size-10 place-items-center rounded-full",
                decision === "shortlist" ? "bg-gold text-ink" : "border border-ink-line text-bone-dim",
              )}
            >
              <Star className="size-5" strokeWidth={1.8} />
              <span className="sr-only">Shortlist this buyer</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="tap relative grid size-10 place-items-center rounded-full border border-ink-line text-bone-dim"
            >
              <Share2 className="size-4.5" />
              <span className="sr-only">Share buyer profile</span>
              {copied && (
                <span className="pointer-events-none absolute -bottom-8 right-0 rounded bg-match px-2 py-0.5 text-[10px] text-paper whitespace-nowrap">
                  Link copied!
                </span>
              )}
            </button>
          </div>

          <div className="mt-3 flex items-start gap-4">
            <Monogram name={buyer.name} size="xl" tone="match" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-[28px] leading-[1.03] text-bone">{buyer.name}</h1>
              <p className="mt-1 text-[13.5px] text-bone-dim">{buyer.occupation}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {buyer.verified && (
                  <Chip tone="verify" icon={<BadgeCheck className="size-3.5" />}>
                    Aadhaar / PAN Verified
                  </Chip>
                )}
                {buyer.preApproved && (
                  <Chip tone="gold" icon={<Landmark className="size-3.5" />}>
                    Bank Pre-Approved
                  </Chip>
                )}
              </div>
            </div>
            <MatchScore score={buyer.matchScore} size={62} />
          </div>
        </div>

        <div className="px-4">
          <dl className="paper-stock grid grid-cols-2 gap-x-3 gap-y-4 rounded-card border border-paper-line p-4 shadow-paper">
            <div>
              <dt className="font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">
                Budget envelope
              </dt>
              <dd className="mt-1 font-mono text-[19px] leading-none text-match-deep">
                {inrRange(buyer.budgetMin, buyer.budgetMax)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">
                Approved ceiling
              </dt>
              <dd className="mt-1 font-mono text-[19px] leading-none text-ink">
                {inrShort(buyer.budgetMax)}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">
                Approx. EMI @ 8.5%
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 font-mono text-[15px] text-ink">
                <Banknote className="size-4 text-ink/50" />
                {inrShort(Math.round(monthlyRepayment(buyer.budgetMax)))}/mo
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[10px] tracking-[0.18em] text-ink/55 uppercase">Timeline</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-[13.5px] font-medium text-ink">
                <CalendarClock className="size-4 text-ink/50" />
                {buyer.timeline}
              </dd>
            </div>
          </dl>

          <section className="mt-5">
            <SectionTitle
              action={
                <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                  <Check className="size-3" />
                  verified
                </span>
              }
            >
              Why you are matched
            </SectionTitle>
            <ul className="space-y-2.5 rounded-card border border-ink-line bg-ink-soft/60 p-4">
              {buyer.matchReasons.map((reason) => (
                <li key={reason} className="flex gap-2.5 text-[13.5px] leading-relaxed text-bone-dim">
                  <Check className="mt-0.5 size-4 shrink-0 text-match" strokeWidth={2.2} />
                  {reason}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <SectionTitle>Pre-Audited KYC & Verification</SectionTitle>
            <ul className="overflow-hidden rounded-card border border-ink-line bg-ink-soft/60">
              {[
                { label: "Identity Check", value: "Aadhaar & PAN matched", icon: BadgeCheck },
                {
                  label: "Source of Funds",
                  value: buyer.preApproved ? "Bank pre-sanction letter verified" : "Under review",
                  icon: Landmark,
                },
                { label: "Financing Arrangement", value: buyer.financing, icon: Banknote },
                { label: "Employment / Firm", value: buyer.occupation, icon: Briefcase },
              ].map(({ label, value, icon: Icon }) => (
                <li
                  key={label}
                  className="flex items-center gap-3 border-b border-ink-line/60 px-3.5 py-3 last:border-b-0"
                >
                  <Icon className="size-4 shrink-0 text-bone-faint" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[10px] tracking-[0.16em] text-bone-faint uppercase">
                      {label}
                    </span>
                    <span className="block text-[14px] text-bone">{value}</span>
                  </span>
                  <ShieldCheck className="size-4 shrink-0 text-verify" />
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-6">
            <SectionTitle>Target Hyderabad Corridors & Criteria</SectionTitle>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <Home className="mt-1 size-4 shrink-0 text-bone-faint" strokeWidth={1.6} />
                <div className="flex flex-wrap gap-1.5">
                  {buyer.propertyTypes.map((type) => (
                    <Chip key={type}>{type}</Chip>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-bone-faint" strokeWidth={1.6} />
                <div className="flex flex-wrap gap-1.5">
                  {buyer.areas.map((area) => (
                    <Chip key={area}>{area}</Chip>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="mt-1 size-4 shrink-0 text-bone-faint" strokeWidth={1.6} />
                <div className="flex flex-wrap gap-1.5">
                  {buyer.mustHaves.map((item) => (
                    <Chip key={item} tone="verify">
                      {item}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6">
            <SectionTitle>Buyer Intent & Background</SectionTitle>
            <p className="font-display text-[15.5px] leading-relaxed text-bone-dim italic">
              “{buyer.blurb}”
            </p>
            <p className="mt-3 font-mono text-[10.5px] tracking-[0.14em] text-bone-faint uppercase">
              {buyer.toursBooked} site visit{buyer.toursBooked === 1 ? "" : "s"} completed · On platform since{" "}
              {new Date(buyer.memberSince).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </section>
        </div>
      </div>

      {/* sticky action bar */}
      <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-ink via-ink/95 to-transparent px-4 pt-6 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => decide(buyer.id, decision === "pass" ? "like" : "pass")}
            aria-pressed={decision === "pass"}
            className={cn(
              "tap grid size-12 shrink-0 place-items-center rounded-full",
              decision === "pass" ? "bg-ink-lift text-bone-dim" : "border border-ink-line bg-ink-soft text-bone",
            )}
          >
            <X className="size-5" strokeWidth={2} />
            <span className="sr-only">Pass on this buyer</span>
          </button>

          <button
            type="button"
            onClick={() => {
              decide(buyer.id, "like");
              const thread = getOrCreateThread(buyer.id, "buyer");
              navigate(`/chat/${thread.id}`);
            }}
            className="tap flex flex-1 items-center justify-center gap-2 rounded-pill bg-match py-3.5 text-[15px] font-semibold text-paper shadow-[0_16px_36px_-18px_var(--color-match)]"
          >
            <MessageCircle className="size-4" />
            Invite to Site Visit
          </button>
        </div>
      </div>
    </div>
  );
}