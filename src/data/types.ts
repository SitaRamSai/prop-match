/** Shared domain model. Every screen renders from these shapes, so wiring a real
 *  API later is a matter of swapping the data module — not the UI. */

export type Role = "buyer" | "seller";

export type PropertyType =
  | "Apartment"
  | "Gated Villa"
  | "Independent House"
  | "Plot / Land"
  | "Penthouse"
  | "Duplex";

export type ListingStatus = "verified" | "new" | "relisted";

export type Seller = {
  name: string;
  agency: string;
  verified: boolean;
  dealsClosed: number;
  rating: number;
  respondsInMins: number;
  reraNumber?: string;
};

export type Listing = {
  id: string;
  title: string;
  area: string;
  city: string;
  price: number;
  type: PropertyType;
  beds: number;
  baths: number;
  sqm: number; // Represents sq.ft in Indian market
  sqft?: number;
  photos: string[];
  tenure: string; // e.g. "Freehold · HMDA Approved"
  reraId?: string;
  serviceCharge?: number; // Maintenance charge / month or year
  tags: string[];
  blurb: string;
  matchScore: number;
  matchReasons: string[];
  status: ListingStatus;
  listingKind: "sale" | "rent";
  featured?: boolean;
  seller: Seller;
};

export type Buyer = {
  id: string;
  name: string;
  kind: string;
  verified: boolean; // Aadhaar / PAN verified
  preApproved: boolean; // Bank Pre-Sanction letter verified
  budgetMin: number;
  budgetMax: number;
  areas: string[];
  propertyTypes: PropertyType[];
  mustHaves: string[];
  timeline: string;
  financing: string; // e.g. "HDFC Pre-Approved Home Loan", "SBI MaxGain 80% LTV", "Full Cash / Self-Funded"
  occupation: string;
  blurb: string;
  matchScore: number;
  matchReasons: string[];
  toursBooked: number;
  memberSince: string;
};

export type MessageKind = "text" | "system" | "document";

export type ChatMessage = {
  id: string;
  from: "me" | "them" | "system";
  body: string;
  at: string;
  kind: MessageKind;
};

export type Thread = {
  id: string;
  /** Who the conversation is with. */
  name: string;
  kind: "listing" | "buyer";
  /** The listing or buyer this conversation is anchored to. */
  subjectId: string;
  unread: number;
  messages: ChatMessage[];
};

export type Preferences = {
  areas: string[];
  propertyTypes: PropertyType[];
  budgetMin: number;
  budgetMax: number;
  mustHaves: string[];
  timeline: string;
};
