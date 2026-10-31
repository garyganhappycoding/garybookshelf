import QuestionForm from "@/components/QuestionForm";
import LoginWall from "@/components/LoginWall";
import { getCurrentUser } from "@/lib/supabase/server";
import ReplyCard from "@/components/ReplyCard";

export const metadata = { title: "Ask Gary a question · Gary's Bookshelf" };

export default async function QuestionPage() {
  const user = await getCurrentUser();
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Ask Gary a question</h1>
      <p className="text-ink/70 mb-6">
        Tell me what you're struggling with. It takes about 3 minutes, and my reply will be waiting for you here on the website. The more detail you give, the more useful my
        answer will be.
      </p>
      <p className="mb-6"><ReplyCard compact /></p>
      {user ? <QuestionForm /> : <LoginWall next="/question" what="ask Gary a question" />}
    </div>
  );
}
