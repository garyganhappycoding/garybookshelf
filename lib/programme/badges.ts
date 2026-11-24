// SERVER-ONLY. Badges: a variable-ratio reward for keeping a streak (Gary, 25 Nov 2026). The first one comes at a 3-day streak, then the next
// one after a random 3 to 7 more days, so a student never knows exactly when. Spines are the shelf's books: each has a short word from Gary
// on its back (edited in /admin/programme-badges). 进步徽章 comes when exam results beat the baseline; 自学 (the ultimate badge) unlocks
// when every other badge is collected. Sharing a badge earns NOTHING extra (Gary: students may share as often as they like).
import { createAdminClient } from "@/lib/supabase/admin";

export type Badge = { id: string; family: string; title: string; how: string; backMessage: string; rarity: "common" | "rare" | "ultimate"; sort: number };
export type WallBadge = Badge & { earnedAt: string | null; pasted: boolean };

const RARE_CHANCE = 0.2;
const between = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

export async function wall(userId: string): Promise<WallBadge[]> {
  const admin = createAdminClient();
  const [{ data: badges }, { data: mine }] = await Promise.all([
    admin.from("programme_badges").select("*").order("sort"),
    admin.from("programme_student_badges").select("badge_id, earned_at, pasted").eq("user_id", userId),
  ]);
  const got = new Map((mine ?? []).map((m) => [m.badge_id as string, m]));
  return (badges ?? []).map((b) => ({
    id: b.id, family: b.family, title: b.title, how: b.how, backMessage: b.back_message, rarity: b.rarity, sort: b.sort,
    earnedAt: got.get(b.id)?.earned_at ?? null, pasted: !!got.get(b.id)?.pasted,
  }));
}

async function give(userId: string, badgeId: string, source: string) {
  const { error } = await createAdminClient().from("programme_student_badges").insert({ user_id: userId, badge_id: badgeId, source });
  return !error;
}

/** Called after a student hands in a day on time, with their on-time streak including today. Returns the badge won, if any. */
export async function awardForStreak(userId: string, streak: number): Promise<Badge | null> {
  const admin = createAdminClient();
  const { data: st } = await admin.from("programme_reward_state").select("*").eq("user_id", userId).maybeSingle();
  let nextAt = st?.next_at ?? 3;
  // a broken streak starts the schedule again
  if (st && streak < st.last_streak) nextAt = 3;
  let won: Badge | null = null;
  if (streak >= nextAt) {
    const all = await wall(userId);
    const free = all.filter((b) => b.family === "spine" && !b.earnedAt);
    const first = free.find((b) => b.id === "first");
    let pick = first;
    if (!pick && free.length) {
      const rare = free.filter((b) => b.rarity === "rare"), common = free.filter((b) => b.rarity !== "rare");
      const pool = rare.length && (Math.random() < RARE_CHANCE || !common.length) ? rare : common.length ? common : rare;
      pick = pool[between(0, pool.length - 1)];
    }
    if (pick && (await give(userId, pick.id, `streak ${streak}`))) won = pick;
    nextAt = streak + between(3, 7);
    await checkUltimate(userId);
  }
  await admin.from("programme_reward_state").upsert({ user_id: userId, next_at: nextAt, last_streak: streak, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return won;
}

/** 进步徽章: the newest exam's average is above the baseline's (for the subjects both have). */
export async function awardForImprovement(userId: string, baseline: Record<string, number | null>, latest: Record<string, number | null>) {
  const both = Object.keys(latest).filter((s) => baseline[s] != null && latest[s] != null);
  if (!both.length) return null;
  const diff = both.reduce((n, s) => n + (latest[s]! - baseline[s]!), 0) / both.length;
  if (diff <= 0) return null;
  const ok = await give(userId, "improve", `average +${Math.round(diff * 10) / 10}`);
  if (ok) await checkUltimate(userId);
  return ok ? "improve" : null;
}

async function checkUltimate(userId: string) {
  const all = await wall(userId);
  const others = all.filter((b) => b.rarity !== "ultimate");
  if (others.length && others.every((b) => b.earnedAt)) await give(userId, "zixue", "all badges");
}

export async function setPasted(userId: string, badgeId: string, pasted: boolean) {
  await createAdminClient().from("programme_student_badges").update({ pasted }).eq("user_id", userId).eq("badge_id", badgeId);
}
