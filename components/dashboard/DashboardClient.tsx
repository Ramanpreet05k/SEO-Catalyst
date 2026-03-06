"use client";

import { useMemo } from "react";
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
  PenTool
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
  
  // Refined Grouping for better Team visibility
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

  // --- DONUT CHART DATA ---
  let pipelineData = [
    { name: 'To Do', value: todoCount, color: '#94a3b8' },
    { name: 'Drafting', value: inProgressCount, color: '#3b82f6' }, // Blue
    { name: 'In Review', value: reviewCount, color: '#f59e0b' },   // Amber
    { name: 'Published', value: publishedCount, color: '#10b981' }, // Emerald
  ].filter(d => d.value > 0);

  // Fallback if empty
  if (pipelineData.length === 0) {
    pipelineData = [{ name: 'Empty', value: 1, color: '#f1f5f9' }];
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
        title: `${reviewQueue.length} Pending Approvals`,
        desc: "You have drafts waiting for your review. Approve and publish them to hit your goals.",
        btn: "Review Drafts",
        link: "/dashboard/library"
      };
    } else if (inProgressCount > 0) {
      nextAction = {
        title: `${inProgressCount} Drafts in Progress`,
        desc: "Your team is currently working on drafts. Check back later for reviews.",
        btn: "View Library",
        link: "/dashboard/library"
      };
    } else if (todoCount > 0) {
      nextAction = {
        title: `${todoCount} Ideas Ready`,
        desc: "You have topics waiting in the queue. Start drafting or assign them to a writer.",
        btn: "Assign Topics",
        link: "/dashboard/library"
      };
    }
  } else {
    // WRITER LOGIC
    if (inProgressCount > 0) {
      nextAction = {
        title: `${inProgressCount} Active Drafts`,
        desc: "You have open drafts. Finish writing and submit them for review to the owner.",
        btn: "Continue Writing",
        link: "/dashboard/library"
      };
    } else if (todoCount > 0) {
      nextAction = {
        title: `${todoCount} Topics Available`,
        desc: "There are new topics in the 'To Do' queue. Grab one and start drafting!",
        btn: "Pick a Topic",
        link: "/dashboard/library"
      };
    } else if (reviewCount > 0) {
      nextAction = {
        title: "Waiting for Approval",
        desc: "Your submitted drafts are currently being reviewed by the Owner. Great work!",
        btn: "View Library",
        link: "/dashboard/library"
      };
    }
  }

  const recentTopics = topics.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome to {user.workspaces?.[0]?.workspace?.name || 'Your Workspace'}
            </h1>
            <p className="text-slate-500 mt-1">
              Role: <span className="font-bold text-indigo-600 uppercase text-[11px] tracking-wider bg-indigo-50 px-2 py-0.5 rounded-md ml-1 mr-1">{role}</span> &bull; Monitoring your SEO pipeline progress.
            </p>
          </div>
          <Link href="/dashboard/library">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-11 px-6 shadow-sm transition-colors flex items-center gap-2">
              {isOwner ? <FileText className="w-4 h-4" /> : <PenTool className="w-4 h-4" />}
              {isOwner ? "Go to Library" : "Start Writing"}
            </button>
          </Link>
        </header>

        {/* --- OWNER REVIEW QUEUE --- */}
        {isOwner && reviewQueue.length > 0 && (
          <section className="bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 shadow-sm animate-in zoom-in-95 duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500 p-2 rounded-xl">
                  <Inbox className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-amber-900 flex items-center gap-2">
                    Review Queue
                    <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
                  </h2>
                  <p className="text-amber-700 text-sm font-medium">There are {reviewQueue.length} articles waiting for your final approval.</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reviewQueue.map((item) => (
                <Link 
                  key={item.id} 
                  href={`/dashboard/editor/${item.id}`}
                  className="bg-white border border-amber-100 p-5 rounded-2xl hover:border-amber-400 hover:shadow-lg hover:-translate-y-1 transition-all group"
                >
                  <div className="flex flex-col h-full justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                        {item.topicName}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Ready for Final Polish
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-amber-50 pt-3">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Approve Now
                      </span>
                      <ArrowRight className="w-4 h-4 text-amber-300 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* TOP ROW: Progress & Goal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Target className="w-24 h-24 text-indigo-600" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Monthly Publishing Goal
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">Keep the momentum going. Hit your target to build topical authority.</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-indigo-600">{publishedThisMonth}</span>
                <span className="text-slate-400 font-bold text-lg"> / {MONTHLY_GOAL}</span>
              </div>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-4 mb-2 relative z-10 overflow-hidden border border-slate-200">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
            <p className="text-xs font-bold text-slate-400 text-right relative z-10">{goalProgress}% Completed</p>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-indigo-50">Next Best Action</h3>
            </div>
            <div>
              <p className="text-2xl font-black text-white mb-1">{nextAction.title}</p>
              <p className="text-indigo-200 text-sm leading-relaxed mb-4">{nextAction.desc}</p>
              <Link href={nextAction.link}>
                <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-bold transition-colors">
                  {nextAction.btn}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" /> Content Velocity
                </h2>
                <p className="text-sm text-slate-500 mt-1">Total articles generated over the last 6 months.</p>
              </div>
            </div>
            
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="Articles" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorArticles)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
               Pipeline Status
            </h2>
            <p className="text-xs text-slate-500 mb-4">Current distribution of your {totalTopics} total topics.</p>
            
            <div className="flex-1 min-h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pipelineData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pipelineData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: '#0f172a', fontWeight: 'bold', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900">{totalTopics}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 mt-4 pt-4 border-t border-slate-100 text-slate-900">
              {pipelineData.map((item) => (
                item.name !== 'Empty' && (
                  <div key={item.name} className="text-center">
                    <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: item.color }}></div>
                    <p className="text-lg font-bold leading-none">{item.value}</p>
                    <p className="text-[10px] font-semibold text-slate-500">{item.name}</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Jump Back In */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" /> Recent Activity
            </h2>
            <Link href="/dashboard/library" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View Library &rarr;</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentTopics.map((topic) => (
              <Link href={`/dashboard/editor/${topic.id}`} key={topic.id} className="block group">
                <div className="p-5 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        topic.status === 'Published' ? 'bg-emerald-100 text-emerald-700' : 
                        topic.status === 'Review' ? 'bg-amber-100 text-amber-700' : 
                        topic.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {topic.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-900 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                      {topic.topicName}
                    </h3>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider line-clamp-1">
                      Entity: {topic.coreEntity}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}