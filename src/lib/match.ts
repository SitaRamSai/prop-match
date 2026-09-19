import { listings } from "@/data/listings";
import { buyers } from "@/data/buyers";
import type { Listing, Preferences } from "@/data/types";

/** A brief is "compatible" with a listing when budget, area and type all line up.
 *  Budget gets a 10% grace band, because real buyers always stretch a little. */
export function listingMatchesBrief(prefs: Preferences, listing: Listing): boolean {
  const floor = prefs.budgetMin * 0.9;
  const ceiling = prefs.budgetMax * 1.05;
  const inBudget = listing.price >= floor && listing.price <= ceiling;
  const inArea = prefs.areas.length === 0 || prefs.areas.includes(listing.area);
  const inType = prefs.propertyTypes.length === 0 || prefs.propertyTypes.includes(listing.type);
  return inBudget && inArea && inType;
}

export function countListingMatches(prefs: Preferences): number {
  return listings.filter((listing) => listingMatchesBrief(prefs, listing)).length;
}

/** Seller side: buyers whose verified budget can carry the asking price. */
export function countBuyerMatches(askingPrice: number, area: string): number {
  return buyers.filter((buyer) => {
    const canAfford = askingPrice >= buyer.budgetMin * 0.9 && askingPrice <= buyer.budgetMax;
    const location = buyer.areas.length === 0 || buyer.areas.includes(area);
    return canAfford && location;
  }).length;
}

/** Deck order: strongest match first — this is the "swipe less" promise. */
export function byMatchScore<T extends { matchScore: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.matchScore - a.matchScore);
}

export const TIMELINES = [
  "Ready now",
  "Within 6 weeks",
  "3–6 months",
  "Just exploring",
];

export const TITLE_DOCS = [
  "TG RERA Approved",
  "HMDA Sanctioned Layout",
  "GHMC Sanctioned",
  "Occupancy Certificate (OC)",
  "Clear Title · 30-Yr EC",
  "Registered Sale Deed / Patta",
];