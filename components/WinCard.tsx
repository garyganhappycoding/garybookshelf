// One card on the Wall of Wins. Shows a student's result without their age, and with a name only if they allowed it.

type Win = {
  id: string;
  body: string | null;
  display_name: string | null;
  created_at: string;
  payload: any;
};

const COLORS = ["#F4DDD0", "#E3EBDB", "#F7EBC5", "#DDE9F2", "#F6DDE3"]; // clay, sage, mustard, sky, rose (soft)

const hash = (s: string) => [...s].reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);

// "17, Form 5" becomes "Form 5 student": the age is never shown
function levelOf(ageForm: string | null | undefined) {
  const m = (ageForm ?? "").match(/(form\s*[1-6]|tingkatan\s*[1-6]|spm|stpm|pt3|upsr|igcse|a-?level|uec|year\s*\d+|grade\s*\d+|matric\w*|foundation|diploma|degree|university|college)/i);
  if (!m) return "A student";
  const t = m[1].replace(/\s+/g, " ");
  return `${t.charAt(0).toUpperCase()}${t.slice(1)} student`.replace(/^(A|a)-?level/i, "A-level");
}

function change(before: string, after: string) {
  const b = parseFloat(before);
  const a = parseFloat(after);
  if (!isFinite(b) || !isFinite(a) || b <= 0 || a <= b) return null;
  const diff = a - b;
  return { diff: Math.round(diff * 10) / 10, pct: Math.round((diff / b) * 100) };
}

export default function WinCard({ win }: { win: Win }) {
  const p = win.payload ?? {};
  const h = hash(win.id);
  const bg = COLORS[h % COLORS.length];
  const tilt = ((h % 7) - 3) * 0.5; // -1.5 to +1.5 degrees, like notes pinned to a board
  const who = p.show_name && win.display_name ? win.display_name : levelOf(p.age_form);
  const month = new Date(win.created_at).toLocaleDateString("en-GB", { timeZone: "Asia/Kuala_Lumpur", month: "short", year: "numeric" });
  const delta = p.criterion === "grade" ? change(String(p.before ?? ""), String(p.after ?? "")) : null;

  return (
    <article
      className="break-inside-avoid mb-5 rounded-2xl p-5 shadow-sm border border-black/5"
      style={{ background: bg, transform: `rotate(${tilt}deg)` }}
    >
      {p.criterion === "grade" ? (
        <>
          <p className="text-xs font-medium tracking-wide uppercase text-ink/60 mb-1">
            📈 {p.subject}
            {p.exam ? ` · ${p.exam}` : ""}
          </p>
          <p className="font-hand text-5xl text-clay-700 leading-none mb-2">
            {p.before} <span className="text-ink/40">→</span> {p.after}
          </p>
          {delta && (
            <p className="inline-block bg-white/70 text-sage-600 font-semibold text-sm rounded-full px-3 py-1 mb-3">
              +{delta.diff} · up {delta.pct}%
            </p>
          )}
        </>
      ) : (
        <>
          <p className="text-xs font-medium tracking-wide uppercase text-ink/60 mb-1">📚 Studying on their own</p>
          <p className="font-hand text-3xl text-clay-700 leading-tight mb-2">Started studying and actually did it</p>
          {p.technique && <p className="inline-block bg-white/70 text-ink/80 text-sm rounded-full px-3 py-1 mb-3">{p.technique}</p>}
        </>
      )}
      {win.body && <p className="text-ink/85 leading-relaxed italic">“{win.body}”</p>}
      <p className="text-xs text-ink/55 mt-3">
        — {who} · {month}
      </p>
    </article>
  );
}
