"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// only allow a path on this site (for example "/question"), never another website
const safeNext = (v: FormDataEntryValue | null, fallback: string) => {
  const n = String(v ?? "");
  return n.startsWith("/") && !n.startsWith("//") && !n.includes("\\") ? n : fallback;
};

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect(safeNext(formData.get("next"), "/dashboard"));
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect(safeNext(formData.get("next"), "/start")); // new members see where everything is first
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
