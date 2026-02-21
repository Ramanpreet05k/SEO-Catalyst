import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  Sparkles, 
  PenLine, 
  Target, 
  ArrowRight, 
  Zap, 
  CheckCircle2, 
  Clock, 
  MoreHorizontal 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AeoMeter } from "@/components/dashboard/AeoMeter";
import { CompetitorModal } from "@/components/dashboard/CompetitorModal";

export default async function ProfessionalDashboard() {
  const session = await getServerSession();
  
  // 1. Check if user is logged in
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Fetch User Data, Competitors, and Topics from Database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      competitors: { orderBy: { createdAt: 'desc' } },
      seoTopics: { orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user) redirect("/login");

  const activeCompetitors = user.competitors || [];
  
  // Extract pseudo-entities from the first few words of the generated topics
  const coreEntities = (user.seoTopics || [])
    .map(topic => topic.topicName.split(' ').slice(0, 2).join(' '))
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 6);

  const priorityTopic = user.seoTopics?.[0]?.topicName || 'Your first semantic article';

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
            
            {/* DYNAMIC COMPETITOR MODAL COMPONENT */}
            <CompetitorModal activeCompetitors={activeCompetitors} />

            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-sm">
              <PenLine className="w-4 h-4 mr-2" /> New Content
            </Button>
          </div>
        </header>

        {/* --- TOP ROW --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* 1. DYNAMIC AEO METER */}
          <div className="md:col-span-4 lg:col-span-3">
             <AeoMeter 
               website={user.website || ""} 
               initialScore={user.aeoScore} 
               initialStatus={user.aeoStatus} 
             />
          </div>

          {/* 2. NEXT BEST ACTION */}
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

          {/* 3. DYNAMIC QUICK STATS */}
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
                  <span className="text-3xl font-black text-slate-900">{coreEntities.length}</span>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
             </div>
          </Card>
        </div>

        {/* --- BOTTOM ROW --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* DYNAMIC TOPIC PIPELINE */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">AI Topic Pipeline</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Generated content roadmap based on your brand profile.</p>
                </div>
                <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">View All</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-white text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Topic Title</th>
                      <th className="px-6 py-4">Priority</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {user.seoTopics && user.seoTopics.length > 0 ? (
                      user.seoTopics.map((topic, i) => (
                        <TopicRow 
                          key={topic.id} 
                          title={topic.topicName} 
                          priority={i < 3 ? "High" : "Medium"} 
                          status="To Do" 
                        />
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                          No topics generated yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* SIDE PANEL: ENTITIES & COMPETITORS */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
              <CardHeader className="py-5">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Core Entities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {coreEntities.length > 0 ? (
                    coreEntities.map((entity, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md border border-slate-200 capitalize">
                        {entity}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">No entities generated.</span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
              <CardHeader className="py-5">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-rose-500" /> Active Competitors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCompetitors.length > 0 ? (
                  activeCompetitors.map((comp) => (
                    <CompetitorRow key={comp.id} name={comp.name} domain={comp.url || "Verified Domain"} />
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-medium">No competitors tracked yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS ---

function TopicRow({ title, status, priority }: { title: string, status: string, priority: string }) {
  const isHigh = priority === "High";
  
  return (
    <tr className="group hover:bg-slate-50 transition-colors cursor-pointer">
      <td className="px-6 py-4">
        <span className="text-sm font-bold text-slate-900">{title}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isHigh ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-indigo-500' : 'bg-slate-400'}`} />
          {priority}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
          {status}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 transition-all">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function CompetitorRow({ name, domain }: { name: string, domain: string }) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 leading-none">{name}</p>
          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[150px]">{domain}</p>
        </div>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
    </div>
  );
}