import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: ReactNode;
  className?: string;
};

/** Sticky header that respects the notch, with an optional back affordance
 *  that mirrors the browser history so device gestures keep working. */
export function ScreenHeader({ title, subtitle, back, right, className }: ScreenHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 shrink-0 border-b border-ink-line/80 bg-ink/88 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex items-center gap-3 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3">
        {back && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="tap -ml-2 grid size-10 shrink-0 place-items-center rounded-full text-bone-dim hover:text-bone"
          >
            <ChevronLeft className="size-6" strokeWidth={1.7} />
            <span className="sr-only">Go back</span>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-[26px] leading-none text-bone">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 truncate font-mono text-[11px] uppercase tracking-[0.18em] text-bone-faint">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </header>
  );
}