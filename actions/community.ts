"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean, isEmail, MAX_PROOF_BYTES, notifyGary, spamCheck, tooManySubmissions, visitorHash } from "@/lib/community";

export type SubmitResult = { error?: string; token?: string };

// If the student happens to be logged in, remember who they are (useful for replies). Nobody has to log in.
async function maybeUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user ? { id: user.id, email: user.email ?? null } : null;
  } catch {
    return null;
  }
}

// ---------- questions ("投稿") ----------
export async function submitQuestion(formData: FormData): Promise<SubmitResult> {
  const bad = spamCheck(formData);
  if (bad) return { error: bad };
  const hash = await visitorHash();
  if (await tooManySubmissions(hash)) return { error: "You've already sent a few. Please try again tomorrow." };

  const ageForm = clean(formData.get("age_form"), 120);
  const problem = clean(formData.get("problem"), 1500);
  const scenario = clean(formData.get("scenario"), 2500);
  const tried = clean(formData.get("tried"), 1500);
  const wish = clean(formData.get("wish"), 1500);
  const name = clean(formData.get("name"), 60);
  const contact = clean(formData.get("contact"), 120);
  // two ways to ask: "free" (type whatever you want) or "guided" (the five questions, for a clearer picture)
  const mode = clean(formData.get("mode"), 10) === "free" ? "free" : "guided";
  const freeText = clean(formData.get("free_text"), 4000);
  if (mode === "free") {
    if (freeText.length < 10) return { error: "Please write a little more, at least a sentence." };
  } else {
    if (!ageForm) return { error: "Please tell me your age and form or exam." };
    if (problem.length < 10) return { error: "Please tell me a little more about the problem." };
    if (scenario.length < 10) return { error: "Please describe what happens when you face the problem." };
    if (!tried) return { error: "Please tell me what you have tried so far, even if it's nothing." };
    if (!wish) return { error: "Please tell me what kind of help you wish to get." };
  }
  const publishOk = formData.get("publish_ok") === "on";

  const user = await maybeUser();
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("submissions")
    .insert({
      kind: "question",
      user_id: user?.id ?? null,
      display_name: name || null,
      contact: contact || null,
      account_email: user?.email ?? null,
      body: mode === "free" ? freeText : problem,
      payload:
        mode === "free"
          ? { mode: "free", age_form: ageForm || null, publish_ok: publishOk }
          : { mode: "guided", age_form: ageForm, scenario, tried, wish, publish_ok: publishOk },
      ip_hash: hash,
    })
    .select("public_token")
    .single();
  if (error || !data) return { error: "Sorry, that didn't go through. Please try again." };

  after(() =>
    notifyGary("💬 New question in your inbox", `${ageForm ? ageForm + "\n" : ""}${(mode === "free" ? freeText : problem).slice(0, 300)}`, "/admin/inbox?tab=question")
  );
  return { token: data.public_token };
}

// ---------- "tell me your result" feedback ----------
export async function submitResult(formData: FormData): Promise<SubmitResult> {
  const bad = spamCheck(formData);
  if (bad) return { error: bad };
  const hash = await visitorHash();
  if (await tooManySubmissions(hash)) return { error: "You've already sent a few. Please try again tomorrow." };

  const criterion = clean(formData.get("criterion"), 10);
  if (criterion !== "grade" && criterion !== "study") return { error: "Please choose what changed for you." };
  const ageForm = clean(formData.get("age_form"), 120);
  const name = clean(formData.get("name"), 60);
  const handle = clean(formData.get("handle"), 60);
  const accountEmail = clean(formData.get("account_email"), 120).toLowerCase();
  const videoLink = clean(formData.get("video_link"), 300);
  const consent = clean(formData.get("consent_story"), 10);
  const consentStory = consent === "tag" || consent === "no_tag" ? consent : "no";
  const under18 = formData.get("under18") === "on";
  const parentOk = formData.get("parent_ok") === "on";

  if (!ageForm) return { error: "Please tell me your age and form or exam." };
  if (under18 && !parentOk) return { error: "Please ask a parent or guardian, then tick the box to say they agree." };
  if (accountEmail && !isEmail(accountEmail)) return { error: "That email doesn't look right. You can also leave it empty." };
  if (consentStory === "tag" && !handle) return { error: "To tag you, please add your Instagram handle." };

  const payload: Record<string, unknown> = { criterion, age_form: ageForm, video_link: videoLink || null, under18, show_name: formData.get("show_name") === "on" };
  let body = "";
  if (criterion === "grade") {
    const subject = clean(formData.get("subject"), 80);
    const exam = clean(formData.get("exam"), 80);
    const before = clean(formData.get("before"), 30);
    const after = clean(formData.get("after"), 30);
    if (!subject || !before || !after) return { error: "Please fill in the subject, your result before and your result now." };
    Object.assign(payload, { subject, exam, before, after });
    body = clean(formData.get("story"), 2000);
  } else {
    const story = clean(formData.get("story"), 2000);
    if (story.length < 20) return { error: "Please share a little more about how you study now." };
    Object.assign(payload, { technique: clean(formData.get("technique"), 400) });
    body = story;
  }

  // the result paper is optional; it stays private and only Gary can open it
  let proofPath: string | null = null;
  const proof = formData.get("proof");
  const admin = createAdminClient();
  if (proof instanceof File && proof.size > 0) {
    if (proof.size > MAX_PROOF_BYTES) return { error: "That file is too big. Please keep it under 5 MB." };
    if (!(proof.type.startsWith("image/") || proof.type === "application/pdf")) return { error: "The result paper must be a photo or a PDF." };
    const ext = (proof.name.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 5) || "jpg";
    proofPath = `${randomUUID()}.${ext}`;
    const { error: upErr } = await admin.storage.from("result-slips").upload(proofPath, proof, { contentType: proof.type });
    if (upErr) return { error: "We couldn't upload the file. Please try a smaller photo, or send without it." };
  }

  const user = await maybeUser();
  const { data, error } = await admin
    .from("submissions")
    .insert({
      kind: "feedback",
      user_id: user?.id ?? null,
      display_name: name || null,
      contact: handle || null,
      account_email: accountEmail || user?.email || null,
      body,
      payload,
      proof_path: proofPath,
      consent_story: consentStory,
      parent_ok: parentOk,
      ip_hash: hash,
    })
    .select("public_token")
    .single();
  if (error || !data) return { error: "Sorry, that didn't go through. Please try again." };

  const what = criterion === "grade" ? `Grades improved: ${payload.subject ?? ""} ${payload.before} to ${payload.after}` : "Started studying on their own";
  after(() => notifyGary("📈 New result for The Bookshelf 100 (waiting for your approval)", `${what} · ${ageForm}`, "/admin/inbox?tab=feedback"));
  return { token: data.public_token };
}

// ---------- one tap on the Speaking result ----------
export async function recordReaction(attemptId: string, rating: 1 | -1, note?: string): Promise<{ ok: boolean }> {
  const user = await maybeUser();
  if (!user || !/^[0-9a-f-]{36}$/i.test(attemptId)) return { ok: false };
  const admin = createAdminClient();

  // the attempt must be this student's own
  const { data: attempt } = await admin.from("speaking_attempts").select("id").eq("id", attemptId).eq("user_id", user.id).maybeSingle();
  if (!attempt) return { ok: false };

  // one reaction per attempt; a second tap changes it and can add a note
  const { data: existing } = await admin
    .from("submissions")
    .select("id,payload")
    .eq("kind", "reaction")
    .eq("user_id", user.id)
    .filter("payload->>attemptId", "eq", attemptId)
    .maybeSingle();
  const payload = { attemptId, rating, note: clean(note, 300) || (existing?.payload as any)?.note || null };
  if (existing) await admin.from("submissions").update({ payload, body: payload.note }).eq("id", existing.id);
  else await admin.from("submissions").insert({ kind: "reaction", user_id: user.id, body: payload.note, payload });
  return { ok: true };
}

// ---------- vote on what comes next ----------
export async function castVote(pollId: string, optionId: string): Promise<{ error?: string; ok?: boolean }> {
  const admin = createAdminClient();
  const { data: option } = await admin
    .from("poll_options")
    .select("id,polls!inner(id,is_open)")
    .eq("id", optionId)
    .eq("poll_id", pollId)
    .maybeSingle();
  if (!option || !(option as any).polls?.is_open) return { error: "This vote has closed." };

  // one vote per browser and internet connection
  const jar = await cookies();
  let voter = jar.get("bk_voter")?.value;
  if (!voter) {
    voter = randomUUID();
    jar.set("bk_voter", voter, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 365, path: "/" });
  }
  const hash = await visitorHash(voter);
  const { error } = await admin.from("poll_votes").insert({ poll_id: pollId, option_id: optionId, voter_hash: hash });
  if (error) return error.code === "23505" ? { error: "You've already voted. Thank you!" } : { error: "Sorry, your vote didn't go through." };
  return { ok: true };
}
