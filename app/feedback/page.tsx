import Link from "next/link";
import ResultForm from "@/components/ResultForm";
import LoginWall from "@/components/LoginWall";
import { getCurrentUser } from "@/lib/supabase/server";

export const metadata = { title: "Tell Gary your result · Gary's Bookshelf" };

export default async function FeedbackPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Tell me your result</h1>
      <p className="text-ink/70 mb-3">
        This year Gary's Bookshelf has one goal: help <b>100 people learn how to learn</b>. You count toward it if one of these is true:
      </p>
      <ul className="list-disc pl-5 text-ink/80 mb-3 space-y-1 text-sm">
        <li>Your grades improved, about 10% or more in the same type of exam, after watching my videos.</li>
        <li>You started to study on your own because of my videos, and you actually did what I taught.</li>
      </ul>
      <p className="text-sm text-ink/60 mb-6">
        If either is true for you, fill this in. You need a free account so you can read my reply here later. Not there yet? Tell me what helped or what is missing with a quick <Link href="/question" className="text-clay-700 underline">question or message</Link> instead. See how it's going on <Link href="/100" className="text-clay-700 underline">The Bookshelf 100</Link>.
      </p>
      {user ? <ResultForm /> : <LoginWall next="/feedback" what="tell Gary your result" />}
    </div>
  );
}
