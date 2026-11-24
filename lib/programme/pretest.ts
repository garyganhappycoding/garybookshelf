// SERVER-ONLY. Before starting, every student gives one of their own essays in BM and one in BI: written on the page or sent as a file.
// This is the starting point the weekly and monthly essay tests are compared with (Gary, 25 Nov 2026).
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_FILE = 10 * 1024 * 1024;
export type PretestLang = "BI" | "BM";

export async function myPretests(userId: string) {
  const { data } = await createAdminClient().from("programme_pretest").select("lang, body, file_path, created_at").eq("user_id", userId);
  return (data ?? []) as { lang: PretestLang; body: string; file_path: string | null; created_at: string }[];
}

/** True once both a BI and a BM essay are in. */
export async function hasPretest(userId: string) {
  const got = new Set((await myPretests(userId)).map((p) => p.lang));
  return got.has("BI") && got.has("BM");
}

const words = (t: string) => t.split(/\s+/).filter(Boolean).length;

export async function savePretest(userId: string, form: FormData): Promise<{ error?: string }> {
  const admin = createAdminClient();
  for (const lang of ["BI", "BM"] as const) {
    const body = String(form.get(`text-${lang}`) ?? "").trim().slice(0, 12000);
    const f = form.get(`file-${lang}`);
    const file = f instanceof File && f.size > 0 ? f : null;
    const { data: old } = await admin.from("programme_pretest").select("body, file_path").eq("user_id", userId).eq("lang", lang).maybeSingle();
    if (!body && !file && !old) return { error: lang === "BI" ? "请交一篇英文作文（写下来或上传都可以）。" : "请交一篇马来文作文（写下来或上传都可以）。" };
    if (body && words(body) < 30 && !file && !old?.file_path) return { error: lang === "BI" ? "英文作文太短了，至少写 30 个字，或者上传一份你写过的作文。" : "马来文作文太短了，至少写 30 个字，或者上传一份你写过的作文。" };
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
    const { error } = await admin.from("programme_pretest").upsert({ user_id: userId, lang, body: body || old?.body || "", file_path: path }, { onConflict: "user_id,lang" });
    if (error) return { error: "保存失败，请再试一次。" };
  }
  return {};
}
