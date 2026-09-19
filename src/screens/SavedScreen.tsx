import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Plus, Scale, X } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Sheet } from "@/components/Sheet";
import { BuyerCard } from "@/components/BuyerCard";
import { PropertyCard } from "@/components/PropertyCard";
import { Monogram, Photo, SectionTitle } from "@/components/ui";
import { getBuyer } from "@/data/buyers";
import { getListing, listingPhoto } from "@/data/listings";
import { inrExact, inrRange, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";
import type { Buyer, Listing, Role } from "@/data/types";

export function SavedScreen() {
  const navigate = useNavigate();
  const { role, shortlist, decide, prefs, sellerListing } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const savedListings = useMemo(
    () => shortlist.map((id) => getListing(id)).filter((listing): listing is Listing => listing !== undefined),
    [shortlist],
  );
  const savedBuyers = useMemo(
    () => shortlist.map((id) => getBuyer(id)).filter((buyer): buyer is Buyer => buyer !== undefined),
    [shortlist],
  );

  const savedCount = role === "buyer" ? savedListings.length : savedBuyers.length;
  const compareReady = selected.length >= 2;

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id].slice(-3),
    );
  }

  const subtitle =
    role === "buyer"
      ? `${savedListings.length} shortlisted · ${inrShort(prefs.budgetMax)} ceiling`
      : `${savedBuyers.length} shortlisted buyers · ${inrShort(sellerListing.askingPrice)} asking`;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader title="Saved" subtitle={subtitle} />

      <div className="scroll-area no-scrollbar flex-1 px-4 pt-4 pb-6">
        {savedCount === 0 ? (
          <div className="paper-stock rounded-sheet border border-paper-line p-6 text-center shadow-paper">
            <p className="font-mono text-[10.5px] tracking-[0.24em] text-ink/55 uppercase">
              Nothing saved yet
            </p>
            <h2 className="mt-3 font-display text-[26px] leading-tight text-ink">
              Shortlist the maybes.
            </h2>
            <p className="mx-auto mt-2 max-w-[34ch] text-[13.5px] leading-relaxed text-ink/70">
              {role === "buyer"
                ? "Tap the star while swiping to park properties here, then compare them side by side — rate per sq.ft, RERA status, and amenities."
                : "Tap the star to bookmark buyers, then line them up side by side — budget, bank pre-sanction, and readiness."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/discover")}
              className="tap mt-5 w-full rounded-pill bg-match py-3.5 text-[15px] font-semibold text-paper"
            >
              Back to the deck
            </button>
          </div>
        ) : (
          <>
            <SectionTitle
              action={
                <span className="font-mono text-[10.5px] tracking-[0.16em] text-bone-faint uppercase">
                  {selected.length > 0 ? `${selected.length} selected` : "tap + to compare"}
                </span>
              }
            >
              {role === "buyer" ? "Shortlisted properties" : "Shortlisted buyers"}
            </SectionTitle>

            <div className="grid grid-cols-2 gap-3">
              {role === "buyer"
                ? savedListings.map((listing) => {
                    const isSelected = selected.includes(listing.id);
                    return (
                      <div key={listing.id} className="relative">
                        <Link
                          to={`/listing/${listing.id}`}
                          className="tap block"
                          aria-label={`Open ${listing.title}`}
                        >
                          <PropertyCard listing={listing} variant="grid" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSelect(listing.id)}
                          aria-pressed={isSelected}
                          className={
                            isSelected
                              ? "absolute top-2.5 left-2.5 z-10 grid size-7 place-items-center rounded-full bg-match text-paper"
                              : "absolute top-2.5 left-2.5 z-10 grid size-7 place-items-center rounded-full bg-ink/80 text-bone backdrop-blur-sm"
                          }
                        >
                          {isSelected ? (
                            <Check className="size-4" strokeWidth={2.4} />
                          ) : (
                            <Plus className="size-4" strokeWidth={2.4} />
                          )}
                          <span className="sr-only">
                            {isSelected ? "Remove from comparison" : "Add to comparison"}
                          </span>
                        </button>
                      </div>
                    );
                  })
                : savedBuyers.map((buyer) => {
                    const isSelected = selected.includes(buyer.id);
                    return (
                      <div key={buyer.id} className="relative">
                        <Link
                          to={`/buyer/${buyer.id}`}
                          className="tap col-span-1 block"
                          aria-label={`Open ${buyer.name}`}
                        >
                          <BuyerCard buyer={buyer} variant="grid" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSelect(buyer.id)}
                          aria-pressed={isSelected}
                          className={
                            isSelected
                              ? "absolute top-2.5 left-2.5 z-10 grid size-7 place-items-center rounded-full bg-match text-paper"
                              : "absolute top-2.5 left-2.5 z-10 grid size-7 place-items-center rounded-full bg-ink/80 text-bone backdrop-blur-sm"
                          }
                        >
                          {isSelected ? (
                            <Check className="size-4" strokeWidth={2.4} />
                          ) : (
                            <Plus className="size-4" strokeWidth={2.4} />
                          )}
                          <span className="sr-only">
                            {isSelected ? "Remove from comparison" : "Add to comparison"}
                          </span>
                        </button>
                      </div>
                    );
                  })}
            </div>

            <p className="mt-5 flex items-start gap-2 font-mono text-[10.5px] leading-relaxed tracking-[0.12em] text-bone-faint uppercase">
              <Scale className="mt-0.5 size-3.5 shrink-0" />
              Select two or three to line them up side by side
            </p>
          </>
        )}
      </div>

      {savedCount > 0 && (
        <div className="shrink-0 border-t border-ink-line bg-ink/90 px-4 pt-3 pb-2 backdrop-blur">
          <button
            type="button"
            disabled={!compareReady}
            onClick={() => setCompareOpen(true)}
            className={
              compareReady
                ? "tap flex w-full items-center justify-center gap-2 rounded-pill bg-match py-3.5 text-[15px] font-semibold text-paper"
                : "flex w-full items-center justify-center gap-2 rounded-pill border border-ink-line py-3.5 text-[14px] font-medium text-bone-faint"
            }
          >
            <Scale className="size-4" />
            {compareReady
              ? `Compare ${selected.length} ${role === "buyer" ? "properties" : "buyers"}`
              : "Select 2 to compare"}
          </button>
        </div>
      )}

      <CompareSheet
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        ids={selected}
        role={role}
        onRemove={(id) => {
          decide(id, "pass");
          setSelected((prev) => prev.filter((item) => item !== id));
        }}
      />
    </div>
  );
}

type PropertyRow = {
  label: string;
  value: (listing: Listing) => string;
  raw?: (listing: Listing) => number;
  best?: "min" | "max";
};

const PROPERTY_ROWS: PropertyRow[] = [
  {
    label: "Price",
    value: (l) => `${inrShort(l.price)}${l.listingKind === "rent" ? "/mo" : ""}`,
    raw: (l) => l.price,
    best: "min",
  },
  {
    label: "₹ / sq.ft",
    value: (l) => inrShort(Math.round(l.price / l.sqm)) + "/sq.ft",
    raw: (l) => l.price / l.sqm,
    best: "min",
  },
  { label: "Type", value: (l) => l.type },
  { label: "BHK", value: (l) => (l.beds > 0 ? `${l.beds} BHK` : "Plot"), raw: (l) => l.beds, best: "max" },
  { label: "Area", value: (l) => `${l.sqm.toLocaleString()} sq.ft`, raw: (l) => l.sqm, best: "max" },
  { label: "Title / RERA", value: (l) => l.tenure },
  {
    label: "Maintenance",
    value: (l) => (l.serviceCharge ? `${inrShort(l.serviceCharge)}/yr` : "Nil stated"),
    raw: (l) => l.serviceCharge ?? 0,
    best: "min",
  },
  { label: "Match Score", value: (l) => `${l.matchScore}%`, raw: (l) => l.matchScore, best: "max" },
];

type BuyerRow = {
  label: string;
  value: (buyer: Buyer) => string;
  raw?: (buyer: Buyer) => number;
  best?: "min" | "max";
};

const BUYER_ROWS: BuyerRow[] = [
  {
    label: "Budget Band",
    value: (b) => inrRange(b.budgetMin, b.budgetMax),
    raw: (b) => b.budgetMax,
    best: "max",
  },
  {
    label: "Ceiling",
    value: (b) => inrShort(b.budgetMax),
    raw: (b) => b.budgetMax,
    best: "max",
  },
  { label: "Financing", value: (b) => b.financing },
  { label: "Timeline", value: (b) => b.timeline },
  { label: "Target Corridor", value: (b) => b.areas.slice(0, 2).join(", ") },
  { label: "Property Type", value: (b) => b.propertyTypes.slice(0, 2).join(", ") },
  {
    label: "Tours Booked",
    value: (b) => `${b.toursBooked} visit${b.toursBooked === 1 ? "" : "s"}`,
    raw: (b) => b.toursBooked,
    best: "max",
  },
  { label: "Match Score", value: (b) => `${b.matchScore}%`, raw: (b) => b.matchScore, best: "max" },
];

function CompareSheet({
  open,
  onClose,
  ids,
  role,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  ids: string[];
  role: Role;
  onRemove: (id: string) => void;
}) {
  const listings = ids.map((id) => getListing(id)).filter((l): l is Listing => l !== undefined);
  const buyersList = ids.map((id) => getBuyer(id)).filter((b): b is Buyer => b !== undefined);

  if (role === "buyer" && listings.length === 0) return null;
  if (role === "seller" && buyersList.length === 0) return null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={role === "buyer" ? "Properties side by side" : "Buyers side by side"}
      subtitle={
        role === "buyer"
          ? `${listings.length} properties · ${inrShort(listings[0].price)}–${inrShort(
              listings[listings.length - 1].price,
            )}`
          : `${buyersList.length} verified buyers`
      }
      footer={
        <p className="text-center font-mono text-[10.5px] tracking-[0.14em] text-bone-faint uppercase">
          {role === "buyer"
            ? "Base asking prices · excludes stamp duty (7.5%) and registration fees"
            : "Financing & KYC verified by platform"}
        </p>
      }
    >
      <div className="no-scrollbar -mx-1 overflow-x-auto pb-1">
        {role === "buyer" ? (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 w-[90px] bg-ink-soft align-bottom" />
                {listings.map((listing) => (
                  <th key={listing.id} className="min-w-[136px] p-1.5 align-bottom">
                    <div className="relative overflow-hidden rounded-xl border border-ink-line">
                      <Photo
                        src={listingPhoto(listing, 0, 420)}
                        alt={listing.title}
                        className="aspect-[4/3] w-full rounded-none"
                      />
                      <button
                        type="button"
                        onClick={() => onRemove(listing.id)}
                        className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink/85 text-bone"
                      >
                        <X className="size-3.5" />
                        <span className="sr-only">Remove {listing.title}</span>
                      </button>
                      <p className="px-2 py-1.5 text-[12px] leading-snug font-medium text-bone">
                        {listing.title}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PROPERTY_ROWS.map((row) => {
                const raws = row.raw ? listings.map(row.raw) : [];
                const target =
                  row.best && raws.length > 1
                    ? row.best === "min"
                      ? Math.min(...raws)
                      : Math.max(...raws)
                    : null;
                const decisive = target !== null && new Set(raws).size > 1;
                return (
                  <tr key={row.label} className="border-t border-ink-line/70">
                    <th
                      scope="row"
                      className="sticky left-0 bg-ink-soft py-2.5 pr-2 font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase"
                    >
                      {row.label}
                    </th>
                    {listings.map((listing) => {
                      const win = Boolean(decisive && row.raw && row.raw(listing) === target);
                      return (
                        <td key={listing.id} className="px-2 py-2.5">
                          <span
                            className={
                              win
                                ? "flex items-center gap-1 font-mono text-[13px] text-match-soft"
                                : "font-mono text-[13px] text-bone-dim"
                            }
                          >
                            {win && <span aria-hidden="true" className="size-1.5 rounded-full bg-match" />}
                            {row.value(listing)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t border-ink-line/70">
                <th
                  scope="row"
                  className="sticky left-0 bg-ink-soft py-3 pr-2 font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase"
                >
                  Exact (INR)
                </th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-2 py-3 font-mono text-[10.5px] text-bone-faint">
                    {inrExact(listing.price)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse text-left">
            <thead>
              <tr>
                <th className="sticky left-0 w-[90px] bg-ink-soft align-bottom" />
                {buyersList.map((buyer) => (
                  <th key={buyer.id} className="min-w-[136px] p-1.5 align-bottom">
                    <div className="relative overflow-hidden rounded-xl border border-ink-line bg-paper-warm p-3">
                      <button
                        type="button"
                        onClick={() => onRemove(buyer.id)}
                        className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-ink/75 text-bone"
                      >
                        <X className="size-3.5" />
                        <span className="sr-only">Remove {buyer.name}</span>
                      </button>
                      <Monogram name={buyer.name} size="sm" tone="match" />
                      <p className="mt-2 text-[13px] font-semibold text-ink">{buyer.name}</p>
                      <p className="font-mono text-[9.5px] text-ink/60 uppercase">{buyer.kind}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BUYER_ROWS.map((row) => {
                const raws = row.raw ? buyersList.map(row.raw) : [];
                const target =
                  row.best && raws.length > 1
                    ? row.best === "min"
                      ? Math.min(...raws)
                      : Math.max(...raws)
                    : null;
                const decisive = target !== null && new Set(raws).size > 1;
                return (
                  <tr key={row.label} className="border-t border-ink-line/70">
                    <th
                      scope="row"
                      className="sticky left-0 bg-ink-soft py-2.5 pr-2 font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase"
                    >
                      {row.label}
                    </th>
                    {buyersList.map((buyer) => {
                      const win = Boolean(decisive && row.raw && row.raw(buyer) === target);
                      return (
                        <td key={buyer.id} className="px-2 py-2.5">
                          <span
                            className={
                              win
                                ? "flex items-center gap-1 font-mono text-[12.5px] text-match-soft"
                                : "font-mono text-[12.5px] text-bone-dim"
                            }
                          >
                            {win && <span aria-hidden="true" className="size-1.5 rounded-full bg-match" />}
                            {row.value(buyer)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              <tr className="border-t border-ink-line/70">
                <th
                  scope="row"
                  className="sticky left-0 bg-ink-soft py-3 pr-2 font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase"
                >
                  Exact Ceiling
                </th>
                {buyersList.map((buyer) => (
                  <td key={buyer.id} className="px-2 py-3 font-mono text-[10.5px] text-bone-faint">
                    {inrExact(buyer.budgetMax)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </Sheet>
  );
}