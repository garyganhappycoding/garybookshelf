import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import NewResourceForm from "@/components/NewResourceForm";
import DeleteResourceButton from "@/components/DeleteResourceButton";

export default async function AdminResourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  const contentHub = resources?.filter((r) => r.type === "content_hub") || [];
  const freeResources = resources?.filter((r) => r.type === "free_resource") || [];

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Content hub & Free resources</h1>

      <NewResourceForm />

      <div className="mt-10">
        <h2 className="font-medium mb-3">Content hub</h2>
        <div className="space-y-3 mb-8">
          {contentHub.map((r) => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-ink/60">
                  {r.category}
                  {r.description ? ` · ${r.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/resources/${r.id}/edit`} className="text-sm text-clay-600 font-medium">
                  Edit
                </Link>
                <DeleteResourceButton resourceId={r.id} />
              </div>
            </div>
          ))}
        </div>

        <h2 className="font-medium mb-3">Free resources</h2>
        <div className="space-y-3">
          {freeResources.map((r) => (
            <div key={r.id} className="card flex items-center justify-between">
              <div>
                <p className="font-medium">{r.title}</p>
                <p className="text-sm text-ink/60">
                  {r.category}
                  {r.description ? ` · ${r.description}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/admin/resources/${r.id}/edit`} className="text-sm text-clay-600 font-medium">
                  Edit
                </Link>
                <DeleteResourceButton resourceId={r.id} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}