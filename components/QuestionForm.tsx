"use client";

import { useState, useTransition } from "react";
import { submitQuestion } from "@/actions/community";
import { BotTraps, Field, inputCls, SentCard } from "@/components/FormBits";

type Mode = "free" | "guided";

export default function QuestionForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("free");

  if (token)
    return (
      <SentCard token={token} title="Got it, thank you!">
        <p className="text-sm text-ink/70">
          Gary reads every question. The best ones get answered in a video or story, and your name is never shown unless you
          tell me it's okay.
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
          const r = await submitQuestion(fd);
          if (r.error) setError(r.error);
          else if (r.token) setToken(r.token);
        });
      }}
    >
      <BotTraps />
      <input type="hidden" name="mode" value={mode} />

      <fieldset>
        <legend className="text-sm font-medium mb-2">How would you like to ask?</legend>
        <div className="grid sm:grid-cols-2 gap-3">
          {(
            [
              ["free", "✍️ Just type", "Write whatever you want, in your own words"],
              ["guided", "🧭 Answer a few questions", "These 5 questions help me answer you better"],
            ] as const
          ).map(([v, title, text]) => (
            <label key={v} className={`border rounded-xl p-3.5 cursor-pointer ${mode === v ? "border-clay-600 bg-clay-600/5" : "border-ink/15"}`}>
              <input type="radio" name="mode_choice" className="sr-only" checked={mode === v} onChange={() => setMode(v)} />
              <span className="block font-medium">{title}</span>
              <span className="block text-xs text-ink/60">{text}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {mode === "free" ? (
        <>
          <Field label="Your message" hint="Anything about studying, exams, motivation, or your life as a student. No need to follow a format." required>
            <textarea
              name="free_text"
              className={inputCls}
              rows={9}
              placeholder="Type whatever is on your mind..."
              maxLength={4000}
              required
            />
          </Field>
          <Field label="Your age, and form or exam" hint="Helps me answer better, but you can skip it">
            <input name="age_form" className={inputCls} placeholder="e.g. 16, Form 4" maxLength={120} />
          </Field>
        </>
      ) : (
        <>
          <p className="text-sm bg-sage-400/10 border border-sage-400/30 rounded-xl p-3">
            💡 <b>These questions help me answer you better.</b> They show me your situation clearly, so my advice fits you instead of being
            general. It takes about 3 minutes.
          </p>
          <Field label="1. Your age, and the form you're in or the exam you're sitting for" required>
            <input name="age_form" className={inputCls} placeholder="e.g. 16, Form 4, SPM next year" maxLength={120} required />
          </Field>
          <Field label="2. What problem are you facing?" required>
            <textarea name="problem" className={inputCls} rows={3} placeholder="In one or two sentences" maxLength={1500} required />
          </Field>
          <Field label="3. Describe what happens" hint="When does it happen? What does it look like? The more detail, the better my answer." required>
            <textarea name="scenario" className={inputCls} rows={4} placeholder="For example: when I sit down to study Add Maths, after 10 minutes I..." maxLength={2500} required />
          </Field>
          <Field label="4. What have you done about it so far?" hint="Were you studying on your own before this? It's fine if you weren't." required>
            <textarea name="tried" className={inputCls} rows={3} placeholder="What you tried, or 'nothing yet'" maxLength={1500} required />
          </Field>
          <Field label="5. What are you hoping to get from me?" hint="A method, a study plan, advice, someone to tell you it's okay..." required>
            <textarea name="wish" className={inputCls} rows={3} maxLength={1500} required />
          </Field>
        </>
      )}

      <div className="border-t border-ink/10 pt-5 space-y-4">
        <p className="text-sm text-ink/60">
          Name and contact are your choice. Leave them empty to stay anonymous, but then I can't message you back. You can still
          check your tracking link after you send.
        </p>
        <Field label="Your name or nickname">
          <input name="name" className={inputCls} maxLength={60} />
        </Field>
        <Field label="Where can I reply?" hint="Your Instagram handle or email">
          <input name="contact" className={inputCls} placeholder="@yourname or you@email.com" maxLength={120} />
        </Field>
        <label className="flex gap-2 items-start text-sm">
          <input type="checkbox" name="publish_ok" className="mt-1 accent-clay-600" />
          <span>Gary can answer my question in a video or story. My name is never shown.</span>
        </label>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Sending..." : "Send my question"}
      </button>
    </form>
  );
}
