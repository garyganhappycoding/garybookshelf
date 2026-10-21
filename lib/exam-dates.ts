// SPM 2026 schedule (Lembaga Peperiksaan KPM). Dates are inclusive, in Malaysia time (YYYY-MM-DD).
// Edit this list to change what the countdown banner shows. `cta` adds a button to the banner.
export type ExamEvent = { label: string; start: string; end: string; cta?: { text: string; href: string } };

export const EXAM_EVENTS: ExamEvent[] = [
  { label: "SPM Bahasa Melayu speaking test", start: "2026-10-26", end: "2026-10-29" },
  { label: "SPM English speaking test", start: "2026-11-02", end: "2026-11-05", cta: { text: "Practise speaking", href: "/speaking" } },
  { label: "SPM science practical tests", start: "2026-11-16", end: "2026-11-18" },
  { label: "SPM written papers", start: "2026-11-23", end: "2026-12-17" },
];

const DAY = 86_400_000;
const asDay = (ymd: string) => Date.parse(`${ymd}T00:00:00Z`);

// Today's date in Malaysia, so the count does not change at the visitor's own midnight.
export function todayInMalaysia(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(now);
}

// The event that is on now, or the next one coming up. null once everything has finished.
export function nextExamEvent(today: string): { event: ExamEvent; daysLeft: number; ongoing: boolean } | null {
  for (const event of EXAM_EVENTS) {
    if (asDay(today) > asDay(event.end)) continue;
    const daysLeft = Math.round((asDay(event.start) - asDay(today)) / DAY);
    return { event, daysLeft: Math.max(0, daysLeft), ongoing: daysLeft <= 0 };
  }
  return null;
}

// Time-limited offer shown on the banner. It ends 5 days before the English speaking test (2 Nov), so the last day is 28 Oct.
export const BANNER_OFFER = {
  eyebrow: "Discount offer",
  text: "English essay notes + 15 speaking attempts for RM10",
  until: "2026-10-28", // last day of the offer, Malaysia time
  href: "/shop",
};

export function offerActive(today: string): boolean {
  return asDay(today) <= asDay(BANNER_OFFER.until);
}

export function offerDaysLeft(today: string): number {
  return Math.round((asDay(BANNER_OFFER.until) - asDay(today)) / DAY);
}
