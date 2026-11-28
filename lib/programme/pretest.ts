// SERVER-ONLY. Before starting, every student gives one of their own essays in BM and one in BI: written on the page or sent as a file.
// This is the starting point the weekly and monthly essay tests are compared with (Gary, 25 Nov 2026).
import { createAdminClient } from "@/lib/supabase/admin";
import { scoreEssay } from "./essayscore";

const MAX_FILE = 10 * 1024 * 1024;
const words = (t: string) => t.split(/\s+/).filter(Boolean).length;
export type PretestLang = "BI" | "BM";

export async function myPretests(userId: string) {
  const { data } = await createAdminClient().from("programme_pretest").select("lang, body, file_path, created_at, skipped").eq("user_id", userId);
  return (data ?? []) as { lang: PretestLang; body: string; file_path: string | null; created_at: string; skipped: boolean }[];
}

/** True once each of BI and BM has an essay in, or the student chose to skip it for now (Gary, 28 Nov 2026: no essay yet means fill it in later). */
export async function hasPretest(userId: string) {
  const rows = await myPretests(userId);
  const ok = (lang: PretestLang) => rows.some((p) => p.lang === lang && (words(p.body) >= 30 || p.skipped));
  return ok("BI") && ok("BM");
}

/** The starting essays the student skipped and has not filled in yet (the home page reminds them). */
export async function missingPretests(userId: string): Promise<PretestLang[]> {
  const rows = await myPretests(userId);
  return (["BI", "BM"] as const).filter((lang) => !rows.some((p) => p.lang === lang && words(p.body) >= 30));
}

/** Scores the typed starting essays that have no score yet. An uploaded file cannot be marked by the AI: Gary reads those himself. */
export async function scorePending(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("programme_pretest").select("id, lang, body, score").eq("user_id", userId);
  for (const p of data ?? []) {
    if (p.score != null || p.body.split(/\s+/).filter(Boolean).length < 30) continue;
    const s = await scoreEssay(p.lang as PretestLang, "The student's own essay on a topic of their choice (this is the starting-point essay).", p.body);
    if (s) await admin.from("programme_pretest").update({ score: s.score, label: s.label, result: s.result }).eq("id", p.id);
  }
}

export async function savePretest(userId: string, form: FormData): Promise<{ error?: string }> {
  const admin = createAdminClient();
  for (const lang of ["BI", "BM"] as const) {
    const body = String(form.get(`text-${lang}`) ?? "").trim().slice(0, 12000);
    const f = form.get(`file-${lang}`);
    const file = f instanceof File && f.size > 0 ? f : null;
    const { data: old } = await admin.from("programme_pretest").select("body, file_path").eq("user_id", userId).eq("lang", lang).maybeSingle();
    // typing is required (the AI marks typed text only); a file is an optional extra for Gary
    const have = body || old?.body || "";
    // "I do not have one yet": skipped for now, the student can add it later
    if (words(have) < 30 && form.get(`skip-${lang}`) === "on" && !file) {
      const { error } = await admin.from("programme_pretest").upsert({ user_id: userId, lang, body: old?.body ?? "", file_path: old?.file_path ?? null, skipped: true }, { onConflict: "user_id,lang" });
      if (error) return { error: "保存失败，请再试一次。" };
      continue;
    }
    if (words(have) < 30) return { error: lang === "BI" ? "请把英文作文打字写下来或贴上来，至少 30 个字；如果现在没有，请勾「以后再补」。" : "请把马来文作文打字写下来或贴上来，至少 30 个字；如果现在没有，请勾「以后再补」。" };
    let path = old?.file_path ?? null;
    if (file) {
      if (!(file.type.startsWith("image/") || file.type === "application/pdf")) return { error: "作文文件请上传 PDF（最好）或图片。" };
      if (file.size > MAX_FILE) return { error: "文件太大，请小于 10MB。" };
      const ext = file.type === "application/pdf" ? "pdf" : (file.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5);
      const p = `programme-pretest/${userId}/${lang}-${Date.now()}.${ext}`;
      const { error } = await admin.storage.from("receipts").upload(p, file, { contentType: file.type });
      if (error) return { error: "上传失败，请再试一次。" };
      if (path) await admin.storage.from("receipts").remove([path]);
      path = p;
    }
    const { error } = await admin.from("programme_pretest").upsert({ user_id: userId, lang, body: body || old?.body || "", file_path: path, skipped: false }, { onConflict: "user_id,lang" });
    if (error) return { error: "保存失败，请再试一次。" };
  }
  return {};
}
