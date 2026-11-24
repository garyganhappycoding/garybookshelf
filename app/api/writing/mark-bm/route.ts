import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { writingAccess } from "@/lib/writing/config";
import { BM_SCHEMA, buildBmMessages, countWordsBm, finish, type BmPart } from "@/lib/writing/mark-bm";

export const runtime = "nodejs";
export const maxDuration = 60;

const URL = "https://api.groq.com/openai/v1/chat/completions";
const MODELS = [process.env.GROQ_MODEL || "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

// Malay essay marking is a private preview: admin and beta testers only, until Gary has reviewed it.
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return err("请先登录。", 401);
  const access = await writingAccess(supabase, user);
  if (!access.canTest) return err("马来文批改还没开放。", 403);

  let body: { part?: string; question?: string; essay?: string };
  try { body = await req.json(); } catch { return err("资料不对。", 400); }
  const part: BmPart | null = body.part === "A" || body.part === "B" ? body.part : null;
  const question = String(body.question ?? "").trim().slice(0, 1500);
  const essay = String(body.essay ?? "").trim();
  if (!part || question.length < 5) return err("请写上题目。", 400);
  const words = countWordsBm(essay);
  if (words < 30) return err("作文太短了，至少写 30 个字。", 400);
  if (essay.length > 8000) return err("作文太长了。", 400);

  const admin = createAdminClient();
  const since = new Date(Date.now() - 86400000).toISOString();
  const { count } = await admin.from("writing_bm_attempts").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
  if ((count ?? 0) >= 40) return err("今天已经批改很多篇了，明天再来。", 429);

  const key = process.env.GROQ_API_KEY;
  if (!key) return err("批改服务没有设置好。", 503);
  let raw: any = null, model = "";
  for (const m of MODELS) {
    try {
      const res = await fetch(URL, {
        method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: m, temperature: 0.2, reasoning_effort: "medium", messages: buildBmMessages(part, question, essay),
          response_format: { type: "json_schema", json_schema: { name: "bm_marking", schema: BM_SCHEMA, strict: true } },
        }),
        signal: AbortSignal.timeout(50000),
      });
      if (!res.ok) continue;
      const r = JSON.parse((await res.json()).choices[0].message.content);
      if (r && Array.isArray(r.areas) && r.areas.length >= 4 && String(r.summary ?? "").length > 10) { raw = r; model = m; break; }
    } catch { /* try the next model */ }
  }
  if (!raw) return err("AI 现在忙，请稍后再试。", 503);

  const result = finish(part, essay, raw);
  await admin.from("writing_bm_attempts").insert({ user_id: user.id, part, question, essay, word_count: words, result, estimated_mark: result.mark, model });
  return NextResponse.json({ result });
}
