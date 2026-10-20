"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BANNER_OFFER, nextExamEvent, offerActive, offerDaysLeft, todayInMalaysia } from "@/lib/exam-dates";

// Thin banner counting down to the next SPM exam event. Worked out in the browser so a cached page never shows stale days.
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
    <div className="bg-clay-400/20 text-clay-700 text-sm text-center px-5 py-2">
      <span className="font-medium">{event.label} {when}.</span>
      {offerLeft !== null && (
        <>
          {" "}
          <Link href={BANNER_OFFER.href} className="underline font-medium hover:text-clay-600">
            {BANNER_OFFER.text}
          </Link>
          {" "}({offerLeft === 0 ? "last day" : `${offerLeft} day${offerLeft === 1 ? "" : "s"} left`}).
        </>
      )}
      {event.cta && offerLeft === null && (
        <>
          {" "}
          <Link href={event.cta.href} className="underline hover:text-clay-600">{event.cta.text} &rarr;</Link>
        </>
      )}
    </div>
  );
}
