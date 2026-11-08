import Link from "next/link";

export default function WritingComingSoon() {
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/dolphin-icon.png" alt="" className="w-16 h-16 rounded-full mx-auto mb-4" />
      <p className="inline-block text-xs bg-sage-400/20 text-sage-600 px-3 py-1 rounded-full mb-3">Coming soon</p>
      <h1 className="font-hand text-4xl text-clay-700 mb-3">Essay marking</h1>
      <p className="text-ink/70 leading-7 mb-8">We&apos;re still putting this together. Check back soon!</p>
      <div className="flex justify-center gap-3">
        <Link prefetch={false} href="/speaking" className="btn-primary">
          Try Speaking practice
        </Link>
        <Link href="/free-resources" className="btn-secondary">
          Free resources
        </Link>
      </div>
    </div>
  );
}
