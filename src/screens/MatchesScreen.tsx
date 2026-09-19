import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { BadgeCheck, Clock } from "lucide-react";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Chip, Monogram, Photo, SectionTitle } from "@/components/ui";
import { getBuyer } from "@/data/buyers";
import { getListing, listingPhoto } from "@/data/listings";
import { inrRange, inrShort, relativeShort } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";

export function MatchesScreen() {
  const navigate = useNavigate();
  const { role, decisions, threadsForCurrentRole, markThreadRead, getOrCreateThread } = useApp();
  const list = threadsForCurrentRole;
  const unread = list.reduce((sum, thread) => sum + thread.unread, 0);

  const likedIds = useMemo(
    () => Object.entries(decisions).filter(([, value]) => value === "like").map(([id]) => id),
    [decisions],
  );

  const newMatches = useMemo(() => {
    if (role === "buyer") {
      return likedIds
        .map((id) => getListing(id))
        .filter((listing) => listing !== undefined)
        .map((listing) => ({
          id: listing.id,
          name: listing.seller.name,
          meta: `${listing.area} · ${inrShort(listing.price)}`,
          score: listing.matchScore,
          photo: listingPhoto(listing, 0, 320),
        }));
    }
    return likedIds
      .map((id) => getBuyer(id))
      .filter((buyer) => buyer !== undefined)
      .map((buyer) => ({
        id: buyer.id,
        name: buyer.name,
        meta: `${buyer.kind} · ${inrRange(buyer.budgetMin, buyer.budgetMax)}`,
        score: buyer.matchScore,
        photo: undefined,
      }));
  }, [likedIds, role]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScreenHeader
        title="Matches"
        subtitle={unread > 0 ? `${unread} unread · ${list.length} conversations` : "All caught up"}
      />

      <div className="scroll-area no-scrollbar flex-1 pb-6">
        {newMatches.length > 0 && (
          <section className="pt-4">
            <div className="px-4">
              <SectionTitle>New matches · tap to chat</SectionTitle>
            </div>
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-4 pb-1">
              {newMatches.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    const thread = getOrCreateThread(item.id, role === "buyer" ? "listing" : "buyer");
                    markThreadRead(thread.id);
                    navigate(`/chat/${thread.id}`);
                  }}
                  className="tap relative w-[128px] shrink-0 overflow-hidden rounded-card border border-ink-line bg-ink-soft text-left shadow-print"
                >
                  {item.photo ? (
                    <Photo src={item.photo} alt={item.meta} className="aspect-[3/4] w-full" />
                  ) : (
                    <span className="grid aspect-[3/4] w-full place-items-center bg-paper-warm">
                      <Monogram name={item.name} size="lg" tone="match" />
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 block bg-gradient-to-t from-ink/95 to-transparent px-2.5 pt-6 pb-2.5">
                    <span className="block truncate text-[12.5px] font-semibold text-bone">
                      {item.name}
                    </span>
                    <span className="block truncate font-mono text-[9.5px] tracking-wide text-bone-dim uppercase">
                      {item.meta}
                    </span>
                  </span>
                  <span className="absolute top-2 right-2 rounded-pill bg-match px-1.5 py-0.5 font-mono text-[10px] text-paper">
                    {item.score}
                  </span>
                  <span className="absolute top-2 left-2 font-mono text-[9px] tracking-[0.2em] text-paper uppercase">
                    new
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="mt-6 px-4">
          <SectionTitle
            action={
              <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                <Clock className="size-3" />
                replies under 15m
              </span>
            }
          >
            Conversations
          </SectionTitle>

          {list.length === 0 ? (
            <div className="rounded-card border border-ink-line bg-ink-soft/40 p-5 text-center">
              <p className="font-mono text-[11px] tracking-[0.16em] text-bone-faint uppercase">
                No active conversations yet
              </p>
              <p className="mt-2 text-[13px] text-bone-dim">
                Swipe right on any {role === "buyer" ? "property" : "buyer"} in Discover to start talking.
              </p>
            </div>
          ) : (
            <ul className="overflow-hidden rounded-card border border-ink-line bg-ink-soft/50">
              {list.map((thread) => {
                const last = thread.messages[thread.messages.length - 1];
                const listing = thread.kind === "listing" ? getListing(thread.subjectId) : undefined;
                const buyer = thread.kind === "buyer" ? getBuyer(thread.subjectId) : undefined;
                const subjectLine =
                  thread.kind === "listing"
                    ? listing
                      ? `Re: ${listing.title} (${inrShort(listing.price)})`
                      : "Property enquiry"
                    : buyer
                      ? `Re: Budget up to ${inrShort(buyer.budgetMax)}`
                      : "Buyer enquiry";

                return (
                  <li key={thread.id} className="border-b border-ink-line/60 last:border-b-0">
                    <button
                      type="button"
                      onClick={() => {
                        markThreadRead(thread.id);
                        navigate(`/chat/${thread.id}`);
                      }}
                      className="tap flex w-full items-start gap-3 px-3.5 py-3.5 text-left"
                    >
                      <Monogram name={thread.name} size="md" tone="paper" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          <span className="truncate text-[15px] font-semibold text-bone">
                            {thread.name}
                          </span>
                          <BadgeCheck className="size-3.5 shrink-0 text-verify" />
                        </span>
                        <span className="mt-0.5 block truncate font-mono text-[10px] tracking-[0.14em] text-bone-faint uppercase">
                          {subjectLine}
                        </span>
                        <span className="mt-1 block truncate text-[13px] text-bone-dim">
                          {last.kind === "document" ? "📄 " : ""}
                          {last.from === "me" ? "You: " : ""}
                          {last.body}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className="font-mono text-[10.5px] text-bone-faint">
                          {relativeShort(last.at)}
                        </span>
                        {thread.unread > 0 && (
                          <span className="grid min-w-[18px] place-items-center rounded-pill bg-match px-1 font-mono text-[10px] leading-[18px] text-paper">
                            {thread.unread}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {newMatches.length === 0 && (
          <div className="px-4 pt-6">
            <div className="rounded-card border border-dashed border-ink-line p-5 text-center">
              <Chip tone="gold">Nothing liked yet</Chip>
              <p className="mt-3 text-[13.5px] leading-relaxed text-bone-dim">
                Like a {role === "buyer" ? "property" : "buyer"} and the match appears here with the
                conversation ready to start.
              </p>
              <button
                type="button"
                onClick={() => navigate("/discover")}
                className="tap mt-4 w-full rounded-pill bg-match py-3 text-[14.5px] font-semibold text-paper"
              >
                Open the deck
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}