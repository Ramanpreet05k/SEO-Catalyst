"use client";

import { useMemo, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Added Variants type
import { 
  FileText, ArrowRight, Activity, Zap, Target, 
  Inbox, PenTool, Loader2, Globe, Clock, ChevronRight 
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { runSeoAudit } from "@/app/actions/optimization";

// --- TYPE-SAFE ANIMATION CONFIGS ---
const pageTransition: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { 
      duration: 0.8, 
      ease: [0.16, 1, 0.3, 1], // Now typed correctly as Variants
      staggerChildren: 0.12 
    }
  }
};

const cardHover: Variants = {
  hover: { 
    y: -8, 
    scale: 1.01,
    boxShadow: "0px 20px 40px rgba(79, 70, 229, 0.1)",
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

const textReveal: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
};

const listItem: Variants = {
  hidden: { opacity: 0, scale: 0.97, y: 10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
};

export function DashboardClient({ user, topics, reviewQueue = [], role }: any) {
  const isOwner = role === "OWNER";
  const totalTopics = topics.length;
  const [seoScore, setSeoScore] = useState<number | null>(null);
  const [isScraping, setIsScraping] = useState(true);

  useEffect(() => {
    async function fetchScore() {
      try {
        const issues = await runSeoAudit();
        const critical = issues.filter((i: any) => i.type === "critical").length;
        const warning = issues.filter((i: any) => i.type === "warning").length;
        let score = 100 - (critical * 20) - (warning * 5);
        setSeoScore(Math.max(0, score));
      } catch (e) { setSeoScore(null); } finally { setIsScraping(false); }
    }
    fetchScore();
  }, []);

  const pipelineData = [
    { name: 'To Do', value: topics.filter((t: any) => t.status === "To Do").length, color: '#94a3b8' },
    { name: 'Drafting', value: topics.filter((t: any) => t.status === "In Progress").length, color: '#6366f1' },
    { name: 'In Review', value: topics.filter((t: any) => t.status === "Review").length, color: '#f59e0b' },
    { name: 'Published', value: topics.filter((t: any) => t.status === "Published").length, color: '#10b981' },
  ].filter(d => d.value > 0);

  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const count = topics.filter((t: any) => {
        const topicDate = new Date(t.createdAt);
        return topicDate.getMonth() === d.getMonth() && topicDate.getFullYear() === d.getFullYear();
      }).length;
      data.push({ name: months[d.getMonth()], Articles: count });
    }
    return data;
  }, [topics]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="min-h-screen bg-[#FAFAFA] p-6 md:p-10 font-sans text-slate-900"
    >
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* HEADER SECTION */}
        <motion.header variants={textReveal} className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
          <div className="space-y-1">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black tracking-tight text-slate-900"
            >
              {user.workspaces?.[0]?.workspace?.name || 'Workspace'}
            </motion.h1>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Content Analytics &bull; <span className="text-indigo-600 font-bold uppercase text-[10px] tracking-widest">{role}</span>
            </p>
          </div>
          <Link href="/dashboard/library">
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="bg-indigo-600 text-white font-bold rounded-2xl h-12 px-8 shadow-[0_10px_20px_rgba(79,70,229,0.2)] hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              {isOwner ? <FileText className="w-5 h-5" /> : <PenTool className="w-5 h-5" />}
              {isOwner ? "Review Library" : "Start Writing"}
            </motion.button>
          </Link>
        </motion.header>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SEO Health */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            className="bg-white p-8 rounded-[2rem] border border-slate-200/60 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <Globe className="w-32 h-32" />
            </div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">SEO Health</h2>
            {isScraping ? (
              <div className="flex items-center gap-3"><Loader2 className="w-5 h-5 animate-spin text-indigo-500" /><span className="text-sm font-bold animate-pulse">Scanning...</span></div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-baseline gap-2"
              >
                <span className={`text-6xl font-black tracking-tighter ${seoScore! > 80 ? 'text-indigo-600' : 'text-amber-500'}`}>{seoScore}</span>
                <span className="text-xl font-bold text-slate-300">/100</span>
              </motion.div>
            )}
          </motion.div>

          {/* Published Progress */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            className="bg-white p-8 rounded-[2rem] border border-slate-200/60 shadow-sm"
          >
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Monthly Volume</h2>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl font-black tracking-tighter text-slate-900">
                {topics.filter((t: any) => t.status === "Published").length}
              </span>
              <span className="text-xl font-bold text-slate-300">/ 10</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(topics.filter((t: any) => t.status === "Published").length / 10) * 100}%` }}
                  transition={{ duration: 1.2, ease: "circOut" }}
                  className="h-full bg-indigo-600"
                />
            </div>
          </motion.div>

          {/* Action Trigger Card */}
          <motion.div 
            variants={cardHover}
            whileHover="hover"
            className="bg-indigo-600 p-8 rounded-[2rem] shadow-xl text-white relative group overflow-hidden"
          >
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
            />
            <Zap className="w-10 h-10 mb-6 text-indigo-200" />
            <h3 className="text-2xl font-black mb-2">Instant Ideas</h3>
            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">AI has identified new high-gain topics based on competitor gaps.</p>
            <Link href="/dashboard/library" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white text-indigo-600 px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors">
              Open Pipeline <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* DATA VISUALIZATION SECTION */}
        <motion.div variants={textReveal} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-10">
                <h2 className="text-xl font-black tracking-tight flex items-center gap-2"><Activity className="w-5 h-5 text-indigo-600" /> Momentum</h2>
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
                    cursor={{ stroke: '#4f46e5', strokeWidth: 2, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="Articles" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#velocityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col">
            <h2 className="text-xl font-black tracking-tight mb-8">Pipeline</h2>
            <div className="flex-1 relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pipelineData} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                    {pipelineData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }} 
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
              >
                <span className="text-4xl font-black text-slate-900">{totalTopics}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Articles</span>
              </motion.div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-8">
                {pipelineData.map(item => (
                    <div key={item.name} className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                            {item.name}
                        </div>
                        <span className="text-lg font-black text-slate-900 pl-3">{item.value}</span>
                    </div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* ACTIVITY LIST WITH STAGGERED REVEAL */}
        <motion.div variants={textReveal} className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden mb-20">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">Recent Activity</h2>
            <Link href="/dashboard/library" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700">Open Library &rarr;</Link>
          </div>
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="divide-y divide-slate-50"
          >
            {topics.slice(0, 5).map((topic: any) => (
              <motion.div 
                key={topic.id} 
                variants={listItem}
                whileHover={{ backgroundColor: "#FAFBFF" }}
              >
                <Link href={`/dashboard/editor/${topic.id}`} className="block p-6 px-10 flex items-center justify-between group">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-lg transition-all duration-300">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{topic.topicName}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{topic.coreEntity}</span>
                        <span className="text-slate-200 font-light">|</span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(topic.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </motion.div>
  );
}