import { useState, type ReactNode } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { CornerUpLeft, Heart, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Decision } from "@/state/AppProvider";

type Fling = { id: string; decision: Decision } | null;

type SwipeDeckProps = {
  /** Undecided items, best match first. */
  ids: string[];
  renderCard: (id: string) => ReactNode;
  onDecide: (id: string, decision: Decision) => void;
  onUndo?: () => void;
  canUndo?: boolean;
  yesLabel?: string;
  noLabel?: string;
  emptyState: ReactNode;
};

/** Drag-to-decide deck. Distance *and* flick velocity both count, and the
 *  off-screen animation finishes before the item leaves the list, so the next
 *  card never jumps.
 *
 *  Note: the cards deliberately have no `onTap`. A tap gesture on the draggable
 *  surface swallows clicks aimed at the action buttons below it; each card
 *  instead carries a real, focusable button for opening its full dossier. */
export function SwipeDeck({
  ids,
  renderCard,
  onDecide,
  onUndo,
  canUndo,
  yesLabel = "Like",
  noLabel = "Pass",
  emptyState,
}: SwipeDeckProps) {
  const [fling, setFling] = useState<Fling>(null);
  const top = ids[0];
  const visible = ids.slice(0, 3);

  function requestFling(decision: Decision) {
    if (!top || fling) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(decision === "pass" ? 6 : 10);
    }
    const currentTop = top;
    setFling({ id: currentTop, decision });

    // Fallback: if onAnimationComplete does not fire within 420ms, complete the fling
    window.setTimeout(() => {
      setFling((curr) => {
        if (curr?.id === currentTop) {
          onDecide(currentTop, decision);
          return null;
        }
        return curr;
      });
    }, 420);
  }

  function completeFling(id: string, decision: Decision) {
    onDecide(id, decision);
    setFling(null);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        {ids.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center px-6">{emptyState}</div>
        ) : (
          visible
            .map((id, depth) => (
              <SwipeCard
                key={id}
                id={id}
                depth={depth}
                fling={fling?.id === id ? fling.decision : null}
                onDecide={completeFling}
                onSwipe={requestFling}
                yesLabel={yesLabel}
                noLabel={noLabel}
              >
                {renderCard(id)}
              </SwipeCard>
            ))
            .reverse()
        )}
      </div>

      <DeckActions
        onPass={() => requestFling("pass")}
        onLike={() => requestFling("like")}
        onShortlist={() => requestFling("shortlist")}
        onUndo={onUndo}
        canUndo={Boolean(canUndo) && !fling}
        disabled={!top || Boolean(fling)}
        yesLabel={yesLabel}
        noLabel={noLabel}
      />
    </div>
  );
}

const EXIT: Record<Decision, { x?: number; y?: number; opacity: number }> = {
  pass: { x: -620, opacity: 0.55 },
  like: { x: 620, opacity: 0.55 },
  shortlist: { y: -700, opacity: 0.45 },
};

type SwipeCardProps = {
  id: string;
  depth: number;
  fling: Decision | null;
  onDecide: (id: string, decision: Decision) => void;
  onSwipe: (decision: Decision) => void;
  yesLabel: string;
  noLabel: string;
  children: ReactNode;
};

function SwipeCard({
  id,
  depth,
  fling,
  onDecide,
  onSwipe,
  yesLabel,
  noLabel,
  children,
}: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-280, 0, 280], [-13, 0, 13]);
  const likeOpacity = useTransform(x, [40, 150], [0, 1]);
  const passOpacity = useTransform(x, [-40, -150], [0, 1]);
  const isTop = depth === 0;

  return (
    <motion.div
      className="listing-card absolute inset-x-4 top-3 bottom-1"
      style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0, zIndex: 10 - depth }}
      initial={false}
      animate={
        fling
          ? { ...EXIT[fling], transition: { duration: 0.34, ease: [0.22, 0.9, 0.24, 1] } }
          : {
              scale: 1 - depth * 0.045,
              y: depth * 14,
              opacity: depth === 0 ? 1 : depth === 1 ? 0.92 : 0.7,
              transition: { type: "spring", stiffness: 260, damping: 26 },
            }
      }
      onAnimationComplete={() => {
        if (fling) onDecide(id, fling);
      }}
      drag={isTop && !fling ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.75}
      onDragEnd={(_, info) => {
        const far = Math.abs(info.offset.x) > 108;
        const fast = Math.abs(info.velocity.x) > 620;
        if (!far && !fast) return;
        const right = info.offset.x + info.velocity.x * 0.12 > 0;
        onSwipe(right ? "like" : "pass");
      }}
    >
      <div className="relative size-full overflow-hidden rounded-card shadow-deck">{children}</div>

      {isTop && (
        <>
          <motion.span
            aria-hidden="true"
            style={{ opacity: likeOpacity }}
            className="stamp stamp-lg pointer-events-none absolute top-8 left-4 z-20 rotate-[-13deg] text-match"
          >
            {yesLabel}
          </motion.span>
          <motion.span
            aria-hidden="true"
            style={{ opacity: passOpacity }}
            className="stamp stamp-lg pointer-events-none absolute top-8 right-4 z-20 rotate-[13deg] text-bone"
          >
            {noLabel}
          </motion.span>
        </>
      )}
    </motion.div>
  );
}

type DeckActionsProps = {
  onPass: () => void;
  onLike: () => void;
  onShortlist: () => void;
  onUndo?: () => void;
  canUndo: boolean;
  disabled: boolean;
  yesLabel: string;
  noLabel: string;
};

function DeckActions({
  onPass,
  onLike,
  onShortlist,
  onUndo,
  canUndo,
  disabled,
  yesLabel,
  noLabel,
}: DeckActionsProps) {
  return (
    <div className="flex items-center justify-center gap-3.5 px-4 pt-4 pb-3">
      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo}
        className={cn(
          "tap grid size-11 place-items-center rounded-full border border-ink-line text-bone-dim",
          !canUndo && "opacity-35",
        )}
      >
        <CornerUpLeft className="size-5" strokeWidth={1.7} />
        <span className="sr-only">Undo last decision</span>
      </button>

      <button
        type="button"
        onClick={onPass}
        disabled={disabled}
        className="tap grid size-[58px] place-items-center rounded-full border border-ink-line bg-ink-soft text-bone shadow-print"
      >
        <X className="size-7" strokeWidth={2} />
        <span className="sr-only">{noLabel}</span>
      </button>

      <button
        type="button"
        onClick={onShortlist}
        disabled={disabled}
        className="tap grid size-[46px] place-items-center rounded-full border border-gold/45 bg-gold/10 text-gold"
      >
        <Star className="size-6" strokeWidth={1.8} />
        <span className="sr-only">Shortlist for later</span>
      </button>

      <button
        type="button"
        onClick={onLike}
        disabled={disabled}
        className="tap grid size-[58px] place-items-center rounded-full bg-match text-paper shadow-[0_12px_30px_-14px_var(--color-match)]"
      >
        <Heart className="size-7" strokeWidth={2} />
        <span className="sr-only">{yesLabel}</span>
      </button>
    </div>
  );
}
