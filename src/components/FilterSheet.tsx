import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Field, RangeField, ToggleChip } from "@/components/form";
import { Sheet } from "@/components/Sheet";
import { AREAS, MUST_HAVES, PROPERTY_TYPES } from "@/data/listings";
import { buyers } from "@/data/buyers";
import type { Preferences } from "@/data/types";
import { TIMELINES, countBuyerMatches, countListingMatches } from "@/lib/match";
import { cn, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
};

/** Preferences you can change mid-session, with the live consequence spelled
 *  out. Seeing "9 listings clear this brief" is what makes swiping feel earned. */
export function FilterSheet({ open, onClose }: FilterSheetProps) {
  const { role, prefs, updatePrefs, sellerListing, updateSellerListing } = useApp();
  const [draft, setDraft] = useState<Preferences>(prefs);
  const [floor, setFloor] = useState(75_00_000);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [minScore, setMinScore] = useState(70);

  useEffect(() => {
    if (open) {
      setDraft(prefs);
      setFloor(role === "seller" ? sellerListing.askingPrice : prefs.budgetMin);
    }
  }, [open, prefs, role, sellerListing.askingPrice]);

  const count = useMemo(
    () => (role === "buyer" ? countListingMatches(draft) : countBuyerMatches(floor, draft.areas[0] ?? "")),
    [draft, floor, role],
  );

  const buyerPool = useMemo(
    () => buyers.filter((b) => b.budgetMax >= floor && (!verifiedOnly || b.preApproved)),
    [floor, verifiedOnly],
  );

  function toggleValue<T>(list: T[], setList: (next: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={role === "buyer" ? "Your buying brief" : "Your buyer filter"}
      subtitle={
        role === "buyer"
          ? "Everything in the deck is scored against this."
          : "Only buyers who clear these lines reach your deck."
      }
      footer={
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => {
              if (role === "buyer") {
                updatePrefs(draft);
              } else {
                updatePrefs({ ...draft, budgetMin: floor, budgetMax: floor });
                updateSellerListing({ askingPrice: floor, area: draft.areas[0] || sellerListing.area });
              }
              onClose();
            }}
            className="tap flex w-full items-center justify-center gap-2 rounded-pill bg-match py-3.5 text-[15px] font-semibold text-paper"
          >
            {role === "buyer"
              ? `Show ${count} matching propert${count === 1 ? "y" : "ies"}`
              : `Show ${buyerPool.length} verified buyers`}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(prefs);
              setFloor(role === "seller" ? 1_25_00_000 : 75_00_000);
              setMinScore(70);
              setVerifiedOnly(true);
            }}
            className="tap flex w-full items-center justify-center gap-1.5 py-1 font-mono text-[10.5px] tracking-[0.18em] text-bone-faint uppercase"
          >
            <RotateCcw className="size-3.5" />
            Reset to board defaults
          </button>
        </div>
      }
    >
      {role === "buyer" ? (
        <div className="space-y-6 pb-2">
          <Field label="Budget band">
            <div className="mt-3">
              <RangeField
                min={25_00_000}
                max={6_00_00_000}
                step={5_00_000}
                value={[draft.budgetMin, draft.budgetMax]}
                onChange={([budgetMin, budgetMax]) => setDraft({ ...draft, budgetMin, budgetMax })}
                format={inrShort}
                minLabel="Minimum budget"
                maxLabel="Maximum budget"
              />
            </div>
          </Field>

          <Field label="Areas">
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {AREAS.map((option) => (
                <ToggleChip
                  key={option}
                  active={draft.areas.includes(option)}
                  onClick={() => toggleValue(draft.areas, (areas) => setDraft({ ...draft, areas }), option)}
                >
                  {option}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Property type">
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {PROPERTY_TYPES.map((option) => (
                <ToggleChip
                  key={option}
                  active={draft.propertyTypes.includes(option)}
                  onClick={() =>
                    toggleValue(
                      draft.propertyTypes,
                      (propertyTypes) => setDraft({ ...draft, propertyTypes }),
                      option,
                    )
                  }
                >
                  {option}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Must-haves">
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {MUST_HAVES.map((option) => (
                <ToggleChip
                  key={option}
                  active={draft.mustHaves.includes(option)}
                  onClick={() =>
                    toggleValue(draft.mustHaves, (mustHaves) => setDraft({ ...draft, mustHaves }), option)
                  }
                >
                  {option}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Timeline">
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {TIMELINES.map((option) => (
                <ToggleChip
                  key={option}
                  active={draft.timeline === option}
                  onClick={() => setDraft({ ...draft, timeline: option })}
                >
                  {option}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <p
            className={cn(
              "font-mono text-[11.5px] tracking-[0.12em] uppercase",
              count > 0 ? "text-match-soft" : "text-gold",
            )}
          >
            {count > 0
              ? `${count} listing${count === 1 ? "" : "s"} clear this brief`
              : "Nothing clears this brief — loosen the budget or add an area"}
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-2">
          <Field label="Only show buyers who can pay at least">
            <div className="mt-3">
              <RangeField
                min={25_00_000}
                max={6_00_00_000}
                step={5_00_000}
                value={[floor, floor]}
                onChange={([, hi]) => setFloor(hi)}
                format={inrShort}
                single
                maxLabel="Minimum buying power"
              />
            </div>
          </Field>

          <Field label="Areas buyers must be looking in">
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {AREAS.slice(0, 9).map((option) => (
                <ToggleChip
                  key={option}
                  active={draft.areas.includes(option)}
                  onClick={() => toggleValue(draft.areas, (areas) => setDraft({ ...draft, areas }), option)}
                >
                  {option}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Quality lines">
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <ToggleChip active={verifiedOnly} onClick={() => setVerifiedOnly(!verifiedOnly)}>
                Bank pre-sanctioned only
              </ToggleChip>
              {["Aadhaar / PAN verified", "Ready to register in 30 days", "Clear Title / 30-Yr EC"].map((option) => (
                <ToggleChip
                  key={option}
                  active={draft.mustHaves.includes(option)}
                  onClick={() =>
                    toggleValue(draft.mustHaves, (mustHaves) => setDraft({ ...draft, mustHaves }), option)
                  }
                >
                  {option}
                </ToggleChip>
              ))}
            </div>
          </Field>

          <Field label="Minimum match score">
            <div className="mt-3">
              <RangeField
                min={50}
                max={100}
                step={1}
                value={[minScore, minScore]}
                onChange={([, hi]) => setMinScore(hi)}
                format={(value) => `${value}%`}
                single
                maxLabel="Minimum match score"
              />
            </div>
          </Field>

          <p className="font-mono text-[11.5px] tracking-[0.12em] text-match-soft uppercase">
            {buyerPool.length} verified buyer{buyerPool.length === 1 ? "" : "s"} match
          </p>
        </div>
      )}
    </Sheet>
  );
}