import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AskGaryPreview from "@/components/AskGaryPreview";

export const metadata = { title: "Ask Gary preview · Gary's Bookshelf" };

// Admin-only design preview of the chat (replies are fake).
export default async function AskGaryPreviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/ask-gary");

  return (
    <div className="max-w-2xl mx-auto px-5 pt-8 pb-4">
      <h1 className="font-hand text-3xl text-clay-700 mb-3">Ask Gary</h1>
      <AskGaryPreview />
    </div>
  );
}
