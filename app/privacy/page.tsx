import Link from "next/link";
import { CONTACT_EMAIL, LEGAL_UPDATED, RECEIPT_KEEP_DAYS } from "@/lib/legal";

export const metadata = { title: "Privacy policy · Gary's Bookshelf" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <div className="space-y-3 text-ink/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Privacy policy</h1>
      <p className="text-sm text-ink/50">Last updated {LEGAL_UPDATED}</p>
      <p className="mt-5 text-ink/80 leading-relaxed">
        Gary's Bookshelf ("we", "us") is a small study-resources site run by Gary in Malaysia. This page explains what
        information we collect, why, who helps us handle it, and what you can ask us to do. We follow Malaysia's Personal
        Data Protection Act 2010. We keep this short and plain on purpose.
      </p>

      <Section title="1. What we collect">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <b>Your account:</b> your email address and a password. Your password is stored scrambled by our sign-in
            provider, so we cannot read it.
          </li>
          <li>
            <b>Your orders:</b> what you bought, the amount, the status, and the <b>payment receipt screenshot</b> you
            upload. A receipt can show your name, bank or e-wallet details and phone number. We only need the amount and
            date, so please cover anything else before you upload.
          </li>
          <li>
            <b>Speaking practice:</b> your recording is sent to an AI service to be turned into text, and we do{" "}
            <b>not keep the audio</b>. We keep the transcript, your scores and the feedback so you can see your history,
            plus the recording length, word count and a technical reason if an attempt failed.
          </li>
          <li>
            <b>Things you send us:</b> messages in the feedback form, and questions you type into Ask Gary if that feature is on.
          </li>
          <li>
            <b>Cookies:</b> only the sign-in cookies needed to keep you logged in. We do not use advertising or tracking
            cookies, and we do not run analytics on this site. The only other cookie is a small one that remembers you have voted in a poll.
          </li>
        </ul>
      </Section>

      <Section title="2. Questions, results and votes you send us (no account needed)">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <b>Questions:</b> your age and form or exam, what you write about your problem, and, if you choose, a name and an Instagram handle or
            email so Gary can reply.
          </li>
          <li>
            <b>Results (The Bookshelf 100):</b> your age and form, your subject and results before and now, and what helped. You may attach a result
            paper (photo or PDF). Please cover your full name, IC number and school before you upload. You may also give a name, an Instagram handle and
            the email you use on this site.
          </li>
          <li>
            <b>Speaking feedback:</b> if you tap 👍 or 👎 after a speaking result, we save it with your account, together with any note you add.
          </li>
          <li>
            <b>Votes:</b> your choice is saved without your name. To stop spam and double votes we keep a scrambled code made from your internet
            connection (never the real address), and a small cookie that remembers you voted.
          </li>
        </ul>
        <p>
          Gary reads each message and can reply on your private tracking link. He shares a result on Instagram only if you said yes, and tags you only
          if you said yes to that. The Bookshelf 100 page and its Wall of Wins show results without names or ages, unless you tick the box to show your first name or nickname. Result papers are stored privately, are kept as a record of the
          project, and Gary may save a copy in his Google Drive. They are not published without your permission, and you can ask us to delete yours at
          any time. If you are under 18, a parent or guardian must tick the box to agree.
        </p>
      </Section>

      <Section title="3. Why we use it">
        <p>
          To let you log in, process and approve your orders, give you the speaking feedback and history, send you
          emails about your order, answer your messages, and keep the site working and safe. We do not sell your
          information and we do not use it for advertising.
        </p>
      </Section>

      <Section title="4. Who helps us handle your data">
        <p>We use a few services to run the site. They only get what they need to do their job:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li><b>Supabase</b>: our database, sign-in and file storage. Our data is stored in Sydney, Australia.</li>
          <li><b>Vercel</b>: hosts the website.</li>
          <li>
            <b>Groq</b> (an AI service in the United States): receives your speaking recording to turn it into text, and the
            transcript to mark it. We may change or add AI providers over time, and we will update this page when we do.
            We do not use your recordings or transcripts to train any AI.
          </li>
          <li><b>Resend</b>: sends our emails, such as your order approval.</li>
          <li><b>Google Drive</b>: Gary may keep a copy of result papers you choose to send, as a record of The Bookshelf 100.</li>
          <li>
            <b>Telegram</b>: when you submit a receipt, the photo is sent to Gary's private Telegram chat so he can check
            it. It is deleted from Telegram as soon as the order is approved or rejected. Feedback you send us through the
            site is also forwarded to that private chat, together with your email so we can reply.
          </li>
        </ul>
        <p>
          Some of these services are outside Malaysia, so your information can be processed in other countries. We may also
          share information if the law requires it.
        </p>
      </Section>

      <Section title="5. How long we keep it">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <b>Receipt screenshots:</b> deleted {RECEIPT_KEEP_DAYS} days after the order is approved or rejected. The order
            record itself stays for our bookkeeping.
          </li>
          <li><b>Speaking transcripts and feedback:</b> kept until you ask us to delete them.</li>
          <li><b>Questions, results and result papers:</b> kept until you ask us to delete them. Votes are kept without any name.</li>
          <li><b>Your account details:</b> kept until you ask us to delete your account.</li>
        </ul>
      </Section>

      <Section title="6. Your choices">
        <p>
          You can ask us to show you the information we hold about you, correct it, or delete it (including your account and
          speaking history). Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-clay-600 underline">{CONTACT_EMAIL}</a> from the email address on
          your account. We will reply as soon as we can, normally within 21 days. If we delete your account you will lose
          any unused speaking attempts, and we may keep order records we need for bookkeeping.
        </p>
      </Section>

      <Section title="7. Students under 18">
        <p>
          Many of our students are school students. If you are under 18, please ask a parent or guardian before you buy
          anything or use speaking practice. A parent or guardian can email us at any time to see or delete a child's
          information.
        </p>
      </Section>

      <Section title="8. Keeping it safe">
        <p>
          The site uses HTTPS, our database is set up so that students can only see their own information, and only Gary
          can review orders. No website is perfectly secure, so please use a password you do not use elsewhere. If we find
          out that your information has been exposed in a way that could harm you, we will tell you.
        </p>
      </Section>

      <Section title="9. Changes and contact">
        <p>
          If we change this policy we will update the date at the top. Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-clay-600 underline">{CONTACT_EMAIL}</a>. You can also read our{" "}
          <Link href="/terms" className="text-clay-600 underline">terms of use</Link>.
        </p>
      </Section>
    </div>
  );
}
