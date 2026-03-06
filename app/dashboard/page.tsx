import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 1. Fetch the user and their workspace membership
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      workspaces: {
        include: {
          workspace: true
        }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // 2. INITIALIZER: Ensure every user has at least one workspace
  if (user.workspaces.length === 0) {
    await prisma.workspace.create({
      data: {
        name: `${user.name?.split(' ')[0] || 'Personal'} Workspace`,
        members: {
          create: {
            userId: user.id,
            role: "OWNER"
          }
        }
      }
    });

    // Re-fetch to get the newly created workspace
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        workspaces: { include: { workspace: true } }
      }
    });
  }

  // Safety check for TypeScript
  if (!user || user.workspaces.length === 0) redirect("/login");

  const workspaceId = user.workspaces[0].workspaceId;
  const userRole = user.workspaces[0].role;

  // 3. FETCH REVIEW QUEUE (Only for OWNERS)
  let reviewQueue: any[] = [];
  if (userRole === "OWNER") {
    reviewQueue = await prisma.seoTopic.findMany({
      where: {
        workspaceId: workspaceId,
        status: "Review"
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 4. FETCH RECENT TOPICS (General list for the dashboard)
  const topics = await prisma.seoTopic.findMany({
    where: { 
      workspaceId: workspaceId 
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return (
    <DashboardClient 
      user={user} 
      topics={topics} 
      reviewQueue={reviewQueue} 
      role={userRole} 
    />
  );
}