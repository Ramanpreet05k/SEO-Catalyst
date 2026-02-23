"use client";

import { useState, useEffect } from "react";
import { runSeoAudit, SEOIssue } from "@/app/actions/optimization";
import { ChevronDown, ChevronUp, FileText, Wrench, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OptimizationPage() {
  const [issues, setIssues] = useState<SEOIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>("missing-h1"); // Auto-expand first item
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  useEffect(() => {
    async function fetchAudit() {
      try {
        const results = await runSeoAudit();
        setIssues(results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAudit();
  }, []);

  const criticalCount = issues.filter(i => i.type === "critical").length;
  const warningCount = issues.filter(i => i.type === "warning").length;
  const passedCount = issues.filter(i => i.type === "passed").length;

  const filteredIssues = issues.filter(i => {
    if (i.type === "passed") return false; // Hide passed items from the main list by default
    if (filter === "all") return true;
    return i.type === filter;
  });

  const handleMarkFixed = (id: string) => {
    // Optimistically remove it from the UI for now
    setIssues(prev => prev.filter(i => i.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="font-medium animate-pulse">Scanning your website structure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 max-w-4xl mx-auto">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-xl">
          <h3 className="font-bold text-lg mb-2">Audit Failed</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Critical Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Critical Issues</h3>
            <p className="text-xs text-slate-500 mb-4">Immediate Action Required</p>
            <div className="text-5xl font-semibold tracking-tight text-slate-900">{criticalCount}</div>
          </div>
          
          {/* Warnings Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Warnings</h3>
            <p className="text-xs text-slate-500 mb-4">Needs Improvement</p>
            <div className="text-5xl font-semibold tracking-tight text-slate-900">{warningCount}</div>
          </div>

          {/* Passed Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900">Passed Items</h3>
            <p className="text-xs text-slate-500 mb-4">Optimized</p>
            <div className="text-5xl font-semibold tracking-tight text-slate-900">{passedCount}</div>
          </div>
        </div>

        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Optimization Checklist</h2>
            <p className="text-sm text-slate-500 mt-0.5">Detailed fix recommendations for all detected issues</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === "all" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
            >
              All Issues
            </button>
            <button 
              onClick={() => setFilter("critical")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === "critical" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
            >
              Critical Issues ({criticalCount})
            </button>
            <button 
              onClick={() => setFilter("warning")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === "warning" ? "bg-slate-900 text-white shadow-sm" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
            >
              Warnings ({warningCount})
            </button>
          </div>
        </div>

        {/* ISSUES LIST */}
        <div className="space-y-4">
          {filteredIssues.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl border-dashed">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-900">You're all clear!</h3>
              <p className="text-slate-500">No issues found for the selected filter.</p>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isExpanded = expandedId === issue.id;

              return (
                <div key={issue.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                  {/* Issue Header (Clickable) */}
                  <div 
                    onClick={() => setExpandedId(isExpanded ? null : issue.id)}
                    className="flex items-start md:items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-0.5">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-base font-bold text-slate-900">{issue.title}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            issue.type === 'critical' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">{issue.description}</p>
                      </div>
                    </div>
                    <div className="text-slate-400 p-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded Content Area */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-slate-50">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-100 mt-2">
                        <div className="flex items-start gap-3 mb-4">
                          <Wrench className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            {issue.whyItMatters && (
                              <div className="mb-4">
                                <h5 className="text-sm font-bold text-slate-900 mb-1">Why this matters</h5>
                                <p className="text-sm text-slate-600">{issue.whyItMatters}</p>
                              </div>
                            )}

                            {issue.howToFix && (
                              <div className="mb-4">
                                <h5 className="text-sm font-bold text-slate-900 mb-1">How to Fix</h5>
                                <ol className="text-sm text-slate-600 list-decimal pl-4 space-y-1">
                                  {issue.howToFix.map((step, idx) => (
                                    <li key={idx}>{step}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {issue.codeSnippet && (
                              <pre className="bg-white border border-slate-200 text-slate-600 text-xs p-4 rounded-lg overflow-x-auto mt-4 font-mono">
                                <code>{issue.codeSnippet}</code>
                              </pre>
                            )}
                          </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                          {issue.type === 'critical' ? (
                            <Button onClick={() => handleMarkFixed(issue.id)} className="bg-slate-900 hover:bg-black text-white rounded-lg px-6 font-bold">
                              Mark As Fixed
                            </Button>
                          ) : (
                            <Button className="bg-slate-900 hover:bg-black text-white rounded-lg px-6 font-bold flex items-center gap-2">
                              Generate With AI
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}