"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ArrowRight, 
  Activity, 
  Zap, 
  Target, 
  AlertCircle, 
  ShieldCheck, 
  Inbox,
  PenTool,
  Loader2,
  Globe,
  Clock,
  ChevronRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { runSeoAudit } from "@/app/actions/optimization";

type Topic = {
  id: string;
  topicName: string;
  status: string;
  coreEntity: string;
  createdAt: Date;
};

export function DashboardClient({ 
  user, 
  topics, 
  reviewQueue = [], 
  role 
}: { 
  user: any, 
  topics: Topic[], 
  reviewQueue?: Topic[], 
  role: string 
}) {
  
  const isOwner = role === "OWNER";
  const totalTopics = topics.length;
  
  const todoCount = topics.filter(t => t.status === "Idea" || t.status === "To Do").length;
  const inProgressCount = topics.filter(t => t.status === "In Progress").length;
  const reviewCount = topics.filter(t => t.status === "Review").length;
  const publishedCount = topics.filter(t => t.status === "Published").length;
  
  // --- MONTHLY GOAL TRACKER ---
  const MONTHLY_GOAL = 10;
  const publishedThisMonth = topics.filter(t => {
    const d = new Date(t.createdAt);
    const now = new Date();
    return t.status === "Published" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const goalProgress = Math.min(Math.round((publishedThisMonth / MONTHLY_GOAL) * 100), 100);

  // --- LIVE SEO SCRAPER STATE ---
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [isScraping, setIsScraping] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const issues = await runSeoAudit();
        const critical = issues.filter(i => i.type === "critical").length;
        const warning = issues.filter(i => i.type === "warning").length;
        
        let score = 100 - (critical * 20) - (warning * 5);
        if (score < 0) score = 0;
        setSeoScore(score);
      } catch (e) {
        setSeoScore(null); 
      } finally {
        setIsScraping(false);
      }
    }
    fetchScore();
  }, []);

  // --- DONUT CHART DATA ---
  let pipelineData = [
    { name: 'To Do', value: todoCount, color: '#94a3b8' },
    { name: 'Drafting', value: inProgressCount, color: '#6366f1' }, // Indigo
    { name: 'In Review', value: reviewCount, color: '#f59e0b' },   
    { name: 'Published', value: publishedCount, color: '#10b981' }, 
  ].filter(d => d.value > 0);

  if (pipelineData.length === 0) {
    pipelineData = [{ name: 'Empty', value: 1, color: '#f8fafc' }];
  }

  // --- AREA CHART DATA ---
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const count = topics.filter(t => {
        const topicDate = new Date(t.createdAt);
        return topicDate.getMonth() === d.getMonth() && topicDate.getFullYear() === d.getFullYear();
      }).length;
      data.push({ name: months[d.getMonth()], Articles: count });
    }
    return data;
  }, [topics]);

  // --- DYNAMIC NEXT BEST ACTION ---
  let nextAction = {
    title: "Queue Empty",
    desc: "Your pipeline is completely empty. Time to generate some new ideas.",
    btn: "Create New Article",
    link: "/dashboard/library"
  };

  if (isOwner) {
    if (reviewQueue.length > 0) {
      nextAction = {
        title: `${reviewQueue.length} Pending`,
        desc: "You have drafts waiting for your review. Approve and publish them.",
        btn: "Review Drafts",
        link: "/dashboard/library"
      };
    } else if (inProgressCount > 0) {
      nextAction = {
        title: `${inProgressCount} In Progress`,
        desc: "Your team is currently working on drafts. Check back later.",
        btn: "View Library",
        link: "/dashboard/library"
      };
    } else if (todoCount > 0) {
      nextAction = {
        title: `${todoCount} Ideas Ready`,
        desc: "You have topics waiting. Start drafting or assign them.",
        btn: "Assign Topics",
        link: "/dashboard/library"
      };
    }
  } else {
    // WRITER LOGIC
    if (inProgressCount > 0) {
      nextAction = {
        title: `${inProgressCount} Active Drafts`,
        desc: "You have open drafts. Finish writing and submit them for review.",
        btn: "Continue Writing",
        link: "/dashboard/library"
      };
    } else if (todoCount > 0) {
      nextAction = {
        title: `${todoCount} Topics Available`,
        desc: "There are new topics in the queue. Grab one and start drafting!",
        btn: "Pick a Topic",
        link: "/dashboard/library"
      };
    } else if (reviewCount > 0) {
      nextAction = {
        title: "Waiting for Approval",
        desc: "Your drafts are being reviewed by the Owner. Great work!",
        btn: "View Library",
        link: "/dashboard/library"
      };
    }
  }

  const recentTopics = topics.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 md:p-10 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {user.workspaces?.[0]?.workspace?.name || 'Your Workspace'}
              </h1>
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest">
                {role}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">
              Overview and performance metrics for your content pipeline.
            </p>
          </div>
          <Link href="/dashboard/library">
            <button className="bg-slate-900 hover:bg-black text-white font-medium rounded-xl h-10 px-5 shadow-sm transition-all flex items-center gap-2 text-sm hover:scale-[1.02]">
              {isOwner ? <FileText className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
              {isOwner ? "Go to Library" : "Start Writing"}
            </button>
          </Link>
        </header>

        {/* REVIEW QUEUE (OWNER ONLY) */}
        {isOwner && reviewQueue.length > 0 && (
          <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-amber-100 text-amber-600 p-2 rounded-lg">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-900 flex items-center gap-2 tracking-tight">
                  Action Required: Review Queue
                  <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                </h2>
                <p className="text-amber-700/80 text-xs font-medium mt-0.5">You have {reviewQueue.length} articles waiting for final approval.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reviewQueue.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/dashboard/editor/${item.id}`}
                  className="bg-white/60 border border-amber-200/50 p-4 rounded-xl hover:bg-white hover:border-amber-400 hover:shadow-sm transition-all group"
                >
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-1 mb-1">
                    {item.topicName}
                  </h3>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">Ready for Review</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TOP ROW: BENTO METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Goal Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-semibold text-slate-600 tracking-tight">Monthly Target</h2>
              </div>
              <span className="text-xs font-medium text-slate-400">{goalProgress}% Done</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold tracking-tighter text-slate-900">{publishedThisMonth}</span>
              <span className="text-sm font-medium text-slate-400">/ {MONTHLY_GOAL} published</span>
            </div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${goalProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>

          {/* SEO Health Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-semibold text-slate-600 tracking-tight">Live SEO Health</h2>
              </div>
              {seoScore !== null && !isScraping && (
                <Link href="/dashboard/optimization" className="text-[10px] font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-wider flex items-center gap-1 transition-colors">
                  Audit <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {isScraping ? (
              <div className="flex flex-col items-start justify-center pt-2">
                <Loader2 className="w-5 h-5 animate-spin text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-400 animate-pulse">Scanning domain...</p>
              </div>
            ) : seoScore !== null ? (
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-bold tracking-tighter ${seoScore > 80 ? 'text-emerald-600' : seoScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>
                  {seoScore}
                </span>
                <span className="text-sm font-medium text-slate-400">/ 100</span>
              </div>
            ) : (
              <div className="flex flex-col items-start justify-center pt-1">
                <p className="text-xs text-slate-500 mb-3">No active URL configured.</p>
                <Link href="/dashboard/settings">
                  <span className="text-xs font-medium text-indigo-600 hover:text-indigo-700">Add in Settings &rarr;</span>
                </Link>
              </div>
            )}
          </div>

          {/* Next Best Action Card */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-md text-white relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:bg-indigo-500/30 transition-colors pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <AlertCircle className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-indigo-100 tracking-tight">Suggested Action</h2>
            </div>
            
            <div className="relative z-10">
              <p className="text-xl font-bold text-white mb-1 tracking-tight">{nextAction.title}</p>
              <p className="text-slate-400 text-xs leading-relaxed mb-4 line-clamp-2">{nextAction.desc}</p>
              <Link href={nextAction.link}>
                <button className="w-full py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition-colors">
                  {nextAction.btn}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Content Velocity */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Content Velocity</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Articles generated over the last 6 months.</p>
              </div>
            </div>
            
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', padding: '8px 12px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="Articles" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorArticles)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline Donut */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col">
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Pipeline Breakdown</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Distribution of {totalTopics} total topics.</p>
            </div>
            
            <div className="flex-1 min-h-[180px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', padding: '6px 10px' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{totalTopics}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 mt-2 pt-4 border-t border-slate-100">
              {pipelineData.map((item) => (
                item.name !== 'Empty' && (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
                    <p className="text-[11px] font-semibold text-slate-600 truncate">{item.name}</p>
                    <span className="text-[11px] font-bold text-slate-900 ml-auto">{item.value}</span>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: RECENT ACTIVITY LIST */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">Jump back into your latest drafts.</p>
            </div>
            <Link href="/dashboard/library" className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTopics.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No activity found. Start a new topic!</div>
            ) : (
              recentTopics.map((topic) => (
                <Link href={`/dashboard/editor/${topic.id}`} key={topic.id} className="block group">
                  <div className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex w-10 h-10 rounded-full bg-slate-100 items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-0.5">
                          {topic.topicName}
                        </h3>
                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" /> {topic.coreEntity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(topic.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        topic.status === 'Published' ? 'bg-emerald-50 text-emerald-700' : 
                        topic.status === 'Review' ? 'bg-amber-50 text-amber-700' : 
                        topic.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {topic.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}