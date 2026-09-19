import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getListing, listings } from "@/data/listings";
import { getBuyer, buyers } from "@/data/buyers";
import { threads as initialThreads } from "@/data/threads";
import type { ChatMessage, Preferences, PropertyType, Role, Thread } from "@/data/types";

export type Decision = "like" | "pass" | "shortlist";

export type SellerListing = {
  askingPrice: number;
  area: string;
  propertyType: PropertyType;
  titleDoc: string;
  bhk: number;
};

const DEFAULT_PREFS: Preferences = {
  areas: ["Uppal", "Gachibowli", "Kokapet"],
  propertyTypes: ["Apartment", "Gated Villa"],
  budgetMin: 75_00_000,
  budgetMax: 1_80_00_000,
  mustHaves: ["TG RERA Approved", "100% Vastu Compliant", "Manjeera Water Connection"],
  timeline: "Within 6 weeks",
};

const DEFAULT_SELLER_LISTING: SellerListing = {
  askingPrice: 1_25_00_000,
  area: "Uppal",
  propertyType: "Apartment",
  titleDoc: "TG RERA Approved",
  bhk: 3,
};

type AppValue = {
  role: Role;
  setRole: (role: Role) => void;
  onboarded: boolean;
  profileName: string;
  prefs: Preferences;
  sellerListing: SellerListing;
  updateSellerListing: (patch: Partial<SellerListing>) => void;
  completeOnboarding: (name: string, prefs: Preferences, sellerInfo?: Partial<SellerListing>) => void;
  updatePrefs: (patch: Partial<Preferences>) => void;
  decisions: Record<string, Decision>;
  history: string[];
  decide: (id: string, decision: Decision) => void;
  undo: () => void;
  shortlist: string[];
  likesGiven: number;
  resetDemo: () => void;
  resetDeck: () => void;
  deckCount: number;
  // Dynamic Chat Engine
  threads: Thread[];
  threadsForCurrentRole: Thread[];
  getThreadById: (threadId: string) => Thread | undefined;
  getOrCreateThread: (subjectId: string, kind: "listing" | "buyer") => Thread;
  sendMessage: (threadId: string, body: string, from?: "me" | "them" | "system", kind?: ChatMessage["kind"]) => void;
  markThreadRead: (threadId: string) => void;
  proposeViewing: (threadId: string, slotText: string) => void;
};

const AppContext = createContext<AppValue | null>(null);

const STORAGE_KEYS = {
  DECISIONS: "prop_match_decisions_v2",
  THREADS: "prop_match_threads_v2",
  ROLE: "prop_match_role_v2",
  NAME: "prop_match_name_v2",
  PREFS: "prop_match_prefs_v2",
  SELLER: "prop_match_seller_v2",
  ONBOARDED: "prop_match_onboarded_v2",
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem(STORAGE_KEYS.ROLE) as Role) || "buyer";
  });

  const [onboarded, setOnboardedState] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === "true";
  });

  const [profileName, setProfileNameState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.NAME) || "Rohan Sharma";
  });

  const [prefs, setPrefsState] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PREFS);
      return saved ? JSON.parse(saved) : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  });

  const [sellerListing, setSellerListingState] = useState<SellerListing>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELLER);
      return saved ? JSON.parse(saved) : DEFAULT_SELLER_LISTING;
    } catch {
      return DEFAULT_SELLER_LISTING;
    }
  });

  const [decisions, setDecisionsState] = useState<Record<string, Decision>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DECISIONS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [history, setHistory] = useState<string[]>([]);

  const [threads, setThreadsState] = useState<Thread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THREADS);
      return saved ? JSON.parse(saved) : initialThreads;
    } catch {
      return initialThreads;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, String(onboarded));
  }, [onboarded]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NAME, profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELLER, JSON.stringify(sellerListing));
  }, [sellerListing]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DECISIONS, JSON.stringify(decisions));
  }, [decisions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THREADS, JSON.stringify(threads));
  }, [threads]);

  const setRole = useCallback((newRole: Role) => {
    setRoleState(newRole);
    setProfileNameState((prev) => {
      if (prev === "Rohan Sharma" && newRole === "seller") return "Sridhar Reddy";
      if (prev === "Sridhar Reddy" && newRole === "buyer") return "Rohan Sharma";
      return prev;
    });
  }, []);

  const decide = useCallback((id: string, decision: Decision) => {
    setDecisionsState((prev) => {
      const next = { ...prev, [id]: decision };
      return next;
    });
    setHistory((prev) => [...prev, id]);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      setDecisionsState((current) => {
        const next = { ...current };
        delete next[last];
        return next;
      });
      return prev.slice(0, -1);
    });
  }, []);

  const completeOnboarding = useCallback(
    (name: string, nextPrefs: Preferences, sellerInfo?: Partial<SellerListing>) => {
      const finalName = name.trim() || (role === "seller" ? "Sridhar Reddy" : "Rohan Sharma");
      setProfileNameState(finalName);
      setPrefsState(nextPrefs);
      if (sellerInfo) {
        setSellerListingState((prev) => ({ ...prev, ...sellerInfo }));
      }
      setOnboardedState(true);
    },
    [role],
  );

  const updatePrefs = useCallback((patch: Partial<Preferences>) => {
    setPrefsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateSellerListing = useCallback((patch: Partial<SellerListing>) => {
    setSellerListingState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetDeck = useCallback(() => {
    setDecisionsState((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        const isCurrentRole = role === "buyer" ? getListing(id) !== undefined : getBuyer(id) !== undefined;
        if (isCurrentRole) {
          delete next[id];
        }
      }
      return next;
    });
    setHistory([]);
  }, [role]);

  const resetDemo = useCallback(() => {
    setDecisionsState({});
    setHistory([]);
    setOnboardedState(false);
    setPrefsState(DEFAULT_PREFS);
    setProfileNameState("Rohan Sharma");
    setSellerListingState(DEFAULT_SELLER_LISTING);
    setThreadsState(initialThreads);
    localStorage.clear();
  }, []);

  const shortlist = useMemo(
    () =>
      Object.entries(decisions)
        .filter(([, d]) => d === "shortlist")
        .map(([id]) => id)
        .filter((id) => (role === "buyer" ? getListing(id) !== undefined : getBuyer(id) !== undefined)),
    [decisions, role],
  );

  const likesGiven = useMemo(
    () =>
      Object.entries(decisions)
        .filter(
          ([id, d]) =>
            d === "like" && (role === "buyer" ? getListing(id) !== undefined : getBuyer(id) !== undefined),
        ).length,
    [decisions, role],
  );

  const deckCount = useMemo(() => {
    const source = role === "seller" ? buyers : listings;
    return source.filter((item) => !decisions[item.id]).length;
  }, [decisions, role]);

  const threadsForCurrentRole = useMemo(() => {
    return role === "seller" ? threads.filter((t) => t.kind === "buyer") : threads.filter((t) => t.kind === "listing");
  }, [role, threads]);

  const getThreadById = useCallback(
    (threadId: string) => {
      return threads.find((t) => t.id === threadId);
    },
    [threads],
  );

  const getOrCreateThread = useCallback(
    (subjectId: string, kind: "listing" | "buyer"): Thread => {
      const existing = threads.find((t) => t.subjectId === subjectId);
      if (existing) return existing;

      let name = "Verified Match";
      let greeting = "Namaste! Glad to connect on Prop-Match.";

      if (kind === "listing") {
        const listing = getListing(subjectId);
        if (listing) {
          name = listing.seller.name;
          greeting = `Namaste! Thank you for your interest in our property: "${listing.title}" in ${listing.area}. I have the TG RERA documentation and floor plans ready. When would you like to visit?`;
        }
      } else {
        const buyer = getBuyer(subjectId);
        if (buyer) {
          name = buyer.name;
          greeting = `Hello! I noticed you matched with my buyer profile. I am pre-approved and actively looking in ${buyer.areas[0] || "Hyderabad"}. I would love to review your property details.`;
        }
      }

      const newThread: Thread = {
        id: `t-${subjectId}-${Date.now()}`,
        name,
        kind,
        subjectId,
        unread: 1,
        messages: [
          {
            id: `msg-${Date.now()}-init`,
            from: "them",
            body: greeting,
            at: new Date().toISOString(),
            kind: "text",
          },
        ],
      };

      setThreadsState((prev) => [newThread, ...prev]);
      return newThread;
    },
    [threads],
  );

  const sendMessage = useCallback(
    (
      threadId: string,
      body: string,
      from: "me" | "them" | "system" = "me",
      kind: ChatMessage["kind"] = "text",
    ) => {
      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        from,
        body,
        at: new Date().toISOString(),
        kind,
      };

      setThreadsState((prev) =>
        prev.map((thread) => {
          if (thread.id !== threadId) return thread;
          return {
            ...thread,
            unread: from === "them" ? thread.unread + 1 : 0,
            messages: [...thread.messages, newMsg],
          };
        }),
      );
    },
    [],
  );

  const markThreadRead = useCallback((threadId: string) => {
    setThreadsState((prev) =>
      prev.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread)),
    );
  }, []);

  const proposeViewing = useCallback(
    (threadId: string, slotText: string) => {
      sendMessage(threadId, `Site visit requested · ${slotText} · awaiting seller confirmation`, "system", "system");
    },
    [sendMessage],
  );

  const value: AppValue = {
    role,
    setRole,
    onboarded,
    profileName,
    prefs,
    sellerListing,
    updateSellerListing,
    completeOnboarding,
    updatePrefs,
    decisions,
    history,
    decide,
    undo,
    shortlist,
    likesGiven,
    resetDemo,
    resetDeck,
    deckCount,
    threads,
    threadsForCurrentRole,
    getThreadById,
    getOrCreateThread,
    sendMessage,
    markThreadRead,
    proposeViewing,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}