import Shell from "@/components/programme/Shell";
import JoinView from "@/components/programme/JoinView";
import { requireProgrammeSignedIn } from "@/lib/programme/gate";
import { maskEmail, myGroup } from "@/lib/programme/groups";

export const dynamic = "force-dynamic";
export const metadata = { title: "加入 · 陪你读书", robots: { index: false, follow: false } };

export default async function JoinPage() {
  const a = await requireProgrammeSignedIn();
  const user = { id: a.userId };
  const mine = await myGroup(a.userId);
  const isLeader = !!mine && mine.group.leader_id === user?.id;
  const view = mine && {
    groupNo: mine.group.group_no, size: mine.group.size, price: mine.group.price_each, status: mine.group.status, isLeader,
    canEnter: mine.group.status === "active" && mine.members.some((m) => m.user_id === user.id && m.status === "confirmed" && !m.paused),
    members: mine.members.map((m) => ({
      id: m.id, email: m.user_id === user.id ? m.email : maskEmail(m.email), role: m.role, status: m.status, me: m.user_id === user.id,
    })),
  };
  return (
    <Shell active="join" admin={a.isAdmin}>
      <JoinView group={view ?? null} />
    </Shell>
  );
}
