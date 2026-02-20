"use client";

import React from "react";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  MoreVertical, 
  Info, 
  Download,
  Search,
  Zap,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- HELPERS & TYPES ---

interface MetricProps {
  label: string;
  value: string;
  trend?: string;
  isUp?: boolean;
}

const TrendBadge = ({ trend, isUp }: { trend: string; isUp: boolean }) => (
  <span className={cn(
    "text-[10px] font-bold flex items-center mb-1",
    isUp ? "text-green-500" : "text-red-500"
  )}>
    {isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
    {trend}
  </span>
);

// --- MAIN COMPONENT ---

export default function AdvancedDashboard() {
  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-700 bg-slate-50/30 min-h-screen">
      {/* --- HEADER --- */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Optimization Health</h1>
          <p className="text-sm text-slate-500">Real-time visibility across search engines and AI generative answers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="bg-white">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
        </div>
      </header>

      {/* --- TOP STATS CARDS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Keywords Tracked" value="1,284" trend="+23.01%" isUp={true} />
        <MetricCard label="Responses Analyzed" value="3,912" trend="+1.2%" isUp={true} />
        <MetricCard label="Successful Backlinks" value="126" trend="-2.4%" isUp={false} />
        <MetricCard label="Domain Authority" value="63" />
      </div>

      {/* --- GRAPHS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Search Engine Trend" sub="Traffic growth following core ranking gains." />
        <ChartCard title="AI Answer Visibility" sub="Visibility share in AI-generated snapshots." />
        <BarChartCard title="Outreach Effectiveness" sub="Conversion rate of high-authority link placements." />
      </div>

      {/* --- SEO PERFORMANCE TABLE --- */}
      <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-6">
          <div className="space-y-1">
            <CardTitle className="text-base font-bold">SEO Keyword Performance</CardTitle>
            <p className="text-xs text-slate-500">Tracking top 50 performing organic keywords.</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Keyword</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Traffic Change</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <KeywordRow rank="#1" keyword="AI Automation Strategy" channel="Social" traffic="+23.01%" isUp={true} />
                <KeywordRow rank="#2" keyword="Next.js SEO Framework" channel="Organic Search" traffic="+12.45%" isUp={true} />
                <KeywordRow rank="#3" keyword="Answer Engine Optimization" channel="AI Snapshot" traffic="-5.21%" isUp={false} />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MetricCard({ label, value, trend, isUp = true }: MetricProps) {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl bg-white hover:border-slate-300 transition-all">
      <CardContent className="p-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">{label}</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          {trend && <TrendBadge trend={trend} isUp={isUp} />}
        </div>
      </CardContent>
    </Card>
  );
}

function ChartCard({ title, sub }: { title: string; sub: string }) {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl bg-white p-6 h-64 flex flex-col">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <Info className="w-3.5 h-3.5 text-slate-300 hover:text-slate-500 cursor-help" />
      </div>
      <p className="text-[10px] text-slate-400 mb-auto">{sub}</p>
      <div className="w-full h-32 flex items-end">
        <svg viewBox="0 0 100 40" className="w-full h-full text-slate-900 overflow-visible">
          <path 
            d="M0,35 Q20,30 40,32 T80,10 T100,5" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round"
          />
          <circle cx="60" cy="22" r="2.5" fill="white" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </Card>
  );
}

function BarChartCard({ title, sub }: { title: string; sub: string }) {
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl bg-white p-6 h-64 flex flex-col">
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-bold text-slate-900">{title}</h4>
        <BarChart3 className="w-3.5 h-3.5 text-slate-300" />
      </div>
      <p className="text-[10px] text-slate-400 mb-auto">{sub}</p>
      <div className="flex items-end justify-between h-32 gap-2 mt-4">
        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
          <div key={i} className="bg-slate-100 w-full rounded-t-sm relative overflow-hidden h-full">
            <div 
              className="absolute bottom-0 bg-slate-900 w-full transition-all duration-700 ease-in-out" 
              style={{ height: `${h}%` }} 
            />
          </div>
        ))}
      </div>
    </Card>
  );
}


function KeywordRow({ rank, keyword, channel, traffic, isUp }: any) {
  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      <td className="px-6 py-5 text-xs font-semibold text-slate-400">{rank}</td>
      <td className="px-6 py-5">
        <span className="text-sm font-semibold text-slate-900">{keyword}</span>
      </td>
      <td className="px-6 py-5">
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md font-bold uppercase tracking-tight">
          {channel}
        </span>
      </td>
      <td className="px-6 py-5">
        <TrendBadge trend={traffic} isUp={isUp} />
      </td>
      <td className="px-6 py-5 text-right">
        <button className="text-slate-300 hover:text-slate-900 transition-colors p-1">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}