import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TeamClient } from "@/components/settings/TeamClient";

export default async function TeamSettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: { include: { workspace: { include: { members: { include: { user: true } } } } } } }
  });

  const workspace = user?.workspaces[0]?.workspace;
  const members = workspace?.members || [];

  return <TeamClient members={members} />;
}