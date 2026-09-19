import { NavLink } from "react-router-dom";
import { Bookmark, Compass, MessagesSquare, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/state/AppProvider";
import { threadsForRole } from "@/data/threads";

const TABS = [
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/matches", label: "Matches", icon: MessagesSquare },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function TabBar() {
  const { role, shortlist } = useApp();
  const unread = threadsForRole(role).reduce((sum, t) => sum + t.unread, 0);

  return (
    <nav
      aria-label="Primary"
      className="relative z-30 shrink-0 border-t border-ink-line bg-ink/95 pb-[max(0.4rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      <div className="grain-layer" aria-hidden="true" />
      <ul className="relative flex items-stretch">
        {TABS.map(({ to, label, icon: Icon }) => {
          const badge = to === "/matches" ? unread : to === "/saved" ? shortlist.length : 0;
          return (
            <li key={to} className="flex-1">
              <NavLink
                to={to}
                className={({ isActive }) =>
                  cn(
                    "tap relative flex flex-col items-center gap-1 pt-3 pb-1.5 text-[10px] font-medium tracking-[0.14em] uppercase",
                    isActive ? "text-match-soft" : "text-bone-faint",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute top-0 h-[3px] w-7 rounded-b-full transition-colors",
                        isActive ? "bg-match" : "bg-transparent",
                      )}
                    />
                    <span className="relative">
                      <Icon className="size-[22px]" strokeWidth={isActive ? 2.1 : 1.6} />
                      {badge > 0 && (
                        <span className="absolute -top-1.5 -right-2.5 grid min-w-[17px] place-items-center rounded-pill bg-match px-1 font-mono text-[10px] leading-[17px] text-paper">
                          {badge}
                        </span>
                      )}
                    </span>
                    {label}
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}