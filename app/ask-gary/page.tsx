import Link from "next/link";

export const metadata = { title: "Ask Gary · Gary's Bookshelf" };

export default function AskGaryPage() {
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/dolphin-icon.png" alt="" className="w-16 h-16 rounded-full mx-auto mb-4" />
      <p className="inline-block text-xs bg-sage-400/20 text-sage-600 px-3 py-1 rounded-full mb-3">Coming soon</p>
      <h1 className="font-hand text-4xl text-clay-700 mb-3">Ask Gary</h1>
      <p className="text-ink/70 leading-7 mb-2">
        Gary's AI study buddy is on the way. Tell it your situation, and it will point you to what Gary has already shared about it,
        like his reels and notes.
      </p>
      <p className="text-ink/70 leading-7 mb-8">We're still putting everything together. Check back soon!</p>
      <div className="flex justify-center gap-3">
        <Link href="/#resources" className="btn-primary">Free resources</Link>
        <Link href="/speaking" className="btn-secondary">Try Speaking practice</Link>
      </div>
    </div>
  );
}
