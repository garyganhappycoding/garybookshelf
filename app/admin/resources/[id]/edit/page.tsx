import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import EditResourceForm from "@/components/EditResourceForm";

export default async function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  const { data: resource } = await supabase.from("resources").select("*").eq("id", id).single();
  if (!resource) return notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Edit resource</h1>
      <EditResourceForm resource={resource} />
    </div>
  );
}