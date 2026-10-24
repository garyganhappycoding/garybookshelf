import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

type CardInfo = {
  href: string;
  title: string;
  text: string;
  badge?: number; // how many things are waiting for you
  disabled?: boolean;
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  // How many things are waiting for you in each place. Speaking never counts: it is not something to approve.
  const admin = createAdminClient();
  const head = (table: string) => admin.from(table).select("id", { count: "exact", head: true });
  const [{ count: pendingOrders }, { count: newQuestions }, { count: pendingResults }, { count: unreadFeedback }] = await Promise.all([
    head("orders").eq("status", "pending_verification"),
    head("submissions").eq("kind", "question").eq("status", "new"),
    head("submissions").eq("kind", "feedback").in("status", ["new", "read"]),
    head("feedback").is("seen_at", null),
  ]);
  const orders = pendingOrders ?? 0;
  const questions = newQuestions ?? 0;
  const results = pendingResults ?? 0;
  const feedback = unreadFeedback ?? 0;

  const cards: CardInfo[] = [
    { href: "/admin/products", title: "Products", text: "Add and manage what's for sale" },
    { href: "/admin/orders", title: "Orders", text: orders ? `${orders} waiting to be approved` : "Approve or reject payments", badge: orders },
    { href: "/admin/students", title: "Students", text: "Find a student, see purchases and attempts, add attempts" },
    { href: "/admin/resources", title: "Content & Resources", text: "Manage content hub and free downloads" },
    { href: "/admin/feedback", title: "Feedback", text: feedback ? `${feedback} new, not opened yet` : "See what customers are saying", badge: feedback },
    { href: "/admin/speaking", title: "Speaking", text: "Usage, scores and why attempts fail" },
    {
      href: "/admin/inbox",
      title: "Inbox",
      text: questions + results ? `${questions} new question${questions === 1 ? "" : "s"} · ${results} result${results === 1 ? "" : "s"} to review` : "Questions and results from your Instagram link",
      badge: questions + results,
    },
    {
      href: "/admin/project",
      title: "The Bookshelf 100",
      text: results ? `${results} result${results === 1 ? "" : "s"} waiting for your approval` : "Wall of Wins and what-next votes",
      badge: results,
    },
    { href: "/admin/ask-gary", title: "Ask Gary", text: "Coming soon. Not built yet.", disabled: true },
  ];

  return (
    <div className="max-w-3xl mx-auto px-5 py-14">
      <h1 className="text-2xl font-medium mb-6">Admin</h1>
      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map((c) => {
          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium mb-1">{c.title}</p>
                {c.badge ? (
                  <span className="shrink-0 min-w-6 h-6 px-2 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center justify-center">
                    {c.badge > 99 ? "99+" : c.badge}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-ink/60">{c.text}</p>
            </>
          );
          return c.disabled ? (
            <div key={c.href} className="card block opacity-45 grayscale cursor-not-allowed select-none" aria-disabled="true">
              {body}
            </div>
          ) : (
            <Link key={c.href} href={c.href} className={`card block hover:border-clay-400 ${c.badge ? "border-red-300" : ""}`}>
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
