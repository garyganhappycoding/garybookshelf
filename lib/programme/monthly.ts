// SERVER-ONLY. The monthly essay test (Gary, 25 Nov 2026): on the last Sunday of each month (the Saturday card for Group A) every student writes
// one BI and one BM essay on the FIRST content week's question of that month. It is mandatory, marked by the essay marker, and not part of the streak.
import { addDays, buildCalendar, contentWeekOf, key, parse, programmeEnd } from "./calendar";
import { dayKeyFor, formKey, getWeek } from "./content/index";
import { questionFor } from "./dayflow";
import { getProfile } from "./profile";
import { createAdminClient } from "@/lib/supabase/admin";

export type MonthlyItem = { month: number; date: string; BI: string; BM: string; done: { BI: boolean; BM: boolean } };

const YEAR = 2027;

/** Monthly tests whose day has come and that are not finished yet, oldest first. */
export async function pendingMonthly(userId: string, today: string): Promise<MonthlyItem[]> {
  const p = await getProfile(userId);
  const cal = buildCalendar(p.state);
  const end = programmeEnd(p.exams, p.form);
  const { data } = await createAdminClient().from("programme_essay_tests").select("lang, period").eq("user_id", userId).eq("kind", "monthly");
  const done = new Set((data ?? []).map((r) => `${r.lang}-${r.period}`));
  const out: MonthlyItem[] = [];
  for (let month = 1; month <= 12; month++) {
    const last = new Date(YEAR, month, 0).getDate();
    let test = "";
    for (let d = last; d >= 1; d--) {
      const day = new Date(YEAR, month - 1, d, 12);
      if (dayKeyFor(cal.group, day.getDay()) === "sun") { test = key(day); break; }
    }
    if (!test || test > today) continue;
    const cw = contentWeekOf(cal, p.exams, parse(test), end);
    if (!cw || !("n" in cw)) continue; // exam week, after the end, or outside the programme: no test this month
    let first: number | null = null;
    for (let d = 1; d <= last && first === null; d++) {
      const w = contentWeekOf(cal, p.exams, addDays(new Date(YEAR, month - 1, 1, 12), d - 1), end);
      if (w && "n" in w) first = w.n;
    }
    if (first === null) continue;
    const fk = formKey(p.form);
    const bi = getWeek(fk, "BI", first), bm = getWeek(fk, "BM", first);
    if (!bi || !bm) continue;
    const item: MonthlyItem = { month, date: test, BI: questionFor(bi), BM: questionFor(bm), done: { BI: done.has(`BI-${month}`), BM: done.has(`BM-${month}`) } };
    if (!item.done.BI || !item.done.BM) out.push(item);
  }
  return out;
}
