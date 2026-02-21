import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { 
  Sparkles, 
  PenLine, 
  Target, 
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfessionalDashboard() {
  // 1. Authenticate the user
  const session = await getServerSession();
  if (!session?.user?.email) {
    redirect("/login");
  }

  // 2. Fetch User Data, Competitors, and Topics from MongoDB
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      competitors: {
        orderBy: { createdAt: 'desc' }
      },
      seoTopics: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) redirect("/login");

  // 3. Process Data for the UI
  const activeCompetitors = user.competitors;
  
  // For "Entities", we will extract the first few words from your generated SEO topics 
  // to represent the core semantic keywords AI associates with your brand.
  const coreEntities = user.seoTopics
    .map(topic => topic.topicName.split(' ').slice(0, 2).join(' ')) // Grabs first 2 words
    .filter((value, index, self) => self.indexOf(value) === index) // Removes duplicates
    .slice(0, 6); // Keep it to a max of 6 entities for the UI

  // Mock score for the meter (we can make this dynamic later)
  const aeoScore = 82;
  const arcLength = 251.2; 
  const arcOffset = arcLength * (1 - aeoScore / 100);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Workspace Overview
            </h1>
            <p className="text-slate-500 mt-1">
              AI visibility and content intelligence for <span className="font-semibold text-slate-700">{user.website || "your brand"}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white rounded-xl h-11 border-slate-200 font-bold shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Track Competitor
            </Button>
            <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-sm">
              <PenLine className="w-4 h-4 mr-2" /> New Content
            </Button>
          </div>
        </header>

        {/* --- TOP ROW: METER & ACTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* 1. AEO METER GAUGE */}
          <Card className="md:col-span-4 lg:col-span-3 border-slate-200 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  AEO Readiness
                </CardTitle>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center pt-4">
              <div className="relative w-48 h-28 flex justify-center overflow-hidden">
                <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-sm">
                  <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
                  <path 
                    d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" 
                    strokeDasharray={arcLength} strokeDashoffset={arcOffset} className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute bottom-2 flex flex-col items-center">
                  <span className="text-4xl font-black text-slate-900 leading-none">{aeoScore}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Good</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. NEXT BEST ACTION */}
          <Card className="md:col-span-8 lg:col-span-6 border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col justify-center">
            <CardContent className="p-8 flex flex-col justify-center h-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold w-fit mb-4 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" /> Priority Action
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Draft: "{user.seoTopics[0]?.topicName || 'Your first semantic article'}"
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-lg mb-6">
                Gemini identified this as a high-impact gap in your content. Publishing this establishes authority for your core entities before your competitors do.
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
                  {/* Backend Data Connected Here */}
                  <span className="text-3xl font-black text-slate-900">{activeCompetitors.length}</span>
                  <Target className="w-5 h-5 text-rose-500" />
                </div>
             </div>
             <div className="flex-1 p-6 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Brand Entities</p>
                <div className="flex items-center justify-between">
                  {/* Backend Data Connected Here */}
                  <span className="text-3xl font-black text-slate-900">{coreEntities.length}</span>
                  <Zap className="w-5 h-5 text-amber-500" />
                </div>
             </div>
          </Card>

        </div>

        {/* --- BOTTOM ROW: DATA TABLES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* STATIC TOPIC PIPELINE (We'll wire this next) */}
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
                  {/* Placeholder static rows until you want to wire them up */}
                  <TopicRow title="How to Optimize for ChatGPT Answers" priority="High" status="In Progress" />
                  <TopicRow title="Next.js SEO Best Practices" priority="Medium" status="To Do" />
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* DYNAMIC SIDE PANEL: ENTITIES & COMPETITORS */}
          <div className="space-y-6">
            
            {/* DYNAMIC Semantic Entities */}
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
                    <span className="text-xs text-slate-400 font-medium">No entities generated yet.</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* DYNAMIC Competitors List */}
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

function TopicRow({ title, status, priority }: any) {
  const isHigh = priority === "High";
  const isPublished = status === "Published";
  const isInProgress = status === "In Progress";
  
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
          {isPublished ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
           isInProgress ? <Clock className="w-4 h-4 text-amber-500" /> : 
           <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
          {status}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        {/* Swapped Button component out for standard button to prevent Client Component errors */}
        <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 transition-all">
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