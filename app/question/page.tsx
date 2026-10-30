import QuestionForm from "@/components/QuestionForm";
import ReplyCard from "@/components/ReplyCard";

export const metadata = { title: "Ask Gary a question · Gary's Bookshelf" };

export default function QuestionPage() {
  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="font-hand text-4xl text-clay-700 mb-1">Ask Gary a question</h1>
      <p className="text-ink/70 mb-6">
        Tell me what you're struggling with. No account needed, and it takes about 3 minutes. The more detail you give, the more useful my
        answer will be.
      </p>
      <p className="mb-6"><ReplyCard compact /></p>
      <QuestionForm />
    </div>
  );
}
