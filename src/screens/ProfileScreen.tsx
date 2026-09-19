import { useState } from "react";
import { BadgeCheck, Bell, Pencil, RefreshCcw, ShieldCheck, Check } from "lucide-react";
import { FilterSheet } from "@/components/FilterSheet";
import { ScreenHeader } from "@/components/ScreenHeader";
import { ToggleChip } from "@/components/form";
import { Chip, Monogram, SectionTitle } from "@/components/ui";
import { inrRange, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

export function ProfileScreen() {
  const {
    role,
    setRole,
    profileName,
    prefs,
    sellerListing,
    shortlist,
    likesGiven,
    resetDemo,
  } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [notify, setNotify] = useState(true);
  const [hideFromBrokers, setHideFromBrokers] = useState(true);

  const summary =
    role === "buyer"
      ? [
          { label: "Budget envelope", value: inrRange(prefs.budgetMin, prefs.budgetMax) },
          { label: "Target corridors", value: prefs.areas.join(" · ") || "Any corridor in Hyderabad" },
          { label: "Property type", value: prefs.propertyTypes.join(" · ") || "Any type" },
          { label: "Deal-breakers", value: prefs.mustHaves.slice(0, 3).join(" · ") || "None specified" },
          { label: "Timeline", value: prefs.timeline },
        ]
      : [
          { label: "Asking price", value: inrShort(sellerListing.askingPrice) },
          { label: "Corridor", value: `${sellerListing.area}, Hyderabad` },
          { label: "Configuration", value: `${sellerListing.bhk} BHK ${sellerListing.propertyType}` },
          { label: "Legal title", value: sellerListing.titleDoc },
          { label: "Buyer criteria", value: "Verified bank pre-sanction only" },
        ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader
        title="Profile"
        subtitle={`${role === "buyer" ? "Verified Buyer" : "Verified Builder / Seller"} · ${
          role === "buyer" ? prefs.areas[0] ?? "Hyderabad" : `${sellerListing.area}, Hyderabad`
        }`}
      />

      <div className="scroll-area no-scrollbar flex-1 px-4 pt-4 pb-6">
        {/* Profile Card */}
        <div className="paper-stock rounded-sheet border border-paper-line p-5 shadow-paper">
          <div className="flex items-center gap-4">
            <Monogram name={profileName} size="lg" tone="match" />
            <div className="min-w-0">
              <p className="truncate font-display text-[24px] leading-tight text-ink">{profileName}</p>
              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.16em] text-ink/60 uppercase">
                <BadgeCheck className="size-3.5 text-match-deep" />
                {role === "buyer" ? "Aadhaar Verified Buyer" : "TG RERA Registered Builder"}
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <ToggleChip
              active={role === "buyer"}
              onClick={() => setRole("buyer")}
              className="flex-1 justify-center"
            >
              I am buying
            </ToggleChip>
            <ToggleChip
              active={role === "seller"}
              onClick={() => setRole("seller")}
              className="flex-1 justify-center"
            >
              I am selling / builder
            </ToggleChip>
          </div>
          <p className="mt-2.5 text-[12px] leading-relaxed text-ink/60">
            Switching roles switches the entire deck and conversation inbox — seamlessly test both buyer
            and builder perspectives.
          </p>
        </div>

        {/* Activity Counter */}
        <dl className="mt-4 grid grid-cols-3 gap-2.5">
          {[
            { label: "Swiped right", value: likesGiven },
            { label: "Shortlisted", value: shortlist.length },
            { label: "Site visits", value: 3 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-ink-line bg-ink-soft/60 p-3.5 text-center"
            >
              <dd className="font-display text-[24px] leading-none text-bone">{stat.value}</dd>
              <dt className="mt-1.5 font-mono text-[9.5px] tracking-[0.14em] text-bone-faint uppercase">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>

        {/* Seller's active inventory card if in seller mode */}
        {role === "seller" && (
          <section className="mt-6">
            <SectionTitle
              action={
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="tap flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-match-soft uppercase"
                >
                  <Pencil className="size-3" />
                  edit listing
                </button>
              }
            >
              Your Active Inventory
            </SectionTitle>
            <div className="rounded-card border border-ink-line bg-ink-soft/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-[18px] text-bone">
                    {sellerListing.bhk} BHK {sellerListing.propertyType}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-bone-faint uppercase">
                    {sellerListing.area} Corridor, Hyderabad
                  </p>
                </div>
                <span className="font-mono text-[18px] font-semibold text-match-soft">
                  {inrShort(sellerListing.askingPrice)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Chip tone="verify">{sellerListing.titleDoc}</Chip>
                <Chip>Zero GST (OC Ready)</Chip>
                <Chip>East Facing (100% Vastu)</Chip>
              </div>
            </div>
          </section>
        )}

        {/* Pre-Audited Verification */}
        <section className="mt-6">
          <SectionTitle
            action={
              <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-verify uppercase">
                <ShieldCheck className="size-3.5" />
                all clear
              </span>
            }
          >
            Verification Status
          </SectionTitle>
          <ul className="overflow-hidden rounded-card border border-ink-line bg-ink-soft/60">
            {[
              { icon: BadgeCheck, label: "Identity", value: "Aadhaar & PAN matched" },
              {
                icon: ShieldCheck,
                label: "Diligence",
                value:
                  role === "buyer"
                    ? "HDFC / SBI Pre-Sanction verified"
                    : "TG RERA Approved & 30-Yr EC audited",
              },
              { icon: ShieldCheck, label: "Phone", value: "+91 98490 •••42" },
            ].map(({ icon: Icon, label, value }) => (
              <li
                key={label}
                className="flex items-center gap-3 border-b border-ink-line/60 px-3.5 py-3 last:border-b-0"
              >
                <Icon className="size-4 shrink-0 text-bone-faint" />
                <span className="min-w-0 flex-1">
                  <span className="block font-mono text-[10px] tracking-[0.16em] text-bone-faint uppercase">
                    {label}
                  </span>
                  <span className="block truncate text-[14px] text-bone">{value}</span>
                </span>
                <BadgeCheck className="size-4 shrink-0 text-verify" />
              </li>
            ))}
          </ul>
        </section>

        {/* Match Criteria */}
        <section className="mt-6">
          <SectionTitle
            action={
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="tap flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-match-soft uppercase"
              >
                <Pencil className="size-3" />
                edit brief
              </button>
            }
          >
            {role === "buyer" ? "Your Buying Brief" : "Your Seller Filters"}
          </SectionTitle>
          <ul className="space-y-3 rounded-card border border-ink-line bg-ink-soft/60 p-4">
            {summary.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-4">
                <span className="font-mono text-[10px] tracking-[0.16em] text-bone-faint uppercase">
                  {row.label}
                </span>
                <span className="max-w-[62%] text-right text-[13.5px] text-bone">{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2.5 font-mono text-[10.5px] leading-relaxed tracking-[0.1em] text-bone-faint uppercase">
            Adjusting these criteria recalculates your matching scores instantly
          </p>
        </section>

        {/* Preferences */}
        <section className="mt-6">
          <SectionTitle>Preferences & Privacy</SectionTitle>
          <ul className="overflow-hidden rounded-card border border-ink-line bg-ink-soft/60">
            <li className="flex items-center gap-3 border-b border-ink-line/60 px-3.5 py-3.5">
              <Bell className="size-4 shrink-0 text-bone-faint" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-bone">New match alerts</span>
                <span className="block font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                  Push & WhatsApp digest
                </span>
              </span>
              <Switch checked={notify} onChange={setNotify} label="New match alerts" />
            </li>
            <li className="flex items-center gap-3 border-b border-ink-line/60 px-3.5 py-3.5">
              <ShieldCheck className="size-4 shrink-0 text-bone-faint" />
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-bone">Zero Telecaller Spam</span>
                <span className="block font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                  Phone private until you mutual match
                </span>
              </span>
              <Switch
                checked={hideFromBrokers}
                onChange={setHideFromBrokers}
                label="Zero Telecaller Spam"
              />
            </li>
            <li className="flex items-center gap-3 px-3.5 py-3.5">
              <span className="grid size-4 shrink-0 place-items-center font-mono text-[14px] font-semibold text-bone-faint">
                ₹
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] text-bone">Currency & units</span>
                <span className="block font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                  Indian Rupee (INR ₹ Lakhs / Cr) · sq.ft
                </span>
              </span>
              <Check className="size-4 shrink-0 text-verify" />
            </li>
          </ul>
        </section>

        <div className="mt-6 flex flex-wrap gap-1.5">
          <Chip tone="match">Hyderabad Live</Chip>
          <Chip>East Corridor (Uppal - L.B. Nagar)</Chip>
          <Chip>West Corridor (Gachibowli - Kokapet)</Chip>
          <Chip>Bengaluru — soon</Chip>
        </div>

        <button
          type="button"
          onClick={resetDemo}
          className="tap mt-5 flex w-full items-center justify-center gap-2 rounded-pill border border-ink-line py-3 text-[13.5px] font-medium text-bone-dim"
        >
          <RefreshCcw className="size-4" />
          Reset demo data
        </button>

        <p className="mt-5 text-center font-mono text-[10px] leading-relaxed tracking-[0.16em] text-bone-faint uppercase">
          Prop-Match · swipe less, match better
          <br />
          Hyderabad real estate prototype · INR v1.0
        </p>
      </div>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={
        checked
          ? "tap relative h-6 w-11 shrink-0 rounded-pill bg-match"
          : "tap relative h-6 w-11 shrink-0 rounded-pill bg-ink-lift ring-1 ring-ink-line"
      }
    >
      <span
        className={
          checked
            ? "absolute top-0.5 left-[22px] size-5 rounded-full bg-paper transition-all"
            : "absolute top-0.5 left-0.5 size-5 rounded-full bg-bone-faint transition-all"
        }
      />
    </button>
  );
}