import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { AiBrainstormer } from "@/components/pipeline/AiBrainstormer";
import { CreateTopicModal } from "@/components/pipeline/CreateTopicModal"; // 1. Add this import

export default async function PipelinePage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      seoTopics: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user) redirect("/login");

  const mappedTopics = (user.seoTopics || []).map((topic, index) => {
    const fallbackEntity = topic.topicName.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9 ]/g, "");
    return {
      id: topic.id,
      topicName: topic.topicName,
      status: (topic as any).status || "Idea",
      priority: (topic as any).priority || (index < 3 ? "High" : "Medium"),
      coreEntity: (topic as any).coreEntity || fallbackEntity || "General",
    };
  });

  return (
    <div className="h-screen bg-slate-50/30 p-6 font-sans text-slate-900 overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col animate-in fade-in duration-500">
        
        {/* --- UPDATED HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Content Pipeline</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your SEO production workflow.</p>
          </div>
          
          {/* 2. Place the Modal Button Here */}
          <CreateTopicModal />
        </header>

        <AiBrainstormer />
        <PipelineBoard initialTopics={mappedTopics} />

      </div>
    </div>
  );
}