import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AskGaryChat from "@/components/AskGaryChat";
import { DAILY_LIMIT } from "@/lib/ask-gary/config";

export const metadata = { title: "Ask Gary preview · Gary's Bookshelf" };

// Admin-only preview of the real bot (the public page still says "coming soon").
export default async function AskGaryPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/ask-gary");

  const { data: left } = await supabase.rpc("ask_gary_questions_left", { p_limit: DAILY_LIMIT });
  return <AskGaryChat userId={user.id} initialLeft={typeof left === "number" ? left : DAILY_LIMIT} limit={DAILY_LIMIT} isAdmin />;
}
