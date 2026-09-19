import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Building2, KeyRound, ShieldCheck } from "lucide-react";
import { Skyline } from "@/components/Skyline";
import { Chip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";
import type { Role } from "@/data/types";

const ROLES: { value: Role; label: string; hint: string; icon: typeof KeyRound }[] = [
  {
    value: "buyer",
    label: "I'm buying",
    hint: "Tell us your budget and corridor. We'll show you RERA-approved homes that actually fit.",
    icon: KeyRound,
  },
  {
    value: "seller",
    label: "I'm selling / builder",
    hint: "Tell us your inventory. We'll show you buyers whose bank pre-sanctions are already verified.",
    icon: Building2,
  },
];

const TICKER = [
  "Swipe less, match better",
  "Swipe right on real estate",
  "Because every property has a perfect match",
  "We bring you together",
  "Property, matched",
];

export function WelcomeScreen() {
  const navigate = useNavigate();
  const { role, setRole } = useApp();

  return (
    <div className="scroll-area no-scrollbar flex-1">
      <div className="flex min-h-full flex-col">
        <div className="px-6 pt-[max(1.75rem,env(safe-area-inset-top))] pb-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-[0.34em] text-match uppercase">Prop-Match</span>
            <Chip tone="outline" icon={<BadgeCheck className="size-3.5" />}>
              Verified only
            </Chip>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.2, 0.9, 0.2, 1] }}
            className="mt-9"
          >
            <h1 className="font-display text-[clamp(2.5rem,13vw,3.4rem)] leading-[0.92] text-bone">
              Swipe right on
              <br />
              <em className="text-match not-italic">real estate.</em>
            </h1>
            <p className="mt-4 max-w-[30ch] text-[15px] leading-relaxed text-bone-dim">
              A dating app for buyers and sellers. Genuine profiles, verified funds, and matches scored
              against your actual brief.
            </p>
          </motion.div>

          <Skyline className="skyline mt-7 h-16 w-full text-ink-line" />

          <div className="mt-7 space-y-3">
            {ROLES.map(({ value, label, hint, icon: Icon }, i) => {
              const active = role === value;
              return (
                <motion.button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  aria-pressed={active}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.08, ease: [0.2, 0.9, 0.2, 1] }}
                  className={cn(
                    "tap flex w-full items-start gap-3.5 rounded-card border p-4 text-left",
                    active ? "border-match/60 bg-match/10" : "border-ink-line bg-ink-soft/60",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-11 shrink-0 place-items-center rounded-full",
                      active ? "bg-match text-paper" : "bg-ink-lift text-bone-dim ring-1 ring-ink-line",
                    )}
                  >
                    <Icon className="size-[22px]" strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="font-display text-[19px] text-bone">{label}</span>
                      {active && (
                        <span className="font-mono text-[10px] tracking-[0.2em] text-match-soft uppercase">
                          selected
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[13px] leading-relaxed text-bone-faint">{hint}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="mt-7 space-y-3"
          >
            <button
              type="button"
              onClick={() => navigate("/setup")}
              className="tap flex w-full items-center justify-center gap-2 rounded-pill bg-match py-4 text-[15px] font-semibold text-paper shadow-[0_16px_36px_-18px_var(--color-match)]"
            >
              Create your profile
              <ArrowRight className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate("/discover")}
              className="tap w-full py-3 font-mono text-[11px] tracking-[0.2em] text-bone-faint uppercase"
            >
              Skip — browse the deck first
            </button>
          </motion.div>

          <p className="mt-6 flex items-center justify-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-bone-faint uppercase">
            <ShieldCheck className="size-3.5 text-verify" />
            Zero portal spam. Aadhaar & Bank pre-sanction verified.
          </p>
        </div>

        {/* Ticker band — the pitch, repeated quietly at the fold */}
        <div className="mt-auto overflow-hidden border-y border-ink-line bg-ink-soft/40 py-3">
          <div className="band">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex shrink-0 items-center">
                {TICKER.map((line) => (
                  <span
                    key={`${copy}-${line}`}
                    className="flex items-center gap-4 px-4 font-mono text-[11px] tracking-[0.16em] text-bone-faint uppercase"
                  >
                    {line}
                    <span aria-hidden="true" className="size-1 rounded-full bg-match" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}