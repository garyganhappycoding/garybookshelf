import Shell from "@/components/programme/Shell";
import JoinView from "@/components/programme/JoinView";
import { requireProgrammeAdmin } from "@/lib/programme/gate";
import { createClient } from "@/lib/supabase/server";
import { friendLink, myGroup } from "@/lib/programme/groups";

export const dynamic = "force-dynamic";
export const metadata = { title: "加入 · 陪你读书（管理员预览）", robots: { index: false, follow: false } };

export default async function JoinPage() {
  await requireProgrammeAdmin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const mine = user ? await myGroup(user.id) : null;
  // Friend links are only shown to the leader, and only once the whole group is confirmed.
  const isLeader = !!mine && mine.group.leader_id === user?.id;
  const view = mine && {
    groupNo: mine.group.group_no, size: mine.group.size, price: mine.group.price_each, status: mine.group.status, isLeader,
    members: mine.members.map((m) => ({
      id: m.id, email: m.email, role: m.role, status: m.status, me: m.user_id === user?.id,
      link: isLeader && mine.group.status === "active" && m.role === "friend" ? friendLink(m.id) : null,
    })),
  };
  return (
    <Shell active="join">
      <JoinView group={view ?? null} />
    </Shell>
  );
}
