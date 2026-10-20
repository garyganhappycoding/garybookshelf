"use client";

import { useState, useTransition } from "react";
import { submitResult } from "@/actions/community";
import { BotTraps, Field, inputCls, SentCard } from "@/components/FormBits";

export default function ResultForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [criterion, setCriterion] = useState<"grade" | "study" | "">("");
  const [under18, setUnder18] = useState(false);
  const [consent, setConsent] = useState<"tag" | "no_tag" | "no">("no");
  const [fileName, setFileName] = useState<string | null>(null);

  if (token)
    return (
      <SentCard token={token} title="Thank you for sharing this!">
        <p className="text-sm text-ink/70">
          Gary reads every single one. If yours is picked for his story, you'll see it on Instagram, tagged only if you said yes.
        </p>
      </SentCard>
    );

  return (
    <form
      className="card space-y-5 relative"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          const r = await submitResult(fd);
          if (r.error) setError(r.error);
          else if (r.token) setToken(r.token);
        });
      }}
    >
      <BotTraps />
      <fieldset>
        <legend className="text-sm font-medium mb-2">What changed for you? <span className="text-clay-600">*</span></legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            ["grade", "📈 My grades improved", "From one result to a better one"],
            ["study", "📚 I started to study on my own", "Because of a video, and I actually did what it taught"],
          ].map(([v, t, d]) => (
            <label key={v} className={`border rounded-xl p-3.5 cursor-pointer ${criterion === v ? "border-clay-600 bg-clay-600/5" : "border-ink/15"}`}>
              <input type="radio" name="criterion" value={v} className="sr-only" checked={criterion === v} onChange={() => setCriterion(v as "grade" | "study")} required />
              <span className="block font-medium">{t}</span>
              <span className="block text-xs text-ink/60">{d}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {criterion && (
        <>
          <Field label="Your age, and your form or exam" required>
            <input name="age_form" className={inputCls} placeholder="e.g. 17, Form 5" maxLength={120} required />
          </Field>

          {criterion === "grade" ? (
            <>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Subject" required>
                  <input name="subject" className={inputCls} placeholder="e.g. Add Maths" maxLength={80} required />
                </Field>
                <Field label="Type of exam" hint="Use the same type before and after, e.g. mid-year to trial">
                  <input name="exam" className={inputCls} placeholder="e.g. school exam" maxLength={80} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Before" hint="Marks or grade, e.g. 52 or C" required>
                  <input name="before" className={inputCls} maxLength={30} required />
                </Field>
                <Field label="Now" hint="e.g. 68 or B+" required>
                  <input name="after" className={inputCls} maxLength={30} required />
                </Field>
              </div>
              <Field
                label="Result paper"
                hint="Better if you attach it. Please cover your full name, IC number and school before you upload. Photo or PDF, up to 5 MB."
              >
                <label className="flex items-center justify-center border-2 border-dashed border-ink/20 rounded-xl p-5 cursor-pointer hover:border-clay-400 text-sm text-ink/60">
                  {fileName || "Choose a photo or PDF..."}
                  <input type="file" name="proof" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
                </label>
              </Field>
              <Field label="What helped you most?" hint="A sentence or two is plenty">
                <textarea name="story" className={inputCls} rows={3} maxLength={2000} />
              </Field>
            </>
          ) : (
            <>
              <Field label="How are you studying now?" hint="Share your experience, or the technique you're using." required>
                <textarea name="story" className={inputCls} rows={4} maxLength={2000} required />
              </Field>
              <Field label="The technique in one line">
                <input name="technique" className={inputCls} placeholder="e.g. active recall with past-year questions" maxLength={400} />
              </Field>
            </>
          )}

          <Field label="Which video or series worked for you?" hint="Paste the link. For a video of yourself studying, paste a link to it (Instagram, YouTube or Google Drive).">
            <input name="video_link" className={inputCls} placeholder="https://..." maxLength={300} inputMode="url" />
          </Field>

          <div className="border-t border-ink/10 pt-5 space-y-4">
            <fieldset>
              <legend className="text-sm font-medium mb-2">If Gary picks yours for his Instagram story</legend>
              {[
                ["tag", "Yes, and tag me"],
                ["no_tag", "Yes, but don't tag me"],
                ["no", "No, please don't share it"],
              ].map(([v, t]) => (
                <label key={v} className="flex gap-2 items-center text-sm py-1">
                  <input type="radio" name="consent_story" value={v} className="accent-clay-600" checked={consent === v} onChange={() => setConsent(v as "tag" | "no_tag" | "no")} />
                  {t}
                </label>
              ))}
            </fieldset>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Your name or nickname" hint="Shown only if you say yes above">
                <input name="name" className={inputCls} maxLength={60} />
              </Field>
              <Field label="Your Instagram handle" hint={consent === "tag" ? "Needed so I can tag you" : "So I can reach you"} required={consent === "tag"}>
                <input name="handle" className={inputCls} placeholder="@yourname" maxLength={60} />
              </Field>
            </div>
            <Field label="Email you use on Gary's Bookshelf" hint="Only if you have an account, so I can thank you properly. It is never shown.">
              <input name="account_email" type="email" className={inputCls} maxLength={120} />
            </Field>

            <label className="flex gap-2 items-start text-sm">
              <input type="checkbox" name="under18" className="mt-1 accent-clay-600" checked={under18} onChange={(e) => setUnder18(e.target.checked)} />
              <span>I'm under 18</span>
            </label>
            {under18 && (
              <label className="flex gap-2 items-start text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">
                <input type="checkbox" name="parent_ok" className="mt-1 accent-clay-600" required />
                <span>My parent or guardian agrees that I can send this, and that Gary may use it as I chose above.</span>
              </label>
            )}
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
            {pending ? "Sending..." : "Send"}
          </button>
        </>
      )}
    </form>
  );
}
