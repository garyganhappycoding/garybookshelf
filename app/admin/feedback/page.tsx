import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: feedback } = await supabase
    .from("feedback")
    .select("id, message, created_at, profiles(email)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Feedback</h1>
      <div className="space-y-3">
        {feedback?.map((f: any) => (
          <div key={f.id} className="card">
            <p className="text-sm text-ink/60 mb-1">
              {f.profiles?.email} &middot; {new Date(f.created_at).toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap">{f.message}</p>
          </div>
        ))}
        {(!feedback || feedback.length === 0) && <p className="text-ink/50">No feedback yet.</p>}
      </div>
    </div>
  );
}
