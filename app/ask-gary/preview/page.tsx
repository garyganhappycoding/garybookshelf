import { redirect } from "next/navigation";

// The bot now lives at /ask-gary for all members.
export default function AskGaryPreviewPage() {
  redirect("/ask-gary");
}
