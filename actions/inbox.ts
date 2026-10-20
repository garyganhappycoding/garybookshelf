"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean, sendEmail } from "@/lib/community";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not logged in.");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") throw new Error("Not authorized.");
}

const refresh = () => {
  revalidatePath("/admin/inbox");
  revalidatePath("/100");
  revalidatePath("/hi");
};

export async function markRead(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 40);
  await createAdminClient().from("submissions").update({ status: "read", reviewed_at: new Date().toISOString() }).eq("id", id).eq("status", "new");
  refresh();
}

export async function replyTo(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 40);
  const reply = clean(formData.get("reply"), 3000);
  const url = clean(formData.get("reply_url"), 400);
  if (!reply) return;
  await createAdminClient()
    .from("submissions")
    .update({ status: "answered", reply, reply_url: url || null, replied_at: new Date().toISOString(), reviewed_at: new Date().toISOString() })
    .eq("id", id);
  refresh();
}

export async function rejectSubmission(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 40);
  await createAdminClient()
    .from("submissions")
    .update({ status: "rejected", counts_for_goal: false, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("kind", "feedback");
  refresh();
}

// Approve a "tell me your result" feedback: it now counts toward The Bookshelf 100. If Gary ticks the box and the
// student's email matches an account, they get 1 bonus Speaking attempt and an email. Nothing is announced beforehand.
export async function approveSubmission(formData: FormData) {
  await requireAdmin();
  const id = clean(formData.get("id"), 40);
  const grant = formData.get("grant") === "on";
  const admin = createAdminClient();

  const { data: s } = await admin.from("submissions").select("id,kind,account_email,reward_granted").eq("id", id).maybeSingle();
  if (!s || s.kind !== "feedback") return;

  let rewardNote: string | null = null;
  let granted = s.reward_granted;
  if (grant && !s.reward_granted) {
    const email = (s.account_email ?? "").trim();
    if (!email) {
      rewardNote = "No email was given, so no attempt was added.";
    } else {
      const { data: profile } = await admin.from("profiles").select("id,email").in("email", [email, email.toLowerCase()]).limit(1).maybeSingle();
      if (!profile) {
        rewardNote = `No account uses ${email}, so no attempt was added.`;
      } else {
        // at most 3 thank-you attempts per student in 30 days, so the reward can't be farmed
        const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
        const { count } = await admin
          .from("speaking_packs")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.id)
          .eq("kind", "bonus")
          .gte("created_at", since);
        if ((count ?? 0) >= 3) {
          rewardNote = "This student already got 3 thank-you attempts this month, so none was added.";
        } else {
          const { error } = await admin.from("speaking_packs").insert({
            user_id: profile.id,
            kind: "bonus",
            attempts_total: 1,
            expires_at: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
          });
          if (error) {
            rewardNote = "Could not add the attempt. Please add it by hand.";
          } else {
            granted = true;
            const site = process.env.NEXT_PUBLIC_SITE_URL || "";
            const sent = await sendEmail(
              profile.email ?? email,
              "Thank you! You have a free Speaking attempt",
              `<h2 style="color:#3B2F26;margin:0 0 12px">Thank you for sharing 🎉</h2>
               <p style="color:#3B2F26;line-height:1.6">I read what you sent me, and it means a lot. As a thank-you, I've added <b>1 free Speaking attempt</b> to your account. It lasts 30 days.</p>
               <p><a href="${site}/speaking" style="display:inline-block;background:#B85C38;color:white;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:500">Use it now</a></p>`
            );
            // the attempt is added either way; say clearly if the email could not be delivered
            rewardNote = sent.ok ? "1 bonus attempt added and email sent." : `1 bonus attempt added, but the email was NOT delivered (${sent.error}). Tell the student yourself.`;
          }
        }
      }
    }
  }

  await admin
    .from("submissions")
    .update({ status: "approved", counts_for_goal: true, reviewed_at: new Date().toISOString(), reward_granted: granted, reward_note: rewardNote })
    .eq("id", id);
  refresh();
}

// ---------- polls and project updates ----------
export async function createPoll(formData: FormData) {
  await requireAdmin();
  const title = clean(formData.get("title"), 200);
  const options = String(formData.get("options") ?? "")
    .split("\n")
    .map((l) => clean(l, 120))
    .filter(Boolean)
    .slice(0, 12);
  if (!title || options.length < 2) return;
  const admin = createAdminClient();
  await admin.from("polls").update({ is_open: false }).eq("is_open", true); // only one vote is open at a time
  const { data: poll } = await admin.from("polls").insert({ title }).select("id").single();
  if (poll) await admin.from("poll_options").insert(options.map((label, position) => ({ poll_id: poll.id, label, position })));
  revalidatePath("/vote");
  revalidatePath("/admin/project");
}

export async function closePoll(formData: FormData) {
  await requireAdmin();
  await createAdminClient().from("polls").update({ is_open: false }).eq("id", clean(formData.get("id"), 40));
  revalidatePath("/vote");
  revalidatePath("/admin/project");
}

export async function addUpdate(formData: FormData) {
  await requireAdmin();
  const title = clean(formData.get("title"), 160);
  const body = clean(formData.get("body"), 3000);
  if (!title || !body) return;
  await createAdminClient().from("project_updates").insert({ title, body });
  revalidatePath("/100");
  revalidatePath("/admin/project");
}

export async function deleteUpdate(formData: FormData) {
  await requireAdmin();
  await createAdminClient().from("project_updates").delete().eq("id", clean(formData.get("id"), 40));
  revalidatePath("/100");
  revalidatePath("/admin/project");
}
