import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Bottom sheet that lives *inside* the device frame — keeps the phone
 *  illusion on desktop instead of stretching to the browser viewport. */
export function Sheet({ open, onClose, title, subtitle, children, footer }: SheetProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end" aria-hidden={false}>
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${title}`}
        className="absolute inset-0 h-full w-full bg-ink/75 backdrop-blur-[3px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-in relative flex max-h-[88%] flex-col overflow-hidden rounded-t-sheet border-t border-ink-line bg-ink-soft shadow-deck"
      >
        <div className="flex items-start gap-3 px-5 pt-4 pb-3">
          <div className="flex-1">
            <div className="grabber mb-3" />
            <h2 className="font-display text-[22px] leading-tight text-bone">{title}</h2>
            {subtitle && <p className="mt-1 text-[13px] text-bone-dim">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tap -mr-1 grid size-9 place-items-center rounded-full border border-ink-line text-bone-dim"
          >
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="scroll-area no-scrollbar flex-1 px-5 pb-4">{children}</div>
        {footer && (
          <div className="border-t border-ink-line bg-ink/60 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}