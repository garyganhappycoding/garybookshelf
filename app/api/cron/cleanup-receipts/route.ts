import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const KEEP_DAYS = 30;

// Runs daily from vercel.json. Deletes receipt screenshots for orders that were
// already approved/rejected more than 30 days ago. Pending orders are never touched.
// The order row stays (so sales history is kept); only the image file is removed.
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // fail closed: without a secret set, nobody can trigger this
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const cutoff = new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000).toISOString();

  // Transcripts saved for students whose marking failed are kept for 7 days (the page promises this), then removed.
  await admin
    .from("speaking_attempts")
    .update({ result: null })
    .eq("status", "failed")
    .not("result", "is", null)
    .lt("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

  const { data: orders, error } = await admin
    .from("orders")
    .select("receipt_path")
    .in("status", ["completed", "rejected"])
    .lt("created_at", cutoff)
    .limit(500);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const paths = (orders ?? []).map((o) => o.receipt_path).filter(Boolean) as string[];
  if (paths.length === 0) return NextResponse.json({ deleted: 0 });

  const { data: removed, error: removeErr } = await admin.storage.from("receipts").remove(paths);
  if (removeErr) return NextResponse.json({ error: removeErr.message }, { status: 500 });

  return NextResponse.json({ deleted: removed?.length ?? 0 });
}
