import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Building2, ChevronLeft, KeyRound, ShieldCheck } from "lucide-react";
import { Field, RangeField, TextInput, ToggleChip } from "@/components/form";
import { AREAS, MUST_HAVES, PROPERTY_TYPES, listings } from "@/data/listings";
import { buyers } from "@/data/buyers";
import type { Preferences, PropertyType } from "@/data/types";
import { byMatchScore, countBuyerMatches, countListingMatches, TIMELINES, TITLE_DOCS } from "@/lib/match";
import { cn, inrRange, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

const STEP_TITLE = ["Who are we matching?", "Your brief", "Deal-breakers"];

const STEP_SUB = [
  "Your name stays private until you match. Nothing here is visible to anyone else until then.",
  "This is what we score every property — and every buyer — against.",
  "Tick what actually matters. We only bring you profiles that clear the bar.",
];

export function SetupScreen() {
  const navigate = useNavigate();
  const { role, setRole, profileName, prefs, completeOnboarding } = useApp();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(profileName);
  const [budget, setBudget] = useState<[number, number]>([prefs.budgetMin, prefs.budgetMax]);
  const [asking, setAsking] = useState(1_25_00_000);
  const [area, setArea] = useState("Uppal");
  const [areas, setAreas] = useState<string[]>(prefs.areas);
  const [types, setTypes] = useState<PropertyType[]>(prefs.propertyTypes);
  const [mustHaves, setMustHaves] = useState<string[]>(prefs.mustHaves);
  const [timeline, setTimeline] = useState(prefs.timeline);
  const [titleDoc, setTitleDoc] = useState("TG RERA Approved");

  function toggleValue<T>(list: T[], setList: (next: T[]) => void, value: T) {
    setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  const draft: Preferences = useMemo(
    () => ({
      areas: role === "buyer" ? areas : [area],
      propertyTypes: types,
      budgetMin: role === "buyer" ? budget[0] : asking,
      budgetMax: role === "buyer" ? budget[1] : asking,
      mustHaves,
      timeline,
    }),
    [area, areas, asking, budget, mustHaves, role, timeline, types],
  );

  const matchCount = useMemo(
    () => (role === "buyer" ? countListingMatches(draft) : countBuyerMatches(asking, area)),
    [asking, area, draft, role],
  );

  const preview = useMemo(
    () => byMatchScore(listings.filter((l) => l.price <= draft.budgetMax)).slice(0, 3),
    [draft.budgetMax],
  );

  /** A peek at the deck they are about to open — the payoff for filling this in. */
  const deckRows = useMemo(() => {
    if (role === "buyer") {
      return preview.map((l) => ({
        id: l.id,
        label: l.title,
        meta: `${l.area} · ${inrShort(l.price)}`,
        score: l.matchScore,
      }));
    }
    return byMatchScore(buyers)
      .slice(0, 3)
      .map((b) => ({
        id: b.id,
        label: b.name,
        meta: `${b.kind} · ${inrRange(b.budgetMin, b.budgetMax)}`,
        score: b.matchScore,
      }));
  }, [preview, role]);

  function finish() {
    completeOnboarding(name, draft, {
      askingPrice: asking,
      area,
      propertyType: types[0] || "Apartment",
      titleDoc,
    });
    navigate("/discover");
  }

  return (
    <div className="flex h-full flex-col">
      {/* progress rail */}
      <div className="shrink-0 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
            className="tap -ml-2 flex items-center gap-1 py-1 pr-2 font-mono text-[11px] tracking-[0.16em] text-bone-dim uppercase"
          >
            <ChevronLeft className="size-4" />
            {step === 0 ? "Back" : "Previous"}
          </button>
          <span className="font-mono text-[10.5px] tracking-[0.2em] text-bone-faint uppercase">
            Step {step + 1} of 3
          </span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-pill transition-colors",
                i <= step ? "bg-match" : "bg-ink-line",
              )}
            />
          ))}
        </div>
      </div>

      <div className="scroll-area no-scrollbar flex-1 px-5 pb-5">
        <h1 className="font-display text-[31px] leading-[1.02] text-bone">{STEP_TITLE[step]}</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-bone-dim">{STEP_SUB[step]}</p>

        <div className="paper-stock mt-5 space-y-6 rounded-sheet p-5 shadow-paper">
          {step === 0 && (
            <>
              <Field label="Your name">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  autoComplete="name"
                  enterKeyHint="next"
                />
              </Field>

              <Field label="I am here to" hint="You can switch roles any time from your profile.">
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: "buyer", label: "Buy", icon: KeyRound },
                      { value: "seller", label: "Sell / Builder", icon: Building2 },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <ToggleChip
                      key={value}
                      active={role === value}
                      onClick={() => setRole(value)}
                      icon={<Icon className="size-4" />}
                      className="justify-center py-2.5"
                    >
                      {label}
                    </ToggleChip>
                  ))}
                </div>
              </Field>

              <div className="flex items-start gap-2.5 rounded-xl bg-paper-warm/80 p-3.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-verify" />
                <p className="text-[12.5px] leading-relaxed text-ink/70">
                  Every profile in the deck carries verified Aadhaar / PAN, and every buyer has pre-approved
                  bank financing (SBI, HDFC, ICICI). Zero cold calling.
                </p>
              </div>
            </>
          )}

          {step === 1 && role === "buyer" && (
            <>
              <Field label="Budget band" hint="We show properties matching your verified financial envelope.">
                <div className="mt-3">
                  <RangeField
                    min={25_00_000}
                    max={5_00_00_000}
                    step={5_00_000}
                    value={budget}
                    onChange={setBudget}
                    format={inrShort}
                    minLabel="Minimum budget"
                    maxLabel="Maximum budget"
                  />
                </div>
              </Field>

              <Field label="Target Hyderabad Corridors">
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {AREAS.map((option) => (
                    <ToggleChip
                      key={option}
                      active={areas.includes(option)}
                      onClick={() => toggleValue(areas, setAreas, option)}
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
                      active={types.includes(option)}
                      onClick={() => toggleValue(types, setTypes, option)}
                    >
                      {option}
                    </ToggleChip>
                  ))}
                </div>
              </Field>

              <p className="font-mono text-[11.5px] tracking-[0.12em] text-ink/60 uppercase">
                {matchCount} propert{matchCount === 1 ? "y" : "ies"} currently clear this brief
              </p>
            </>
          )}

          {step === 1 && role === "seller" && (
            <>
              <Field label="What are you selling?">
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {PROPERTY_TYPES.map((option) => (
                    <ToggleChip
                      key={option}
                      active={types.includes(option)}
                      onClick={() => toggleValue(types, setTypes, option)}
                    >
                      {option}
                    </ToggleChip>
                  ))}
                </div>
              </Field>

              <Field label="Asking price" hint="Buyers are matched only when their verified funds cover this.">
                <div className="mt-3">
                  <RangeField
                    min={25_00_000}
                    max={6_00_00_000}
                    step={5_00_000}
                    value={[asking, asking]}
                    onChange={([, hi]) => setAsking(hi)}
                    format={inrShort}
                    single
                    maxLabel="Asking price"
                  />
                </div>
              </Field>

              <Field label="Area">
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {AREAS.slice(0, 9).map((option) => (
                    <ToggleChip key={option} active={area === option} onClick={() => setArea(option)}>
                      {option}
                    </ToggleChip>
                  ))}
                </div>
              </Field>

              <Field label="Title document">
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {TITLE_DOCS.map((option) => (
                    <ToggleChip
                      key={option}
                      active={titleDoc === option}
                      onClick={() => setTitleDoc(option)}
                    >
                      {option}
                    </ToggleChip>
                  ))}
                </div>
              </Field>

              <p className="font-mono text-[11.5px] tracking-[0.12em] text-ink/60 uppercase">
                {matchCount} verified buyer{matchCount === 1 ? "" : "s"} can carry {inrShort(asking)}
              </p>
            </>
          )}

          {step === 2 && (
            <>
              <Field label="Must-haves" hint="Anything you tick here is verified before a match reaches you.">
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {MUST_HAVES.map((option) => (
                    <ToggleChip
                      key={option}
                      active={mustHaves.includes(option)}
                      onClick={() => toggleValue(mustHaves, setMustHaves, option)}
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
                      active={timeline === option}
                      onClick={() => setTimeline(option)}
                    >
                      {option}
                    </ToggleChip>
                  ))}
                </div>
              </Field>

              <div className="rounded-xl bg-paper-warm/80 p-3.5">
                <p className="font-mono text-[10px] tracking-[0.2em] text-ink/55 uppercase">
                  Your opening deck
                </p>
                <ul className="mt-2.5 divide-y divide-ink/10">
                  {deckRows.map((row) => (
                    <li key={row.id} className="flex items-center gap-3 py-2">
                      <span className="font-display text-[15px] font-semibold text-match-deep">
                        {row.score}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13.5px] font-medium text-ink">
                          {row.label}
                        </span>
                        <span className="block truncate font-mono text-[10.5px] tracking-wide text-ink/55 uppercase">
                          {row.meta}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-ink-line bg-ink/80 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          type="button"
          onClick={() => (step < 2 ? setStep(step + 1) : finish())}
          className="tap flex w-full items-center justify-center gap-2 rounded-pill bg-match py-4 text-[15px] font-semibold text-paper shadow-[0_16px_36px_-18px_var(--color-match)]"
        >
          {step < 2 ? "Continue" : `Open the deck · ${matchCount} matches`}
          <ArrowRight className="size-4" />
        </button>
        {step === 2 && (
          <p className="mt-2.5 text-center font-mono text-[10.5px] tracking-[0.14em] text-bone-faint uppercase">
            {role === "buyer"
              ? "Ordered by match score — strongest first"
              : "Buyers shown only if their funds are verified"}
          </p>
        )}
      </div>
    </div>
  );
}