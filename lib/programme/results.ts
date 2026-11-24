// SERVER-ONLY. The students' own results: one set before they start (baseline) and one after every exam period, so Gary can see whether
// they improve. A set holds a mark per subject, an optional photo of the result slip and optional photos of the whole paper
// (Gary may help the student analyse their weaknesses from the paper). Files go into the private "receipts" bucket.
import { createAdminClient } from "@/lib/supabase/admin";
import type { Exam } from "./calendar";

export const SUBJECTS = ["Bahasa Melayu", "English", "Mathematics", "Additional Mathematics", "Sejarah", "Biology", "Physics", "Chemistry", "华文"] as const;
const MAX_FILE = 10 * 1024 * 1024, MAX_PAPERS = 8;

/** Optional parts a student may fill in if they know them (otherwise only the total). */
export const PARTS: Record<string, string[]> = {
  "Bahasa Melayu": ["Penulisan (Kertas 1)", "Pemahaman (Kertas 2)", "Speaking / Lisan", "Listening / Mendengar"],
  English: ["Reading", "Writing", "Listening", "Speaking"],
  Mathematics: ["Paper 1", "Paper 2"], "Additional Mathematics": ["Paper 1", "Paper 2"], Sejarah: ["Paper 1", "Paper 2"],
  Biology: ["Paper 1", "Paper 2", "Paper 3"], Physics: ["Paper 1", "Paper 2", "Paper 3"], Chemistry: ["Paper 1", "Paper 2", "Paper 3"],
};

export type ResultSet = {
  id: string; kind: "baseline" | "exam"; examId: string | null; label: string; slipPath: string | null; paperPaths: string[]; createdAt: string;
  marks: Record<string, number | null>; parts: Record<string, Record<string, number>>;
};

export async function mySets(userId: string): Promise<ResultSet[]> {
  const admin = createAdminClient();
  const [{ data: sets }, { data: rows }] = await Promise.all([
    admin.from("programme_result_sets").select("*").eq("user_id", userId).order("created_at"),
    admin.from("programme_results").select("set_id, subject, mark, parts").eq("user_id", userId),
  ]);
  return (sets ?? []).map((s) => ({
    id: s.id, kind: s.kind, examId: s.exam_id, label: s.label, slipPath: s.slip_path, paperPaths: Array.isArray(s.paper_paths) ? s.paper_paths : [], createdAt: s.created_at,
    marks: Object.fromEntries((rows ?? []).filter((r) => r.set_id === s.id).map((r) => [r.subject, r.mark === null ? null : Number(r.mark)])),
    parts: Object.fromEntries((rows ?? []).filter((r) => r.set_id === s.id && r.parts && Object.keys(r.parts).length).map((r) => [r.subject, r.parts as Record<string, number>])),
  }));
}

export async function hasBaseline(userId: string) {
  const { count } = await createAdminClient().from("programme_result_sets").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("kind", "baseline");
  return (count ?? 0) > 0;
}

/** The first exam of the student that is over but has no result set yet (the page asks for it after the exams). */
export async function pendingExam(userId: string, exams: Exam[], today: string): Promise<Exam | null> {
  const over = exams.filter((e) => e.end && e.end < today);
  if (!over.length) return null;
  const { data } = await createAdminClient().from("programme_result_sets").select("exam_id").eq("user_id", userId).eq("kind", "exam");
  const done = new Set((data ?? []).map((r) => r.exam_id));
  return over.find((e) => !done.has(e.id)) ?? null;
}

const clean = (s: string, n: number) => s.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, n);
const okFile = (f: File) => f.type.startsWith("image/") || f.type === "application/pdf";
const ext = (f: File) => (f.type === "application/pdf" ? "pdf" : f.type.split("/")[1] || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";

export async function saveResults(userId: string, kind: "baseline" | "exam", examId: string | null, label: string, form: FormData): Promise<{ error?: string }> {
  const admin = createAdminClient();
  const marks: Record<string, number> = {};
  const parts: Record<string, Record<string, number>> = {};
  for (const [k, v] of form.entries()) {
    if (k.startsWith("p:")) {
      const [, subj, part] = k.split(":"); const n = Number(String(v).trim().replace("%", ""));
      if (subj && part && String(v).trim() !== "" && Number.isFinite(n) && n >= 0 && n <= 1000) (parts[clean(subj, 40)] ??= {})[clean(part, 40)] = Math.round(n * 10) / 10;
      continue;
    }
    if (!k.startsWith("m:")) continue;
    const subject = clean(k.slice(2), 40), raw = String(v).trim().replace("%", "");
    if (!subject || raw === "") continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 100) return { error: `「${subject}」的分数要在 0 到 100 之间。` };
    marks[subject] = Math.round(n * 10) / 10;
  }
  const slip = form.get("slip") instanceof File && (form.get("slip") as File).size > 0 ? (form.get("slip") as File) : null;
  const papers = form.getAll("papers").filter((f): f is File => f instanceof File && f.size > 0).slice(0, MAX_PAPERS);
  for (const f of [slip, ...papers]) {
    if (!f) continue;
    if (!okFile(f)) return { error: "成绩单和试卷请上传 PDF（最好）或图片。" };
    if (f.size > MAX_FILE) return { error: "有一个文件太大，请每个小于 10MB。" };
  }
  if (!Object.keys(marks).length && !slip) return { error: "请至少写下一科的分数，或者上传成绩单。" };

  const { data: existing } = await admin.from("programme_result_sets").select("id, slip_path, paper_paths").eq("user_id", userId).eq("kind", kind).eq("exam_id", examId ?? "").maybeSingle();
  let setId = existing?.id as string | undefined;
  if (!setId) {
    const { data: created, error } = await admin.from("programme_result_sets").insert({ user_id: userId, kind, exam_id: examId ?? "", label }).select("id").single();
    if (error || !created) return { error: "保存失败，请再试一次。" };
    setId = created.id;
  }
  const dir = `programme-results/${userId}/${setId}`;
  let slipPath = existing?.slip_path ?? null, paperPaths: string[] = Array.isArray(existing?.paper_paths) ? existing!.paper_paths : [];
  if (slip) {
    const p = `${dir}/slip-${Date.now()}.${ext(slip)}`;
    const { error } = await admin.storage.from("receipts").upload(p, slip, { contentType: slip.type });
    if (error) return { error: "成绩单上传失败，请再试一次。" };
    if (slipPath) await admin.storage.from("receipts").remove([slipPath]);
    slipPath = p;
  }
  for (const [i, f] of papers.entries()) {
    const p = `${dir}/paper-${Date.now()}-${i}.${ext(f)}`;
    const { error } = await admin.storage.from("receipts").upload(p, f, { contentType: f.type });
    if (error) return { error: "试卷上传失败，请再试一次。" };
    paperPaths = [...paperPaths, p].slice(-12);
  }
  await admin.from("programme_result_sets").update({ slip_path: slipPath, paper_paths: paperPaths, updated_at: new Date().toISOString() }).eq("id", setId);
  for (const [subject, mark] of Object.entries(marks)) {
    await admin.from("programme_results").upsert({ set_id: setId, user_id: userId, subject, mark, parts: parts[subject] ?? {} }, { onConflict: "set_id,subject" });
  }
  return {};
}

/** For Gary: short-lived links to a student's slip and paper photos. */
export async function signedUrls(paths: string[]) {
  const admin = createAdminClient();
  const out: string[] = [];
  for (const p of paths) {
    const { data } = await admin.storage.from("receipts").createSignedUrl(p, 3600);
    if (data?.signedUrl) out.push(data.signedUrl);
  }
  return out;
}
