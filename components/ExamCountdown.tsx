"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BANNER_OFFER, nextExamEvent, offerActive, offerDaysLeft, todayInMalaysia } from "@/lib/exam-dates";

// Banner counting down to the next SPM exam event. Worked out in the browser so a cached page never shows stale days.
// Phone: two short lines (the countdown, then the offer as one tappable button that wraps neatly). Wide screens: one line.
export default function ExamCountdown() {
  const [next, setNext] = useState<ReturnType<typeof nextExamEvent>>(null);
  const [offerLeft, setOfferLeft] = useState<number | null>(null);

  useEffect(() => {
    const today = todayInMalaysia();
    setNext(nextExamEvent(today));
    setOfferLeft(offerActive(today) ? offerDaysLeft(today) : null);
  }, []);

  if (!next) return null;
  const { event, daysLeft, ongoing } = next;
  const when = ongoing ? "is on now" : daysLeft === 1 ? "is tomorrow" : `is in ${daysLeft} days`;

  return (
    <div className="bg-clay-400/20 text-clay-700 px-4 py-2.5">
      <div className="mx-auto max-w-5xl flex flex-col items-center gap-1.5 text-center text-[13px] leading-snug sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-3 sm:text-sm">
        <p className="font-medium">
          {event.label} {when}.
        </p>

        {offerLeft !== null && (
          <Link
            href={BANNER_OFFER.href}
            className="inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 rounded-2xl bg-clay-600 px-3.5 py-1.5 font-medium text-white hover:bg-clay-700"
          >
            <span>
              🎁 {BANNER_OFFER.eyebrow}: {BANNER_OFFER.text}
            </span>
            <span className="whitespace-nowrap rounded-full bg-white/25 px-2 py-0.5 text-xs">
              {offerLeft === 0 ? "last day" : `${offerLeft} day${offerLeft === 1 ? "" : "s"} left`}
            </span>
          </Link>
        )}

        {event.cta && offerLeft === null && (
          <Link href={event.cta.href} className="underline hover:text-clay-600">
            {event.cta.text} &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}
