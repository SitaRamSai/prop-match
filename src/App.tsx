import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { TabBar } from "@/components/TabBar";
import { Skyline } from "@/components/Skyline";
import { WelcomeScreen } from "@/screens/WelcomeScreen";
import { SetupScreen } from "@/screens/SetupScreen";
import { DiscoverScreen } from "@/screens/DiscoverScreen";
import { SavedScreen } from "@/screens/SavedScreen";
import { MatchesScreen } from "@/screens/MatchesScreen";
import { ChatScreen } from "@/screens/ChatScreen";
import { ListingDetailScreen } from "@/screens/ListingDetailScreen";
import { BuyerDetailScreen } from "@/screens/BuyerDetailScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";

/** Tab screens share the bottom navigation. */
function MainLayout() {
  return (
    <div className="flex h-full flex-col">
      <Outlet />
      <TabBar />
    </div>
  );
}

/** Immersive screens (welcome, setup, dossier, chat) own the whole viewport. */
function PlainLayout() {
  return (
    <div className="flex h-full flex-col">
      <Outlet />
    </div>
  );
}

function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(70%_50%_at_50%_0%,#241f18_0%,#14110e_60%)]" />
      <div className="absolute inset-0 opacity-[0.14] [background-image:repeating-linear-gradient(0deg,transparent_0_39px,#3a3226_39px_40px),repeating-linear-gradient(90deg,transparent_0_39px,#3a3226_39px_40px)]" />
    </div>
  );
}

/** Desktop-only companion column: the pitch, not a second interface. */
function BrandAside() {
  return (
    <aside className="relative z-10 hidden max-w-[380px] shrink-0 flex-col xl:flex">
      <p className="font-mono text-[11px] tracking-[0.34em] text-match uppercase">Prop-Match</p>
      <h1 className="mt-5 font-display text-[54px] leading-[0.94] text-bone">
        Swipe less,
        <br />
        match better.
      </h1>
      <p className="mt-5 text-[15px] leading-relaxed text-bone-dim">
        A matchmaking platform for genuine home buyers and verified builders in Hyderabad. Set your corridor and budget. Find your exact match. Then talk — with TG RERA & 30-year EC title checked.
      </p>
      <ul className="mt-9 space-y-4 border-t border-ink-line pt-7">
        {[
          ["01", "Verified buyers only", "Aadhaar, PAN and Bank loan pre-sanction verified before entering the deck."],
          ["02", "Corridor precision", "Match on exact corridors (Uppal, L.B. Nagar, Gachibowli, Kokapet) — zero telecaller spam."],
          ["03", "TG RERA & EC verified", "Every property vetted against TG RERA, HMDA sanction, and 30-year Encumbrance Certificate."],
        ].map(([num, title, copy]) => (
          <li key={num} className="flex gap-4">
            <span className="font-mono text-[11px] text-match">{num}</span>
            <div>
              <p className="text-[14px] font-semibold text-bone">{title}</p>
              <p className="mt-0.5 text-[13px] leading-relaxed text-bone-faint">{copy}</p>
            </div>
          </li>
        ))}
      </ul>
      <Skyline className="mt-10 h-16 w-full text-ink-line" />
      <p className="mt-6 font-mono text-[10px] tracking-[0.22em] text-bone-faint uppercase">
        UI prototype · dummy data · Hyderabad · Telangana
      </p>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="relative flex min-h-dvh items-center justify-center gap-14 xl:px-14">
        <AmbientBackground />
        <BrandAside />

        {/* Device frame: full-bleed on phones, framed once there is room. */}
        <div className="device relative z-10">
          <Routes>
            <Route element={<PlainLayout />}>
              <Route path="/" element={<WelcomeScreen />} />
              <Route path="/setup" element={<SetupScreen />} />
              <Route path="/listing/:id" element={<ListingDetailScreen />} />
              <Route path="/buyer/:id" element={<BuyerDetailScreen />} />
              <Route path="/chat/:id" element={<ChatScreen />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route path="/discover" element={<DiscoverScreen />} />
              <Route path="/saved" element={<SavedScreen />} />
              <Route path="/matches" element={<MatchesScreen />} />
              <Route path="/profile" element={<ProfileScreen />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <div aria-hidden="true" className="grain-layer pointer-events-none absolute inset-0 z-60" />
        </div>
      </div>
    </BrowserRouter>
  );
}