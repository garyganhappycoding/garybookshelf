import Link from "next/link";
import TypingWord from "@/components/TypingWord";
import ReplyCard from "@/components/ReplyCard";

// Homepage in the Cerdek style: one headline, one main button, then a grid of small feature cards that each show what the
// thing looks like, and a short FAQ.
export const revalidate = 3600;

const mock = "rounded-2xl bg-white border border-ink/10 p-3 shadow-sm";

function Card({ href, title, text, children, tag }: { href: string; title: string; text: string; children: React.ReactNode; tag?: string }) {
  return (
    <Link href={href} className="group rounded-3xl bg-cream-100 border border-cream-200 p-4 flex flex-col hover:border-clay-400 hover:-translate-y-0.5 transition">
      <div className="h-44 rounded-2xl bg-cream-50 flex items-center justify-center p-4 overflow-hidden">{children}</div>
      <p className="mt-4 font-semibold text-ink flex items-center gap-2">
        {title}
        {tag && <span className="text-[11px] font-medium bg-clay-600 text-white px-2 py-0.5 rounded-full">{tag}</span>}
      </p>
      <p className="text-sm text-ink/60 mt-1 leading-relaxed">{text}</p>
    </Link>
  );
}

const FAQ = [
  ["Who is Gary?", "I'm Gary, the person behind @gary_bookshelf (52k+ followers). I got 4.00 flat in matriculation and I share the study systems that worked for me."],
  ["Is it free?", "Yes to start. You get 2 free Speaking attempts every day, plus free resources. Notes and extra attempts are paid, from RM2.50."],
  ["How do I pay?", "Touch 'n Go. Upload your receipt and I approve it by hand, usually within a day. Your notes and attempts then appear in My orders."],
  ["Where do I find what I bought?", "Log in and tap “My orders” at the top right. After I approve your payment, your download button or Speaking attempts are there. I also email you when it is approved."],
  ["Can I share my PDFs?", "Please don't. Each Sains Komputer PDF is made just for you, locked with your own password and carries your email on every page."],
  ["Will you answer my question?", "Yes. Ask on the question page, no account needed. Come back to “Check Gary's reply” (under the cards) to read my answer and reply."],
];

export default function HomePage() {
  return (
    <div>
      {/* HERO: one headline, one button */}
      <section className="max-w-3xl mx-auto px-5 pt-14 pb-12 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/dolphin-icon.png" alt="" className="w-20 h-20 rounded-full mx-auto mb-5 border-4 border-clay-600/80 bg-white" />
        <h1 className="text-4xl sm:text-5xl font-semibold text-ink leading-tight">
          Hi! I&apos;m Gary
          <span className="block mt-1">
            Learn how to <TypingWord words={["study smarter", "speak better English", "write better essays", "score for SPM"]} className="font-hand text-clay-700 text-[1.15em]" />
          </span>
        </h1>
        <p className="text-ink/60 mt-5 max-w-lg mx-auto">Study systems from a 4.00-flat student, plus an AI that marks your SPM speaking and tells you what to fix.</p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link href="/speaking" className="btn-primary !px-8 !py-3 text-base">Try Speaking AI free</Link>
          <Link href="/start" className="text-sm text-ink/60 underline">New here? See how it works</Link>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="max-w-5xl mx-auto px-5 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card href="/speaking" title="SPM Speaking Practice" text="Pick a question, speak for 2 minutes, get your score out of 24 and what to fix. 2 free tries a day." tag="Free">
            <div className={`${mock} w-full max-w-[250px]`}>
              <p className="text-[11px] text-ink/50 mb-1">AI examiner</p>
              <p className="text-sm">Tell me about a film you enjoyed.</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center"><span className="w-2.5 h-2.5 bg-white rounded-sm" /></span>
                <span className="flex items-end gap-[3px] h-6">
                  {[8, 14, 20, 12, 22, 16, 9, 18, 11].map((h, i) => <span key={i} className="w-[3px] rounded bg-clay-500" style={{ height: h }} />)}
                </span>
                <span className="ml-auto text-sm font-semibold text-sage-600">18/24</span>
              </div>
            </div>
          </Card>

          <Card href="/shop" title="Essay notes that you can memorise" text="Trial essays, vocab tables with 中文 and beautiful sentences, sorted by theme. English and BM.">
            <div className={`${mock} w-full max-w-[250px] text-xs`}>
              {[
                ["resilient", "有韧性的"],
                ["mitigate", "减轻"],
                ["a sense of belonging", "归属感"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between py-1.5 border-b border-ink/5 last:border-0">
                  <span className="font-medium">{a}</span>
                  <span className="text-ink/60">{b}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card href="/shop" title="Sains Komputer bundle" text="5 PDFs for Form 4 + 5. Your own copy, locked with your password." tag="RM50">
            <div className="flex gap-2 items-end">
              {["T4 B1", "T4 B3", "T5 B1"].map((t, i) => (
                <div key={t} className="w-[70px] rounded-lg bg-white border border-ink/10 shadow-sm p-2" style={{ height: 96 + i * 8 }}>
                  <p className="text-[9px] font-semibold text-clay-700">{t}</p>
                  <div className="mt-2 space-y-1">
                    <span className="block h-1 bg-ink/10 rounded" />
                    <span className="block h-1 bg-ink/10 rounded w-4/5" />
                    <span className="block h-1 bg-yellow-200 rounded w-3/5" />
                    <span className="block h-1 bg-ink/10 rounded" />
                  </div>
                  <p className="mt-3 text-[8px] text-ink/40">🔒 PDF</p>
                </div>
              ))}
            </div>
          </Card>

          <Card href="/free-resources" title="Free resources" text="Sample notes and templates for Add Maths, Biology, Chemistry, Physics and more. No charge." tag="Free">
            <div className="flex flex-wrap gap-2 justify-center">
              {["Add Maths", "Biology", "Chemistry", "Physics", "BM", "How to study"].map((s) => (
                <span key={s} className="text-xs bg-white border border-ink/10 rounded-full px-3 py-1.5 shadow-sm">📥 {s}</span>
              ))}
            </div>
          </Card>

          <Card href="/question" title="Ask me a question" text="Stuck with studying? Tell me your problem. No account needed. I answer it, and you can reply to me.">
            <div className="w-full max-w-[250px] space-y-2 text-xs">
              <p className="bg-white border border-ink/10 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm w-4/5">How do I memorise formulas?</p>
              <p className="bg-sage-400/20 rounded-2xl rounded-br-sm px-3 py-2 ml-auto w-5/6">Gary: Try active recall. Test the chapter without looking.</p>
            </div>
          </Card>

          <Card href="/feedback" title="Share your result" text="Did your grades improve, or did you start studying on your own? Tell me and join The Bookshelf 100." tag="2 / 100">
            <div className={`${mock} w-full max-w-[250px]`}>
              <div className="flex justify-between text-xs mb-2"><span className="font-medium">Results shared</span><span className="text-ink/60">2 / 100</span></div>
              <div className="h-2 rounded-full bg-ink/10"><div className="h-2 rounded-full bg-clay-500" style={{ width: "6%" }} /></div>
              <p className="text-[11px] text-ink/50 mt-2">“My Add Maths went from C to B+” — Wall of Wins</p>
            </div>
          </Card>
        </div>
        <p className="text-center mt-6"><ReplyCard compact /></p>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-5 pb-20">
        <h2 className="text-2xl font-semibold text-center mb-6">Questions</h2>
        <div className="divide-y divide-ink/10 border-y border-ink/10">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium list-none">
                {q}
                <span className="text-ink/40 group-open:rotate-180 transition">⌄</span>
              </summary>
              <p className="mt-2 text-sm text-ink/70 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
