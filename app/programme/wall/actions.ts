"use server";
import { requireProgramme } from "@/lib/programme/gate";
import { createAdminClient } from "@/lib/supabase/admin";

export type WallItem =
  | { id: string; kind: "badge"; key: string; x: number; y: number; w: number; rot: number; z: number }
  | { id: string; kind: "note"; text: string; x: number; y: number; w: number; rot: number; z: number };
const BG = ["ink", "paper", "sage", "navy"], FRAME = ["none", "line", "gold", "wood", "dash"];

/** The student's wall: where each badge and note sits (as % of the wall), the wall colour and the wall's frame. */
export async function saveWallAction(layout: WallItem[], bg: string, frame: string): Promise<{ ok: boolean }> {
  const a = await requireProgramme();
  const num = (v: unknown, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number(v) || 0));
  const clean: WallItem[] = (Array.isArray(layout) ? layout : []).slice(0, 60).map((it) => {
    const base = { id: String(it.id).slice(0, 40), x: num(it.x, -20, 110), y: num(it.y, -20, 110), w: num(it.w, 4, 90), rot: num(it.rot, -360, 360), z: num(it.z, 0, 9999) };
    return it.kind === "note" ? { ...base, kind: "note" as const, text: String(it.text ?? "").slice(0, 200) } : { ...base, kind: "badge" as const, key: String((it as { key: string }).key).slice(0, 60) };
  });
  await createAdminClient().from("programme_walls").upsert(
    { user_id: a.userId, layout: clean, bg: BG.includes(bg) ? bg : "ink", frame: FRAME.includes(frame) ? frame : "none", updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  return { ok: true };
}
