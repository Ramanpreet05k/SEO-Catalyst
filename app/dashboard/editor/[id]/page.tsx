import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DraftEditorClient } from "@/components/editor/DraftEditorClient";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const { id } = await params;

  const topic = await prisma.seoTopic.findUnique({
    where: { id },
    include: {
      comments: { orderBy: { createdAt: 'asc' } },
      workspace: {
        include: {
          members: { where: { user: { email: session.user.email } } }
        }
      }
    }
  });

  if (!topic) redirect("/dashboard/library");
  const userRole = topic.workspace?.members[0]?.role || "WRITER";

  return <DraftEditorClient topic={topic} role={userRole} user={session.user} />;
}