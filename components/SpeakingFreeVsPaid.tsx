import Link from "next/link";

type Pack = { id: string; title: string; price_myr: number | string; speaking_pack_attempts: number | null; hasNotes: boolean };

// One row of the comparison. `free` and `paid` are what each side gets; "yes" and "no" show a tick or a lock.
type Cell = string | "yes" | "no";
type Row = { feature: string; free: Cell; paid: Cell };

const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Practice",
    rows: [
      { feature: "Attempts", free: "2 every day", paid: "2 free every day, plus 5, 15 or 30 more for 30 days" },
      { feature: "If the AI fails to mark", free: "The attempt is given back", paid: "The attempt is given back" },
      { feature: "When the AI is busy", free: "Normal queue, and a short pause after repeated failed tries", paid: "Priority marking, and more room to try again" },
    ],
  },
  {
    title: "Your report",
    rows: [
      { feature: "Score out of 24, 4 criteria with comments", free: "yes", paid: "yes" },
      { feature: "“Did you cover every point?” checklist", free: "yes", paid: "yes" },
      { feature: "Transcript with your repeated words highlighted", free: "yes", paid: "yes" },
      { feature: "Word upgrades (basic word → better words)", free: "yes", paid: "yes" },
      { feature: "Progress history", free: "yes", paid: "yes" },
      { feature: "Problems and how to fix them", free: "Your biggest problem", paid: "All of them (3 to 5)" },
      { feature: "Phrase upgrades (“I think”, “also”, “because of that”)", free: "no", paid: "yes" },
      { feature: "Your own sentences rewritten one band higher, with phrases from Gary's essay notes highlighted", free: "no", paid: "yes" },
      { feature: "Essay toolkit: 6 phrases from Gary's notes with 中文", free: "no", paid: "yes" },
      { feature: "Pace, long pauses and fillers", free: "no", paid: "yes" },
    ],
  },
];

function CellView({ value, who }: { value: Cell; who: "Free" | "Paid" }) {
  const label = <span className="sm:hidden text-[11px] uppercase tracking-wide text-ink/45 mr-2">{who}</span>;
  if (value === "yes") return <p className="text-sage-600 font-medium">{label}✓ Included</p>;
  if (value === "no") return <p className="text-ink/45">{label}🔒 Paid only</p>;
  return <p className={who === "Paid" ? "font-medium" : "text-ink/75"}>{label}{value}</p>;
}

export default function SpeakingFreeVsPaid({ packs }: { packs: Pack[] }) {
  return (
    <section id="speaking-free-vs-paid" className="mt-16 scroll-mt-24">
      <p className="text-clay-700 text-sm mb-1">Speaking AI</p>
      <h2 className="text-2xl font-medium mb-1">Free or paid: which one do you need?</h2>
      <p className="text-ink/60 mb-8 max-w-2xl">
        Everyone can practise speaking for free, every day. A Speaking pack unlocks the full report, so you can see everything to fix, not just the biggest problem.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="card">
          <p className="text-xs uppercase tracking-wide text-ink/50 mb-1">Free</p>
          <p className="font-medium mb-3">Stay free if you want to</p>
          <ul className="text-sm text-ink/75 space-y-1.5 list-disc pl-5">
            <li>try the Speaking AI first</li>
            <li>get your score and your biggest problem to fix</li>
            <li>practise twice a day, every day</li>
          </ul>
        </div>
        <div className="card !border-clay-400">
          <p className="text-xs uppercase tracking-wide text-clay-700 mb-1">Speaking pack</p>
          <p className="font-medium mb-3">Get a pack if you want to</p>
          <ul className="text-sm text-ink/75 space-y-1.5 list-disc pl-5">
            <li>fix everything, not just one problem</li>
            <li>see your own sentences rewritten with phrases from Gary&apos;s notes</li>
            <li>practise more than twice a day before your speaking test</li>
          </ul>
        </div>
      </div>

      <div className="card !p-0 overflow-hidden mb-8">
        <div className="hidden sm:grid grid-cols-[1.5fr_1fr_1fr] gap-4 bg-cream-100 px-5 py-3 text-xs uppercase tracking-wide text-ink/55">
          <p>What you get</p>
          <p>Free</p>
          <p className="text-clay-700">With a Speaking pack</p>
        </div>
        {GROUPS.map((g) => (
          <div key={g.title}>
            <p className="px-5 pt-4 pb-1 text-xs uppercase tracking-wide text-ink/45 bg-cream-50">{g.title}</p>
            {g.rows.map((r) => (
              <div key={r.feature} className="sm:grid sm:grid-cols-[1.5fr_1fr_1fr] gap-4 px-5 py-3 border-t border-ink/10 text-sm">
                <p className="font-medium mb-1 sm:mb-0">{r.feature}</p>
                <CellView value={r.free} who="Free" />
                <CellView value={r.paid} who="Paid" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="card !bg-cream-50 mb-8">
        <p className="text-xs uppercase tracking-wide text-ink/50 mb-2">Example of a paid report (not a real student)</p>
        <p className="text-sm text-ink/60">Before: <i>“I think social media is very good because it is useful.”</i></p>
        <p className="text-sm font-medium text-sage-600">
          After: “Social media is{" "}
          <mark className="bg-clay-400/25 text-clay-700 rounded px-0.5">a double-edged sword</mark>, but it is{" "}
          <mark className="bg-clay-400/25 text-clay-700 rounded px-0.5">an inseparable part of</mark> teenagers&apos; daily lives.”
        </p>
        <p className="text-xs text-ink/55 mt-2">Highlighted phrases come from Gary&apos;s English essay notes. Paid reports show them with their 中文 meaning.</p>
      </div>

      {packs.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Get a Speaking pack</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {packs.map((p) => (
              <Link key={p.id} href={`/shop/${p.id}`} className="card hover:border-clay-400 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-ink/55">
                    {p.speaking_pack_attempts} attempts, valid 30 days{p.hasNotes ? ", plus the essay notes" : ""}
                  </p>
                </div>
                <p className="text-clay-700 font-medium whitespace-nowrap">RM {Number(p.price_myr).toFixed(2)}</p>
              </Link>
            ))}
          </div>
          <p className="text-xs text-ink/55 mt-3">Pay with Touch &apos;n Go, upload your receipt, and your attempts appear once Gary approves your order. The 2 free attempts a day stay.</p>
        </div>
      )}
    </section>
  );
}
