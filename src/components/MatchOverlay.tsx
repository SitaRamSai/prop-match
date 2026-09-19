import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { MatchScore, Monogram, Photo } from "./ui";

type MatchOverlayProps = {
  open: boolean;
  /** Whose name goes on the stamp line. */
  name: string;
  /** Small mono line under the headline, e.g. the property title. */
  subject: string;
  score: number;
  photo?: string;
  reasons: string[];
  yesLabel: string;
  /** The signed-in user, shown on the left of the seal line. */
  me: string;
  onMessage: () => void;
  onDismiss: () => void;
};

/** The payoff moment of the whole product: a wax-seal thwack on paper stock.
 *  This is the one thing people should remember. */
export function MatchOverlay({
  open,
  name,
  subject,
  score,
  photo,
  reasons,
  yesLabel,
  me,
  onMessage,
  onDismiss,
}: MatchOverlayProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <div className="absolute inset-0 bg-ink/88 backdrop-blur-[3px]" aria-hidden="true" />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`It's a match with ${name}`}
            className="paper-stock relative w-full max-w-[360px] rounded-sheet border border-paper-line p-6 shadow-deck"
            initial={{ scale: 0.9, y: 24, rotate: -1.5 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 -right-3 grid size-11 place-items-center rounded-full bg-match text-paper"
            >
              <Sparkles className="size-5" />
            </span>

            <p className="font-mono text-[10.5px] tracking-[0.26em] text-ink/55 uppercase">
              Prop-Match · {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <Monogram name={me} size="md" tone="ink" />
              <span className="h-px flex-1 bg-ink/25" />
              {photo ? (
                <Photo
                  src={photo}
                  alt={subject}
                  className="size-12 shrink-0 rounded-full ring-2 ring-match"
                />
              ) : (
                <Monogram name={name} size="md" tone="match" />
              )}
            </div>

            <h2 className="mt-5 font-display text-[38px] leading-[0.95] text-ink">
              It&apos;s a match.
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink/75">
              You and <strong className="font-semibold text-ink">{name}</strong> are {score}% aligned on{" "}
              {subject}. They usually reply within the hour.
            </p>

            <ul className="mt-4 space-y-1.5 border-t border-ink/15 pt-3.5">
              {reasons.slice(0, 2).map((reason) => (
                <li key={reason} className="flex gap-2 font-mono text-[11.5px] text-ink/70">
                  <span aria-hidden="true" className="text-match-deep">
                    —
                  </span>
                  {reason}
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-center gap-3">
              <MatchScore score={score} size={44} />
              <div className="flex-1">
                <button
                  type="button"
                  onClick={onMessage}
                  className="tap flex w-full items-center justify-center gap-2 rounded-pill bg-match px-4 py-3 text-[14px] font-semibold text-paper"
                >
                  <MessageCircle className="size-4" />
                  Say hello
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismiss}
              className="tap mt-2 flex w-full items-center justify-center gap-1.5 py-2 font-mono text-[11px] tracking-[0.16em] text-ink/60 uppercase"
            >
              {yesLabel}
              <ArrowRight className="size-3.5" />
            </button>

            <span
              aria-hidden="true"
              className={cn(
                "stamp stamp-lg pointer-events-none absolute -bottom-4 left-1/2 -translate-x-1/2 rotate-[-7deg]",
                "animate-stamp bg-paper text-match-deep shadow-[0_10px_24px_-16px_rgba(0,0,0,0.9)]",
              )}
            >
              Matched
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}