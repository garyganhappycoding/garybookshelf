import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProductsBySales } from "@/lib/best-sellers";

export const metadata = { title: "Start here · Gary's Bookshelf", description: "What is on Gary's Bookshelf and how to use it, including the Speaking AI." };
export const revalidate = 300;

const PLACES = [
  { href: "/speaking", emoji: "🎤", title: "Speaking practice", text: "Pick a question, speak for 2 minutes, get a score and feedback from the AI. 2 free tries every day." },
  { href: "/free-resources", emoji: "📥", title: "Free resources", text: "Sample notes and templates, no charge." },
  { href: "/content-hub", emoji: "💡", title: "Content hub", text: "Study tips and highlights from my videos." },
  { href: "/shop", emoji: "📝", title: "Shop", text: "Essay notes for English and BM, and Speaking packs for more attempts." },
  { href: "/hi", emoji: "💬", title: "Say hi to Gary", text: "Ask a question or tell me your result with a free account, and read my reply on the site. Voting needs no account." },
  { href: "/ask-gary", emoji: "🤖", title: "Ask Gary", text: "My AI study buddy. Coming soon.", soon: true },
];

const SPEAKING_STEPS = [
  ["Sign up (free)", "You need an account so your results are saved. Your 2 free tries a day come with it."],
  ["Choose a theme and a question", "Tap a theme, then pick a question or tap Random question. Open the ideas bank if you are stuck."],
  ["Plan for 30 seconds, then speak for 2 minutes", "Cover every bullet on the card. Do not stop early: very short answers cannot be marked well."],
  ["Read your report", "You get a score out of 24, how well you covered each point, your biggest problem and better words to use."],
  ["Fix one thing and try again", "Take the biggest problem, fix it, and do the same question again. That is how the score goes up."],
];

export default async function StartPage() {
  const products = (await getProductsBySales()).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="text-clay-700 text-sm mb-1">New here?</p>
      <h1 className="font-hand text-5xl text-clay-700 mb-2">Start here</h1>
      <p className="text-ink/70 mb-8 leading-relaxed">
        Hi, I&apos;m Gary. This site helps you learn how to learn: practise speaking with the AI, grab free resources, get my essay notes,
        and tell me how it goes. Here is where everything is.
      </p>

      <div className="card !bg-cream-50 mb-10">
        <p className="font-medium mb-2">Got 5 minutes? Do this:</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/speaking" className="btn-primary">1. Try a speaking question</Link>
          <Link href="/free-resources" className="btn-secondary">2. Open a free resource</Link>
          <Link href="/hi" className="btn-secondary">3. Tell Gary how it went</Link>
        </div>
      </div>

      <h2 className="text-xl font-medium mb-3">What is on this website</h2>
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        {PLACES.map((p) => (
          <Link key={p.title} href={p.href} className="card flex gap-4 hover:border-clay-400">
            <span className="text-2xl">{p.emoji}</span>
            <span>
              <span className="block font-medium">
                {p.title}
                {p.soon && <span className="ml-2 text-[11px] bg-sage-400/20 text-sage-600 px-2 py-0.5 rounded-full align-middle">Coming soon</span>}
              </span>
              <span className="block text-sm text-ink/60">{p.text}</span>
            </span>
          </Link>
        ))}
      </div>

      <h2 className="text-xl font-medium mb-1">How to use the Speaking AI</h2>
      <p className="text-sm text-ink/60 mb-4">Made for SPM English speaking practice (Part 2, the individual long turn).</p>
      <ol className="space-y-3 mb-4">
        {SPEAKING_STEPS.map(([t, d], i) => (
          <li key={t} className="card flex gap-4 !py-3">
            <span className="flex-none w-8 h-8 rounded-full bg-clay-600 text-white flex items-center justify-center text-sm font-medium">{i + 1}</span>
            <span>
              <span className="block font-medium">{t}</span>
              <span className="block text-sm text-ink/65">{d}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="text-sm text-ink/70 mb-12">
        Free gives you the score, your biggest problem and word upgrades. A Speaking pack gives the full report, with every problem, phrase upgrades,
        your own sentences rewritten with phrases from my essay notes, and your pace, pauses and fillers.{" "}
        <Link href="/shop#speaking-free-vs-paid" className="text-clay-600 underline">Compare free and paid</Link>
      </p>

      <h2 className="text-xl font-medium mb-1">Notes and packs</h2>
      <p className="text-sm text-ink/60 mb-4">The ones students pick most.</p>
      {products.length > 0 ? (
        <div className="grid sm:grid-cols-3 gap-4 mb-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink/50 mb-3">Nothing here yet.</p>
      )}
      <p className="text-sm mb-12">
        <Link href="/shop" className="text-clay-600 underline">See everything in the shop</Link>
        <span className="text-ink/50"> · Pay with Touch &apos;n Go, upload your receipt, and Gary approves it.</span>
      </p>

      <h2 className="text-xl font-medium mb-1">Tell me how it went</h2>
      <p className="text-sm text-ink/70 mb-4">
        I read every message, and it decides what I make next. You do not need an account for any of these.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card">
          <p className="font-medium">👍 After a speaking report</p>
          <p className="text-sm text-ink/65">Tap the thumbs at the bottom of your report. Add a few words if you like.</p>
        </div>
        <Link href="/feedback" className="card hover:border-clay-400">
          <p className="font-medium">📈 Tell me your result</p>
          <p className="text-sm text-ink/65">Did your grades improve, or did you start studying on your own? Share it.</p>
        </Link>
        <Link href="/question" className="card hover:border-clay-400">
          <p className="font-medium">💬 Ask a question</p>
          <p className="text-sm text-ink/65">Stuck with studying? Tell me what is going on.</p>
        </Link>
        <Link href="/100" className="card hover:border-clay-400">
          <p className="font-medium">🎯 The Bookshelf 100</p>
          <p className="text-sm text-ink/65">This year&apos;s goal: help 100 people learn how to learn. See how it is going.</p>
        </Link>
      </div>
    </div>
  );
}
