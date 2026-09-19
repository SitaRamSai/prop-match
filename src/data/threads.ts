import type { ChatMessage, Thread } from "./types";

/** Times are generated relative to "now" so the inbox always looks live. */
function ago(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

const msg = (
  id: string,
  from: ChatMessage["from"],
  body: string,
  minutes: number,
  kind: ChatMessage["kind"] = "text",
): ChatMessage => ({ id, from, body, at: ago(minutes), kind });

export const threads: Thread[] = [
  {
    id: "t-uppal",
    name: "Sridhar Reddy",
    kind: "listing",
    subjectId: "uppal-3bed-skyline",
    unread: 2,
    messages: [
      msg("m1", "them", "Namaste! I noticed you liked our 3 BHK in Uppal corridor — are you free for a site visit on Saturday?", 218),
      msg("m2", "me", "Saturday works well. What time would you suggest?", 190),
      msg("m3", "them", "11:00 AM. I will have the TG RERA approvals, floor plans, and 30-year EC ready at the site office.", 186),
      msg("m4", "system", "Site visit booked · Saturday, 11:00 AM · Uppal Skyview, Pillar 842", 185, "system"),
      msg("m5", "them", "Quick note: the model flat on the 4th floor is completely ready for walkthroughs.", 26),
      msg("m6", "them", "Also, the builder is offering a ₹2.5 Lakh festive waiver on covered car parking for this batch.", 24),
    ],
  },
  {
    id: "t-gachibowli",
    name: "Rajeev Mehra",
    kind: "listing",
    subjectId: "gachibowli-highrise-3bhk",
    unread: 0,
    messages: [
      msg("m1", "them", "Hello! You enquired about the high-rise 3 BHK near Financial District. Occupancy Certificate is in hand.", 1_500),
      msg("m2", "me", "Thanks Rajeev. Since OC is received, there is no GST payable, correct?", 1_470),
      msg("m3", "them", "Exactly. 0% GST liability and ready for immediate deed registration at the Sub-Registrar office.", 1_460),
      msg("m4", "them", "TG RERA & OC verification certificate pack", 1_455, "document"),
      msg("m5", "me", "Great. My legal counsel would like to inspect the link documents on Monday.", 1_200),
      msg("m6", "them", "Certainly. We will welcome you at the corporate office with the full documentation bundle.", 1_180),
    ],
  },
  {
    id: "t-kokapet",
    name: "Anita Varma",
    kind: "listing",
    subjectId: "kokapet-luxury-villa",
    unread: 1,
    messages: [
      msg("m1", "them", "Good afternoon. Two triplex units in the Kokapet villa community were finalized this week.", 420),
      msg("m2", "me", "Understood. Does the community have a dedicated sewage treatment plant and 100% DG backup?", 400),
      msg("m3", "them", "Yes, 100% DG backup for all heavy appliances including air conditioning, and dual plumbing lines.", 396),
      msg("m4", "system", "Seller verified · 118 closings · TG RERA registered partner", 395, "system"),
      msg("m5", "them", "Would you like a private tour of the 50,000 sq.ft clubhouse this Sunday afternoon?", 48),
    ],
  },
  {
    id: "t-ananya",
    name: "Ananya Reddy",
    kind: "buyer",
    subjectId: "ananya-reddy",
    unread: 1,
    messages: [
      msg("m1", "them", "Namaste — I reviewed your property listing in the Uppal corridor. Is the ₹88 L price all-inclusive?", 300),
      msg("m2", "me", "Namaste Ananya. That is base price + amenities; registration is separate at official circle rate.", 280),
      msg("m3", "them", "Understood. My HDFC home loan pre-sanction is ready up to ₹1.1 Cr, so financing is in order.", 275),
      msg("m4", "them", "Could we arrange a site visit this Saturday morning? I am keen to inspect the Vastu layout.", 62),
    ],
  },
  {
    id: "t-sneha",
    name: "Dr. Sneha Kulkarni",
    kind: "buyer",
    subjectId: "sneha-rajesh-kulkarni",
    unread: 0,
    messages: [
      msg("m1", "them", "Hello! We are looking for an east-facing home near the metro for our elderly parents.", 2_600),
      msg("m2", "me", "Hello Dr. Sneha. The entrance is 100% East-facing, and the building has ramp access and twin stretcher elevators.", 2_590),
      msg("m3", "them", "That is exactly what we need. We have SBI MaxGain pre-approved and can visit on Sunday.", 2_500),
      msg("m4", "me", "Wonderful. We will keep the executive lounge reserved for your family at 3:00 PM.", 2_480),
    ],
  },
];

export function threadsForRole(role: "buyer" | "seller"): Thread[] {
  return role === "seller" ? threads.filter((t) => t.kind === "buyer") : threads;
}

export function getThread(id: string | undefined): Thread | undefined {
  return threads.find((t) => t.id === id);
}

/** Suggested openers — tuned to questions that actually advance real estate deals in India. */
export const QUICK_REPLIES = [
  "Is this property still available?",
  "Can we schedule a site visit this weekend?",
  "Is the property TG RERA approved?",
  "Is the price negotiable for fast closing?",
  "Please share the 30-year Encumbrance Certificate (EC)",
  "What is the expected maintenance charge?",
];
