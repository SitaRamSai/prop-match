import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Filter, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { BuyerCard } from "@/components/BuyerCard";
import { FilterSheet } from "@/components/FilterSheet";
import { MatchOverlay } from "@/components/MatchOverlay";
import { PropertyCard } from "@/components/PropertyCard";
import { SwipeDeck } from "@/components/SwipeDeck";
import { Chip } from "@/components/ui";
import { buyers, getBuyer } from "@/data/buyers";
import { getListing, listingPhoto, listings } from "@/data/listings";
import { byMatchScore } from "@/lib/match";
import { inrRange, inrShort } from "@/lib/utils";
import { useApp, type Decision } from "@/state/AppProvider";

type MatchInfo = {
  name: string;
  subject: string;
  score: number;
  photo?: string;
  reasons: string[];
  threadId?: string;
};

export function DiscoverScreen() {
  const navigate = useNavigate();
  const {
    role,
    prefs,
    sellerListing,
    decisions,
    decide,
    undo,
    resetDeck,
    history,
    profileName,
    getOrCreateThread,
  } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [match, setMatch] = useState<MatchInfo | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const deckIds = useMemo(
    () =>
      role === "buyer"
        ? byMatchScore(listings.filter((l) => !decisions[l.id])).map((l) => l.id)
        : byMatchScore(buyers.filter((b) => !decisions[b.id])).map((b) => b.id),
    [decisions, role],
  );

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function handleDecide(id: string, decision: Decision) {
    decide(id, decision);
    if (decision === "shortlist") {
      setToast("Shortlisted — waiting for you in Saved");
      return;
    }
    if (decision === "pass") return;

    // Guaranteed conversation thread for every match
    const thread = getOrCreateThread(id, role === "buyer" ? "listing" : "buyer");

    if (role === "buyer") {
      const listing = getListing(id);
      if (listing && listing.matchScore >= 80) {
        setMatch({
          name: listing.seller.name,
          subject: listing.title,
          score: listing.matchScore,
          photo: listingPhoto(listing, 0, 200),
          reasons: listing.matchReasons,
          threadId: thread.id,
        });
      }
      return;
    }

    const buyer = getBuyer(id);
    if (buyer && buyer.matchScore >= 80) {
      setMatch({
        name: buyer.name,
        subject: `a verified budget of ${inrRange(buyer.budgetMin, buyer.budgetMax)}`,
        score: buyer.matchScore,
        reasons: buyer.matchReasons,
        threadId: thread.id,
      });
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-ink-line/80 bg-ink/88 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5">
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[26px] leading-none text-bone">
              {role === "buyer" ? "Discover" : "Your buyers"}
            </h1>
            <p className="mt-1.5 font-mono text-[10.5px] tracking-[0.18em] text-bone-faint uppercase">
              {deckIds.length > 0
                ? role === "buyer"
                  ? "Best matches first"
                  : "Verified funds first"
                : "Deck completed"}
            </p>
          </div>
          {deckIds.length === 0 && (
            <button
              type="button"
              onClick={resetDeck}
              title="Reset deck"
              className="tap flex items-center gap-1.5 rounded-pill border border-match/50 bg-match/15 px-3 py-1.5 font-mono text-[11px] tracking-wide text-match-soft"
            >
              <RotateCcw className="size-3" />
              Reset deck
            </button>
          )}
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="tap relative grid size-10 place-items-center rounded-full border border-ink-line bg-ink-soft text-bone-dim"
          >
            <SlidersHorizontal className="size-[18px]" strokeWidth={1.7} />
            <span className="sr-only">Adjust your brief</span>
          </button>
        </div>

        {/* brief strip — what the deck is scored against */}
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto px-4 pb-3">
          {role === "buyer" ? (
            <>
              <Chip tone="match" icon={<Filter className="size-3.5" />}>
                {inrRange(prefs.budgetMin, prefs.budgetMax)}
              </Chip>
              {prefs.areas.slice(0, 2).map((area) => (
                <Chip key={area}>{area}</Chip>
              ))}
              {prefs.areas.length > 2 && <Chip>+{prefs.areas.length - 2} areas</Chip>}
              <Chip>{prefs.propertyTypes.slice(0, 2).join(" · ") || "Any type"}</Chip>
            </>
          ) : (
            <>
              <Chip tone="match" icon={<Filter className="size-3.5" />}>
                Floor: {inrShort(sellerListing.askingPrice)}
              </Chip>
              <Chip>{sellerListing.area} Corridor</Chip>
              <Chip>
                {sellerListing.bhk} BHK {sellerListing.propertyType}
              </Chip>
            </>
          )}
          <Chip tone="gold" icon={<Sparkles className="size-3.5" />}>
            {deckIds.length} left
          </Chip>
        </div>
      </header>

      <SwipeDeck
        ids={deckIds}
        yesLabel={role === "buyer" ? "Like" : "Invite"}
        noLabel="Pass"
        canUndo={history.length > 0}
        onUndo={undo}
        onDecide={handleDecide}
        renderCard={(id) => {
          if (role === "buyer") {
            const listing = getListing(id);
            return listing ? (
              <PropertyCard
                listing={listing}
                priority={id === deckIds[0]}
                onOpen={() => navigate(`/listing/${id}`)}
              />
            ) : null;
          }
          const buyer = getBuyer(id);
          return buyer ? <BuyerCard buyer={buyer} onOpen={() => navigate(`/buyer/${id}`)} /> : null;
        }}
        emptyState={
          <div className="paper-stock w-full rounded-sheet border border-paper-line p-6 text-center shadow-paper">
            <p className="font-mono text-[10.5px] tracking-[0.24em] text-ink/55 uppercase">
              End of the deck
            </p>
            <h2 className="mt-3 font-display text-[27px] leading-tight text-ink">
              That&apos;s everyone for now.
            </h2>
            <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-ink/70">
              {role === "buyer"
                ? "You have reviewed the current active listings. Tap reset to explore the deck again or widen your corridor brief."
                : "You have reviewed all current verified buyers. Tap reset to explore the buyer pool again."}
            </p>
            <div className="mt-5 space-y-2">
              <button
                type="button"
                onClick={resetDeck}
                className="tap flex w-full items-center justify-center gap-2 rounded-pill bg-match py-3.5 text-[15px] font-semibold text-paper"
              >
                <RotateCcw className="size-4" />
                Reset deck & start over
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="tap w-full rounded-pill border border-ink/20 py-3 text-[14px] font-medium text-ink"
              >
                Adjust corridor brief
              </button>
              <button
                type="button"
                onClick={() => navigate("/saved")}
                className="tap w-full rounded-pill border border-ink/20 py-3 text-[14px] font-medium text-ink"
              >
                See what I shortlisted
              </button>
            </div>
          </div>
        }
      />

      {/* decision feedback */}
      <AnimatePresence>
        {toast && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-none absolute bottom-[176px] left-1/2 z-40 -translate-x-1/2 rounded-pill border border-gold/40 bg-ink/95 px-3.5 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-gold uppercase shadow-print"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} />

      <MatchOverlay
        open={Boolean(match)}
        me={profileName}
        name={match?.name ?? ""}
        subject={match?.subject ?? ""}
        score={match?.score ?? 0}
        photo={match?.photo}
        reasons={match?.reasons ?? []}
        yesLabel="Keep swiping"
        onMessage={() => {
          const threadId = match?.threadId;
          setMatch(null);
          navigate(threadId ? `/chat/${threadId}` : "/matches");
        }}
        onDismiss={() => setMatch(null)}
      />
    </div>
  );
}