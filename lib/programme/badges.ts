// SERVER-ONLY. 陪你读书 badges, version 2 (Gary, 25 Nov 2026). The medals students collect, and the rules that award them:
//   起步宝宝  hand in day 1                       词汇专家  remember 22 vocabulary cards (quiz "remembered")
//   造句专家  write 36 sentences                  开头专家  write 4 openings (the Day 3 task)
//   论点专家  write 6 elaborations (Day 4)        结尾专家  write 2 closings (Day 5)
//   积极！    write 3 essays (weekly or monthly test)   温故知新  meet an essay theme a 2nd time (once)
//   努力 n 天 a surprise every 7 to 14 days of an on-time streak; the longer the streak, the rarer the metal (铜 银 金 铂)
//   重新努力！ win the streak back to 5 days after it broke     恒心  100-day streak     SPM FULL A  200-day streak
//   进步拉！！ exam average about 20% better than the previous result     自学  finish every content week: numbered, limited edition.
// The back of every badge carries the student's nickname, a serial number and a few words from Gary (edited in /admin/programme-badges).
// Sharing a badge earns NOTHING extra (Gary: students may share as often as they like).
import { createAdminClient } from "@/lib/supabase/admin";
import { addDays, contentWeekOf, key, parse, type Calendar } from "./calendar";
import { dayKeyFor, weeksAvailable, formKey } from "./content/index";

export type Tier = "bronze" | "silver" | "gold" | "plat";
export type Badge = { id: string; family: string; title: string; how: string; backMessage: string; rarity: "common" | "rare" | "ultimate"; sort: number };
export type Earned = { n: number | null; tier: Tier | null; serial: number; edition: number | null; earnedAt: string; pasted: boolean };
export type WallBadge = Badge & { earned: Earned[] };
export type Won = { id: string; title: string; n?: number };

export const ZIXUE_MISS = 0.1; // 自学 allows up to 10% of the task days to be missed (Gary: "loosen it", 25 Nov 2026; the 10% is my default, change here)
export const ZIXUE_LIMIT = 200; // numbered limited edition: only this many 自学 badges are ever given
export const GAP = { min: 7, max: 14 }; // days between two 努力 n 天 badges, random
export const TARGET = { vocab: 22, sentence: 36, opening: 4, closing: 2, point: 6, active: 3, recoverTo: 5, steady: 100, fulla: 200, improve: 0.2 };

/** Rarer metal the longer the streak: 7-13 bronze, 14-27 silver, 28-59 gold, 60 and up platinum. */
export const tierFor = (n: number): Tier => (n >= 60 ? "plat" : n >= 28 ? "gold" : n >= 14 ? "silver" : "bronze");

const between = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export async function wall(userId: string): Promise<WallBadge[]> {
  const admin = createAdminClient();
  const [{ data: badges }, { data: mine }] = await Promise.all([
    admin.from("programme_badges").select("*").order("sort"),
    admin.from("programme_student_badges").select("badge_id, n, tier, serial, edition, earned_at, pasted").eq("user_id", userId).order("earned_at"),
  ]);
  const by = new Map<string, Earned[]>();
  for (const m of mine ?? []) {
    const list = by.get(m.badge_id) ?? [];
    list.push({ n: m.n, tier: m.tier, serial: Number(m.serial), edition: m.edition, earnedAt: m.earned_at, pasted: !!m.pasted });
    by.set(m.badge_id, list);
  }
  return (badges ?? []).map((b) => ({ id: b.id, family: b.family, title: b.title, how: b.how, backMessage: b.back_message, rarity: b.rarity, sort: b.sort, earned: by.get(b.id) ?? [] }));
}

async function give(userId: string, id: string, source: string, extra: { n?: number; tier?: Tier; edition?: number } = {}) {
  const { error } = await createAdminClient().from("programme_student_badges").insert({ user_id: userId, badge_id: id, source, n: extra.n ?? null, tier: extra.tier ?? null, edition: extra.edition ?? null });
  return !error;
}

/** 自学: numbered 1..ZIXUE_LIMIT. Retries when two students finish at the same moment. */
async function giveZixue(userId: string) {
  const admin = createAdminClient();
  for (let i = 0; i < 5; i++) {
    const { data } = await admin.from("programme_student_badges").select("edition").eq("badge_id", "zixue").order("edition", { ascending: false }).limit(1);
    const next = ((data?.[0]?.edition as number | undefined) ?? 0) + 1;
    if (next > ZIXUE_LIMIT) return false;
    if (await give(userId, "zixue", "finished every week", { edition: next })) return true;
  }
  return false;
}

export type AwardContext = { cal: Calendar; exams: { start: string; end: string }[]; end: string | null; form: number; streak: number; weekN: number | null };

/**
 * Called after a student hands in today's task on time. Works out every badge the student has just earned, from their real answers.
 * Returns the badges won (so the page can celebrate). Safe to call twice: a badge is never given twice.
 */
export async function awardAfterSubmit(userId: string, c: AwardContext): Promise<Won[]> {
  const admin = createAdminClient();
  const [{ data: subs }, { data: tests }, { data: have }, { data: st }, { data: titles }] = await Promise.all([
    admin.from("programme_submissions").select("day, details, quiz_correct").eq("user_id", userId),
    admin.from("programme_essay_tests").select("id").eq("user_id", userId),
    admin.from("programme_student_badges").select("badge_id, n").eq("user_id", userId),
    admin.from("programme_reward_state").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("programme_badges").select("id, title"),
  ]);
  const title = new Map((titles ?? []).map((t) => [t.id as string, t.title as string]));
  const owned = new Set((have ?? []).map((h) => `${h.badge_id}:${h.n ?? 0}`));
  const won: Won[] = [];
  const grant = async (id: string, source: string, extra: { n?: number; tier?: Tier } = {}) => {
    if (owned.has(`${id}:${extra.n ?? 0}`)) return;
    const ok = id === "zixue" ? await giveZixue(userId) : await give(userId, id, source, extra);
    if (ok) { owned.add(`${id}:${extra.n ?? 0}`); won.push({ id, title: title.get(id) ?? id, n: extra.n }); }
  };

  // What the student has done so far: tasks by day key (Monday sentences, Wednesday opening, Thursday elaboration, Friday closing)
  let sentences = 0, vocab = 0, openings = 0, points = 0, closings = 0;
  for (const s of subs ?? []) {
    const d = parse(s.day), k = dayKeyFor(c.cal.group, d.getDay());
    const det = (s.details ?? {}) as { sentences?: unknown[] };
    if (Array.isArray(det.sentences)) sentences += det.sentences.length;
    vocab += s.quiz_correct ?? 0;
    if (k === "wed") openings += 1;
    if (k === "thu") points += 1;
    if (k === "fri") closings += 1;
  }

  if ((subs ?? []).length >= 1) await grant("start", "first day");
  if (vocab >= TARGET.vocab) await grant("vocab", `${vocab} cards remembered`);
  if (sentences >= TARGET.sentence) await grant("sentence", `${sentences} sentences`);
  if (openings >= TARGET.opening) await grant("opening", `${openings} openings`);
  if (closings >= TARGET.closing) await grant("closing", `${closings} closings`);
  if (points >= TARGET.point) await grant("point", `${points} elaborations`);
  if ((tests ?? []).length >= TARGET.active) await grant("active", `${(tests ?? []).length} essays`);
  // 温故知新: the 11 essay themes repeat, so week 12 onward is the second meeting with a theme
  if (c.weekN && c.weekN > 11) await grant("review", `week ${c.weekN}`);

  // The streak: a surprise 努力 n 天 every 7 to 14 days; a broken streak starts the schedule again
  let nextAt = st?.next_at ?? GAP.min, broken = !!st?.broken;
  if (st && c.streak < st.last_streak) { nextAt = GAP.min; broken = true; }
  if (c.streak >= nextAt) {
    await grant("effort", `streak ${c.streak}`, { n: c.streak, tier: tierFor(c.streak) });
    nextAt = c.streak + between(GAP.min, GAP.max);
  }
  if (broken && c.streak >= TARGET.recoverTo) { await grant("recover", `back to ${c.streak}`); broken = false; }
  if (c.streak >= TARGET.steady) await grant("steady", `streak ${c.streak}`);
  if (c.streak >= TARGET.fulla) await grant("fulla", `streak ${c.streak}`);
  await admin.from("programme_reward_state").upsert({ user_id: userId, next_at: nextAt, last_streak: c.streak, broken, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  // 自学: almost every school day of every content week handed in (at most ZIXUE_MISS of them missed; a late hand-in counts; exam weeks and public holidays carry no task)
  const need = requiredDays(c);
  if (need.length) {
    const have = new Set((subs ?? []).map((s) => String(s.day)));
    const left = need.filter((k) => !have.has(k)).length;
    if (left <= Math.floor(need.length * ZIXUE_MISS)) await grant("zixue", `${need.length - left}/${need.length} days`);
  }
  return won;
}

/** Every school day that carries a task in this student's programme: the days the 自学 badge asks them to finish. */
export function requiredDays(c: Pick<AwardContext, "cal" | "exams" | "end" | "form">): string[] {
  const last = weeksAvailable(formKey(c.form), "BI").length;
  const out: string[] = [];
  for (let d = parse("2027-01-01"); key(d) <= "2027-12-31"; d = addDays(d, 1)) {
    if (!c.cal.isSchool(d)) continue;
    const cw = contentWeekOf(c.cal, c.exams, d, c.end);
    if (cw && "n" in cw && cw.n <= last) out.push(key(d));
  }
  return out;
}

/** 进步拉！！: the average of the subjects in this exam is about 20% above the previous result (the subjects both have). */
export async function awardForImprovement(userId: string, previous: Record<string, number | null>, latest: Record<string, number | null>): Promise<Won | null> {
  const both = Object.keys(latest).filter((s) => (previous[s] ?? 0) > 0 && latest[s] != null);
  if (!both.length) return null;
  const gain = both.reduce((n, s) => n + (latest[s]! - previous[s]!) / previous[s]!, 0) / both.length;
  if (gain < TARGET.improve) return null;
  const ok = await give(userId, "improve", `average +${Math.round(gain * 100)}%`);
  return ok ? { id: "improve", title: "进步拉！！" } : null;
}

export async function setPasted(userId: string, badgeId: string, serial: number, pasted: boolean) {
  await createAdminClient().from("programme_student_badges").update({ pasted }).eq("user_id", userId).eq("badge_id", badgeId).eq("serial", serial);
}
