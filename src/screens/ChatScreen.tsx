import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Calendar, ChevronLeft, ChevronRight, FileText, Send, ShieldCheck } from "lucide-react";
import { Monogram, Photo } from "@/components/ui";
import { getBuyer } from "@/data/buyers";
import { getListing, listingPhoto } from "@/data/listings";
import { QUICK_REPLIES } from "@/data/threads";
import { clockTime, cn, dayLabel, inrShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

export function ChatScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getThreadById, sendMessage, proposeViewing, markThreadRead } = useApp();
  const thread = getThreadById(id || "");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const slotHandled = useRef(false);

  // Mark thread as read
  useEffect(() => {
    if (thread?.id) {
      markThreadRead(thread.id);
    }
  }, [markThreadRead, thread?.id]);

  // Handle viewing slot handed over from listing details
  useEffect(() => {
    if (thread && location.state?.slot && !slotHandled.current) {
      slotHandled.current = true;
      const slot = location.state.slot as string;
      proposeViewing(thread.id, slot);
      setTyping(true);
      const timer = window.setTimeout(() => {
        setTyping(false);
        sendMessage(
          thread.id,
          `Namaste! I have reserved ${slot} for your site visit. I will have the floor plan brochures and TG RERA documents ready at the site office.`,
          "them",
        );
      }, 1400);
      timers.current.push(timer);
    }
  }, [location.state, proposeViewing, sendMessage, thread]);

  const subject = useMemo(() => {
    if (!thread) return undefined;
    return thread.kind === "listing" ? getListing(thread.subjectId) : getBuyer(thread.subjectId);
  }, [thread]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [thread?.messages.length, typing]);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  function send(body: string) {
    const text = body.trim();
    if (!text || !thread) return;

    sendMessage(thread.id, text, "me");
    setDraft("");

    // Simulate smart counterpart replies
    setTyping(true);
    const timer = window.setTimeout(() => {
      setTyping(false);
      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      sendMessage(thread.id, reply, "them");
    }, 1400);
    timers.current.push(timer);
  }

  function handleProposeViewing() {
    if (!thread) return;
    proposeViewing(thread.id, "Saturday, 11:00 AM");
    setTyping(true);
    const timer = window.setTimeout(() => {
      setTyping(false);
      sendMessage(
        thread.id,
        "Saturday 11:00 AM is confirmed. We will greet you at the site reception with the legal file.",
        "them",
      );
    }, 1500);
    timers.current.push(timer);
  }

  if (!thread) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="font-mono text-[11px] tracking-[0.2em] text-bone-faint uppercase">
          Conversation not found
        </p>
        <button
          type="button"
          onClick={() => navigate("/matches")}
          className="tap rounded-pill bg-match px-5 py-3 text-[14px] font-semibold text-paper"
        >
          Back to matches
        </button>
      </div>
    );
  }

  const photo = subject && "photos" in subject ? listingPhoto(subject, 0, 200) : undefined;
  const subjectTitle = subject ? ("title" in subject ? subject.title : subject.name) : "";

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b border-ink-line/80 bg-ink/92 backdrop-blur-md">
        <div className="flex items-center gap-2.5 px-3 pt-[max(0.7rem,env(safe-area-inset-top))] pb-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="tap -ml-1.5 grid size-9 shrink-0 place-items-center rounded-full text-bone-dim"
          >
            <ChevronLeft className="size-6" strokeWidth={1.7} />
            <span className="sr-only">Go back</span>
          </button>
          <Monogram name={thread.name} size="sm" tone="paper" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15.5px] font-semibold text-bone">{thread.name}</p>
            <p className="flex items-center gap-1 truncate font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
              <ShieldCheck className="size-3 text-verify" />
              {thread.kind === "listing" ? "TG RERA Verified Builder" : "Aadhaar & Funds Verified"} · Hyderabad
            </p>
          </div>
          <button
            type="button"
            onClick={handleProposeViewing}
            title="Propose a site visit"
            className="tap grid size-9 shrink-0 place-items-center rounded-full border border-ink-line text-bone-dim"
          >
            <Calendar className="size-4 text-match-soft" />
            <span className="sr-only">Propose a site visit</span>
          </button>
        </div>

        {/* What this conversation is anchored to */}
        {subject && (
          <button
            type="button"
            onClick={() =>
              navigate(thread.kind === "listing" ? `/listing/${subject.id}` : `/buyer/${subject.id}`)
            }
            className="tap mx-3 mb-2.5 flex w-[calc(100%-1.5rem)] items-center gap-2.5 rounded-xl border border-ink-line bg-ink-soft/70 p-2 pr-3 text-left"
          >
            {photo ? (
              <Photo src={photo} alt="" className="size-10 shrink-0 rounded-lg" />
            ) : (
              <Monogram name={subjectTitle} size="sm" tone="match" />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-bone">{subjectTitle}</span>
              <span className="block truncate font-mono text-[10px] tracking-[0.12em] text-bone-faint uppercase">
                {"price" in subject
                  ? `${subject.area} · ${inrShort(subject.price)}`
                  : `Budget ${inrShort(subject.budgetMin)}–${inrShort(subject.budgetMax)}`}
              </span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-bone-faint" />
          </button>
        )}
      </header>

      <div ref={scroller} className="scroll-area no-scrollbar flex-1 px-4 pt-3 pb-4">
        <ul className="space-y-2">
          {thread.messages.map((message, index) => {
            const previous = thread.messages[index - 1];
            const showDay = !previous || dayLabel(previous.at) !== dayLabel(message.at);

            if (message.kind === "system") {
              return (
                <li key={message.id}>
                  {showDay && <DayRow label={dayLabel(message.at)} />}
                  <p className="my-2 border-y border-ink-line/60 py-2 text-center font-mono text-[10.5px] tracking-[0.14em] text-match-soft uppercase">
                    {message.body}
                  </p>
                </li>
              );
            }

            const mine = message.from === "me";
            return (
              <li key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className="max-w-[82%]">
                  {showDay && <DayRow label={dayLabel(message.at)} />}
                  {message.kind === "document" ? (
                    <div className="flex items-center gap-2.5 rounded-2xl border border-paper-line/60 bg-paper p-3 text-ink">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-ink/8">
                        <FileText className="size-4 text-ink/70" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] font-semibold">{message.body}</span>
                        <span className="block font-mono text-[9.5px] tracking-[0.16em] text-ink/55 uppercase">
                          TG RERA Legal Pack · PDF
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "rounded-2xl px-3.5 py-2.5 text-[14.5px] leading-relaxed",
                        mine
                          ? "rounded-br-md bg-match text-paper"
                          : "rounded-bl-md bg-ink-lift text-bone ring-1 ring-ink-line",
                      )}
                    >
                      {message.body}
                    </div>
                  )}
                  <p
                    className={cn(
                      "mt-1 font-mono text-[10px] text-bone-faint",
                      mine ? "text-right" : "text-left",
                    )}
                  >
                    {clockTime(message.at)}
                  </p>
                </div>
              </li>
            );
          })}

          {typing && (
            <li className="flex justify-start">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-ink-lift px-3.5 py-3.5 ring-1 ring-ink-line">
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    className="size-1.5 animate-pulse-dot rounded-full bg-bone-dim"
                    style={{ animationDelay: `${dot * 170}ms` }}
                  />
                ))}
                <span className="sr-only">{thread.name} is typing</span>
              </div>
            </li>
          )}
        </ul>
      </div>

      <div className="shrink-0 border-t border-ink-line bg-ink/94 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="no-scrollbar mb-2.5 flex gap-1.5 overflow-x-auto">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              type="button"
              onClick={() => send(reply)}
              className="tap shrink-0 rounded-pill border border-ink-line bg-ink-soft px-3 py-1.5 text-[12.5px] whitespace-nowrap text-bone-dim"
            >
              {reply}
            </button>
          ))}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
          }}
          className="flex items-end gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            Message {thread.name}
          </label>
          <input
            id="chat-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about RERA, Vastu, or schedule a visit…"
            enterKeyHint="send"
            autoComplete="off"
            className="min-w-0 flex-1 rounded-pill border border-ink-line bg-ink-soft px-4 py-3 text-[15px] text-bone placeholder:text-bone-faint focus:border-match focus:outline-none"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className={cn(
              "tap grid size-11 shrink-0 place-items-center rounded-full",
              draft.trim() ? "bg-match text-paper" : "border border-ink-line text-bone-faint",
            )}
          >
            <Send className="size-5" />
            <span className="sr-only">Send message</span>
          </button>
        </form>
      </div>
    </div>
  );
}

function DayRow({ label }: { label: string }) {
  return (
    <p className="my-3 text-center font-mono text-[10px] tracking-[0.22em] text-bone-faint uppercase">
      {label}
    </p>
  );
}

const CANNED_REPLIES = [
  "Namaste. Yes, the property is available and TG RERA approved. When can we schedule your site visit?",
  "Saturday 11:00 AM or Sunday 3:00 PM both work well for our site manager to walk you through.",
  "The builder is willing to consider a ₹2 Lakh festive discount for an immediate booking this month.",
  "I will share the 30-year Encumbrance Certificate (EC) and HMDA approved layout plan with you right away.",
  "Our legal counsel has verified link documents. Empanelled home loan sanction is available with SBI, HDFC and ICICI.",
];