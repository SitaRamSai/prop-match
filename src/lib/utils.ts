/** Tiny class-name joiner — keeps JSX readable without pulling in a dependency. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Builds a stable, optimised Unsplash URL from a photo id. */
export function img(id: string, w = 1200): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;
}

const inrFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Format into Indian real estate convention: ₹85 L, ₹1.45 Cr, ₹3.2 Cr */
export function inrShort(value: number): string {
  if (value >= 10_000_000) {
    const v = value / 10_000_000;
    return `₹${trim(v)} Cr`;
  }
  if (value >= 100_000) {
    const v = value / 100_000;
    return `₹${trim(v)} L`;
  }
  if (value >= 1_000) return `₹${trim(value / 1_000)} K`;
  return `₹${value}`;
}

function trim(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(v < 10 ? 2 : 1).replace(/\.?0+$/, "");
}

/** ₹1,45,00,000 — standard Indian comma grouping for legal & agreement documents */
export function inrExact(value: number): string {
  return `₹${inrFormatter.format(value)}`;
}

export function inrRange(min: number, max: number): string {
  return `${inrShort(min)} – ${inrShort(max)}`;
}

// Aliases for seamless backward compatibility across the codebase
export const nairaShort = inrShort;
export const nairaExact = inrExact;
export const nairaRange = inrRange;

/** "Rohan Sharma" → "RS" — monograms replace avatar photos */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

/** "12:04 pm" — compact stamp for chat bubbles */
export function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

/** "3m", "2h", "Tue" — relative, chat-list friendly */
export function relativeShort(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(1, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short" });
}

export function dayLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}

/** Hours ago as a friendly, human line for the onboarding summary */
export function hoursAgo(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
