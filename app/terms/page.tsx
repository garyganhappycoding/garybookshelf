import Link from "next/link";
import {
  CONTACT_EMAIL,
  FREE_PER_DAY,
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  LEGAL_UPDATED,
  PACK_ATTEMPTS,
  PACK_DAYS,
  PACK_PRICE,
} from "@/lib/legal";

export const metadata = { title: "Terms of use · Gary's Bookshelf" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-9">
      <h2 className="text-lg font-medium mb-2">{title}</h2>
      <div className="space-y-3 text-ink/80 leading-relaxed">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Terms of use</h1>
      <p className="text-sm text-ink/50">Last updated {LEGAL_UPDATED}</p>
      <p className="mt-5 text-ink/80 leading-relaxed">
        These are the rules for using Gary's Bookshelf, including buying notes and using the Speaking practice tool. By
        creating an account, buying something or using the site you agree to them. If you are under 18, please read this
        with a parent or guardian.
      </p>

      <Section title="1. Your account">
        <ul className="list-disc pl-5 space-y-2">
          <li>Use a real email address that you can read. We send order emails there.</li>
          <li>One account is for one person. Please do not share your login, your speaking attempts or your download links.</li>
          <li>You are responsible for what happens on your account, so keep your password private.</li>
        </ul>
      </Section>

      <Section title="2. Speaking practice">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Speaking practice is an <b>AI study tool</b>. Scores and feedback are estimates to help you improve. They are
            not an official grade, and the AI cannot judge your pronunciation or accent.
          </li>
          <li>
            Every member gets <b>{FREE_PER_DAY} free attempts a day</b>. The day resets at midnight Malaysia time. We may
            change the free allowance, and we may limit it when the service is very busy.
          </li>
          <li>
            If an attempt fails because of a technical problem, or the recording is too short to mark, it is not counted
            and you can try again.
          </li>
          <li>
            The AI service can sometimes be busy or unavailable. We do our best, but we cannot promise it will always work
            or that feedback will be the same every time.
          </li>
        </ul>
      </Section>

      <Section title="3. The Speaking pack">
        <ul className="list-disc pl-5 space-y-2">
          <li>
            A pack costs <b>{PACK_PRICE}</b> and gives you <b>{PACK_ATTEMPTS} extra attempts</b>, valid for{" "}
            <b>{PACK_DAYS} days from the day we approve your payment</b>.
          </li>
          <li>Your free daily attempts are used first, then your pack attempts.</li>
          <li>Unused attempts expire when the {PACK_DAYS} days end. They cannot be extended, carried over or transferred.</li>
          <li>Pack attempts cannot be exchanged for cash.</li>
        </ul>
      </Section>

      <Section title="4. Buying from us">
        <ul className="list-disc pl-5 space-y-2">
          <li>Prices are in Malaysian ringgit (RM).</li>
          <li>
            You pay by Touch 'n Go and upload a screenshot of your receipt. We check each payment by hand and approve it as
            soon as we can. This can take some time, and we cannot approve a payment we cannot verify.
          </li>
          <li>Please pay the exact price and upload a clear screenshot. If the amount does not match, we may reject the order.</li>
          <li>When we approve your order we email you, and your purchase appears in "My orders".</li>
        </ul>
      </Section>

      <Section title="5. No refunds, but tell us if something is wrong">
        <p>
          Our products are digital, so we do not give refunds. If there is a problem, such as a download or link that does
          not work, a payment that was not approved, or an attempt that was not given back, please message us on Instagram (
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="text-clay-600 underline">{INSTAGRAM_HANDLE}</a>)
          or email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-clay-600 underline">{CONTACT_EMAIL}</a> and we will help you.
          This does not affect any rights you have under Malaysian consumer law.
        </p>
      </Section>

      <Section title="6. Notes, downloads and links">
        <p>
          Notes, files and group links you buy are for <b>your personal study only</b>. Please do not resell, post or share
          them. Some links can only be opened once. If we find a purchase being shared, we may remove access without a refund.
        </p>
      </Section>

      <Section title="7. What you must not do">
        <ul className="list-disc pl-5 space-y-2">
          <li>Use bots, scripts or tricks to get more attempts or to overload the site.</li>
          <li>Try to access other people's accounts or information.</li>
          <li>Upload fake or edited receipts.</li>
          <li>Submit speech or messages that are unlawful, abusive or harmful to others.</li>
        </ul>
        <p>We may pause or close an account that breaks these rules.</p>
      </Section>

      <Section title="8. Your speaking content">
        <p>
          Your recordings and transcripts remain yours. By using Speaking practice you allow us, and the AI services we
          use, to process them so that you can get your feedback. See our{" "}
          <Link href="/privacy" className="text-clay-600 underline">privacy policy</Link> for how we handle them.
        </p>
      </Section>

      <Section title="9. Limits on our responsibility">
        <p>
          We provide the site and the tool "as is". We do not promise a particular exam result or score. To the extent the
          law allows, we are not responsible for indirect losses, and our total responsibility for any problem with an
          order is limited to the amount you paid for that order.
        </p>
      </Section>

      <Section title="10. Changes, law and contact">
        <p>
          We may update these terms, prices or the free allowance. When we do, we change the date at the top, and changes
          apply to future purchases. These terms are governed by the laws of Malaysia. Questions? Email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-clay-600 underline">{CONTACT_EMAIL}</a>.
        </p>
      </Section>
    </div>
  );
}
