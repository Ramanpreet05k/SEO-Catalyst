import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TopicClusterClient } from "./TopicClusterClient";

export default async function TopicsPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      seoTopics: {
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
        
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Topic Clusters</h1>
          <p className="text-slate-500 mt-1">
            Map out your semantic strategy. Build authority by supporting your core pillars with tightly grouped cluster articles.
          </p>
        </header>

        {/* The new Visual Node Graph completely replaces the Kanban Board! */}
        <TopicClusterClient initialTopics={user.seoTopics} />

      </div>
    </div>
  );
}