"use client";

import { useState, useEffect } from "react";
import { Loader2, Zap, ShieldCheck, AlertTriangle, Lightbulb, Check, X, BarChart3 } from "lucide-react";
import { runGapAnalysis } from "@/app/actions/competitor";

export function DetailedAnalysisClient({ competitorId }: { competitorId: string }) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await runGapAnalysis(competitorId);
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to run analysis.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [competitorId]);

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <Zap className="absolute inset-0 m-auto w-6 h-6 text-indigo-600 animate-pulse" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Generating Deep Dive...</h3>
        <p className="text-slate-500">Scraping both websites and analyzing semantic gaps. This takes about 5 seconds.</p>
      </div>
    );
  }

  if (error) {
    return <div className="bg-rose-50 text-rose-700 p-6 rounded-xl border border-rose-200 font-medium">{error}</div>;
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* 1. THE VISUAL SCORE METER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><BarChart3 className="w-5 h-5" /></div>
          <h2 className="text-lg font-bold text-slate-900">Semantic SEO Score</h2>
        </div>
        
        <div className="space-y-6">
          {/* User Score Bar */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-700">Your Website</span>
              <span className="text-indigo-600">{data.scores.userScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-indigo-500 h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${data.scores.userScore}%` }}
              ></div>
            </div>
          </div>
          
          {/* Competitor Score Bar */}
          <div>
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-slate-700">Competitor</span>
              <span className="text-slate-500">{data.scores.compScore}/100</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-slate-400 h-4 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${data.scores.compScore}%` }}
              ></div>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-6 pt-4 border-t border-slate-100">
          <span className="font-bold text-slate-700">AI Verdict:</span> {data.scores.reasoning}
        </p>
      </div>

      {/* 2. THE HEAD-TO-HEAD TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900">Head-to-Head Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">SEO / Content Feature</th>
                <th className="px-6 py-4 text-center border-l border-slate-100">Your Site</th>
                <th className="px-6 py-4 text-center border-l border-slate-100">Competitor</th>
              </tr>
            </thead>
            <tbody>
              {data.featureComparison.map((item: any, i: number) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{item.feature}</td>
                  <td className="px-6 py-4 text-center border-l border-slate-100">
                    {item.userStatus === "Yes" 
                      ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> 
                      : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                  <td className="px-6 py-4 text-center border-l border-slate-100">
                    {item.compStatus === "Yes" 
                      ? <Check className="w-5 h-5 text-rose-500 mx-auto" /> 
                      : <X className="w-5 h-5 text-slate-300 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. THE STRATEGY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl shadow-sm">
          <h4 className="flex items-center gap-2 font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">
            <ShieldCheck className="w-4 h-4" /> Where You Win
          </h4>
          <ul className="space-y-4">
            {data.myAdvantages.map((adv: string, i: number) => (
              <li key={i} className="text-sm text-emerald-900 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 mt-0.5 font-bold">•</span> {adv}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-2xl shadow-sm">
          <h4 className="flex items-center gap-2 font-bold text-rose-800 mb-4 uppercase tracking-wider text-xs">
            <AlertTriangle className="w-4 h-4" /> Where They Win
          </h4>
          <ul className="space-y-4">
            {data.competitorAdvantages.map((adv: string, i: number) => (
              <li key={i} className="text-sm text-rose-900 flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 mt-0.5 font-bold">•</span> {adv}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm md:mt-0 mt-4">
          <h4 className="flex items-center gap-2 font-bold text-indigo-300 mb-4 uppercase tracking-wider text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Action Plan
          </h4>
          <ul className="space-y-4">
            {data.actionPlan.map((sol: string, i: number) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-3 leading-relaxed">
                <span className="text-indigo-400 font-bold bg-indigo-500/10 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 text-[10px]">{i + 1}</span> 
                {sol}
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  );
}