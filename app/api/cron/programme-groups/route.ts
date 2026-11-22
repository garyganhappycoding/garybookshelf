import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendTelegramText } from "@/lib/telegram";
import { siteUrl } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daily. A 陪你读书 friend group that is still missing someone's receipt after 3 days: tell Gary once so he can decide
// (ask the group to top up, or switch them to the smaller group price). Nobody is opened or charged automatically.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: groups } = await admin.from("programme_groups").select("id, group_no, size").eq("status", "waiting").is("reminder_sent_at", null).lt("created_at", cutoff);
  let sent = 0;
  for (const g of groups ?? []) {
    const { count } = await admin.from("programme_members").select("id", { count: "exact", head: true }).eq("group_id", g.id).not("receipt_path", "is", null);
    await sendTelegramText(`⏳ 陪你读书 · 朋友组 ${g.group_no} 已经 3 天了，只有 ${count ?? 0}/${g.size} 人交了收据。要不要联系组长？\n${siteUrl()}/admin/programme-groups`);
    await admin.from("programme_groups").update({ reminder_sent_at: new Date().toISOString() }).eq("id", g.id);
    sent += 1;
  }
  return NextResponse.json({ ok: true, sent });
}
