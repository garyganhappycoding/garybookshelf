"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { submitFeedback } from "@/actions/feedback";

export default function FeedbackForm({ loggedIn }: { loggedIn: boolean }) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const result = await submitFeedback(message);
      if (result?.error) {
        setError(result.error);
      } else {
        setMessage("");
        setSent(true);
      }
    });
  }

  return (
    <div className="card">
      <p className="font-medium mb-1">Has garybookshelf helped you?</p>
      <p className="text-sm text-ink/60 mb-3">
        Did the notes or content help you study better, or improve your grades? Tell me about it --
        feedback, ideas, or just something nice to keep me going 💛
      </p>

      {loggedIn ? (
        <>
          <textarea
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSent(false);
            }}
            rows={3}
            placeholder="Type your feedback here..."
            className="w-full border border-ink/15 rounded-lg px-3 py-2 text-sm"
          />
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={handleSubmit}
              disabled={isPending || !message.trim()}
              className="btn-primary !py-1.5 !px-4 text-sm disabled:opacity-60"
            >
              {isPending ? "Sending..." : "Send feedback"}
            </button>
            {sent && <span className="text-sm text-sage-600">Thanks, got it!</span>}
          </div>
        </>
      ) : (
        <Link href="/login" className="btn-primary !py-1.5 !px-4 text-sm inline-block">
          Log in to leave feedback
        </Link>
      )}
    </div>
  );
}
