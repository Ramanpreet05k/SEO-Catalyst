import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sparkles, Target, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AeoMeter } from "@/components/dashboard/AeoMeter";
import { CompetitorModal } from "@/components/dashboard/CompetitorModal";
import { InteractivePipeline } from "@/components/dashboard/InteractivePipeline";
import { NewContentModal } from "@/components/dashboard/NewContentModal";

export default async function ProfessionalDashboard() {
  const session = await getServerSession();
  
  // 1. Check Auth: If not logged in, redirect to login page
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Fetch User Data, Competitors, and SEO Topics from the database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      competitors: { orderBy: { createdAt: 'desc' } },
      seoTopics: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user) redirect("/login");

  const activeCompetitors = user.competitors || [];

  // 3. Process Topics and apply defaults for older database entries
  const mappedTopics = (user.seoTopics || []).map((topic, index) => {
    // If coreEntity doesn't exist in the DB yet, generate a pseudo-entity from the title
    const fallbackEntity = topic.topicName.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9 ]/g, "");
    
    return {
      id: topic.id,
      topicName: topic.topicName,
      status: (topic as any).status || "To Do",
      priority: (topic as any).priority || (index < 3 ? "High" : "Medium"),
      coreEntity: (topic as any).coreEntity || fallbackEntity || "General",
    };
  });

  // Extract unique entities for the top stats card count
  const uniqueEntities = Array.from(new Set(mappedTopics.map(t => t.coreEntity)));
  const priorityTopic = mappedTopics[0]?.topicName || 'Your first semantic article';

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Workspace Overview</h1>
            <p className="text-slate-500 mt-1">
              AI visibility and content intelligence for <span className="font-semibold text-slate-700">{user.website || "your brand"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            {/* Server Action Modal for adding new competitors */}
            <CompetitorModal activeCompetitors={activeCompetitors} />
            
            {/* Dynamic Modal to select or create new AI topics */}
            <NewContentModal topics={mappedTopics} />
          </div>
        </header>

        {/* --- TOP ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* AEO METER (Client Component fetching live AI scan) */}
          <div className="md:col-span-4 lg:col-span-3">
             <AeoMeter 
               website={user.website || ""} 
               initialScore={user.aeoScore} 
               initialStatus={user.aeoStatus} 
             />
          </div>

          {/* NEXT BEST ACTION HERO CARD */}
          <Card className="md:col-span-8 lg:col-span-6 border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col justify-center">
            <CardContent className="p-8 flex flex-col justify-center h-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold w-fit mb-4 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" /> Priority Action
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Draft: "{priorityTopic}"</h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg mb-6">
                Gemini identified this as a high-impact gap. Publishing this establishes authority for your core entities before your competitors do.
              </p>
              <Button className="w-fit bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-sm">
                Start Writing in Editor <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* QUICK STATS */}
          <Card className="md:col-span-12 lg:col-span-3 border-slate-200 shadow-sm rounded-2xl bg-white flex flex-row lg:flex-col divide-x lg:divide-x-0 lg:divide-y divide-slate-100">
             <div className="flex-1 p-6 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Tracked Competitors</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-900">{activeCompetitors.length}</span>
                  <Target className="w-5 h-5 text-rose-500" />
                </div>
             </div>
             <div className="flex-1 p-6 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Brand Entities</p>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-slate-900">{uniqueEntities.length}</span>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
             </div>
          </Card>
        </div>

        {/* --- BOTTOM ROW: INTERACTIVE AEO MODULE --- */}
        {/* Client component for filtering topics by entities */}
        <InteractivePipeline initialTopics={mappedTopics} />

      </div>
    </div>
  );
}