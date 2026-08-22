"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ResourceType = "content_hub" | "free_resource";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in.");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") throw new Error("Not authorized.");
  return supabase;
}

async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
    });
    const html = await res.text();
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function resolveCategory(formData: FormData) {
  let category = (formData.get("category") as string)?.trim();
  const newCategory = (formData.get("new_category") as string)?.trim();
  if (category === "__new__" && newCategory) {
    category = newCategory;
  }
  if (!category || category === "__new__") {
    category = "Uncategorized";
  }
  return category;
}

export async function getResourceCategories(type: ResourceType) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resources").select("category").eq("type", type);
  if (error) {
    console.error("getResourceCategories error:", error);
    return [];
  }
  const unique = Array.from(new Set((data ?? []).map((row) => row.category).filter(Boolean)));
  return unique.sort((a, b) => a.localeCompare(b));
}

export async function getResourceCategorySummaries(type: ResourceType) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resources").select("category").eq("type", type);
  if (error) {
    console.error("getResourceCategorySummaries error:", error);
    return [];
  }
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (!row.category) continue;
    counts.set(row.category, (counts.get(row.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

export async function getResourcesByCategory(type: ResourceType, category: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .eq("type", type)
    .eq("category", category)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getResourcesByCategory error:", error);
    return [];
  }
  return data ?? [];
}

export async function getResource(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("resources").select("*").eq("id", id).single();
  if (error) {
    console.error("getResource error:", error);
    return null;
  }
  return data;
}

export async function createResource(formData: FormData) {
  const supabase = await requireAdmin();

  const type = formData.get("type") as ResourceType;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const url = formData.get("url") as string;
  const category = resolveCategory(formData);

  let thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;
  if (!thumbnailUrl) {
    thumbnailUrl = await fetchOgImage(url);
  }

  const { error } = await supabase.from("resources").insert({
    type,
    title,
    description,
    url,
    thumbnail_url: thumbnailUrl,
    category,
  });

  if (error) {
    console.error("createResource error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/resources");
  revalidatePath(type === "content_hub" ? "/content-hub" : "/free-resources");
  return { success: true };
}

export async function updateResource(resourceId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const type = formData.get("type") as ResourceType;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const url = formData.get("url") as string;
  const category = resolveCategory(formData);

  let thumbnailUrl = (formData.get("thumbnail_url") as string)?.trim() || null;
  if (!thumbnailUrl) {
    thumbnailUrl = await fetchOgImage(url);
  }

  const { error } = await supabase
    .from("resources")
    .update({
      type,
      title,
      description,
      url,
      thumbnail_url: thumbnailUrl,
      category,
    })
    .eq("id", resourceId);

  if (error) {
    console.error("updateResource error:", error);
    return { error: error.message };
  }

  revalidatePath("/admin/resources");
  revalidatePath("/content-hub");
  revalidatePath("/free-resources");
  return { success: true };
}