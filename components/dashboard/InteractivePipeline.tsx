"use client";

import React, { useState } from "react";
import { Zap, Target, CheckCircle2, Clock, MoreHorizontal, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Topic {
  id: string;
  topicName: string;
  status: string;
  priority: string;
  coreEntity: string;
}

export function InteractivePipeline({ initialTopics }: { initialTopics: Topic[] }) {
  // 1. State for Interactive Filtering
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);

  // 2. True Semantic Mapping: Group topics by their Core Entity
  const entityMap = initialTopics.reduce((acc, topic) => {
    const entityName = topic.coreEntity || "General";
    if (!acc[entityName]) acc[entityName] = [];
    acc[entityName].push(topic);
    return acc;
  }, {} as Record<string, Topic[]>);

  // 3. Analytics & Gap Analysis Logic
  const entities = Object.keys(entityMap).map(entityName => {
    const topics = entityMap[entityName];
    const total = topics.length;
    const published = topics.filter(t => t.status === "Published").length;
    
    // Coverage Meter Math (%)
    const coverage = total === 0 ? 0 : Math.round((published / total) * 100);
    
    // Simulated Competitor Gap Analysis (In production, replace with real SERP data)
    const gapScore = Math.random(); 
    let gapStatus = "Owned"; // Green
    if (gapScore > 0.6) gapStatus = "Content Gap"; // Red (Competitors have it, you don't)
    else if (gapScore > 0.3) gapStatus = "Battleground"; // Yellow (Both have it)

    return { name: entityName, total, published, coverage, gapStatus };
  }).sort((a, b) => b.total - a.total);

  // 4. Apply Filter
  const displayedTopics = selectedEntity 
    ? initialTopics.filter(t => t.coreEntity === selectedEntity)
    : initialTopics;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
      
      {/* LEFT: AI TOPIC PIPELINE (Filtered) */}
      <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden flex flex-col">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                Content Pipeline
                {selectedEntity && (
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] rounded-md uppercase tracking-widest ml-2">
                    Filtered: {selectedEntity}
                  </span>
                )}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                {selectedEntity ? `Showing content mapped to "${selectedEntity}"` : "All generated content roadmap"}
              </p>
            </div>
            {selectedEntity && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedEntity(null)} className="text-slate-500 hover:text-slate-900 text-xs h-8 font-bold">
                Clear Filter
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-auto">
          <table className="w-full text-left">
            <thead className="bg-white text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">Topic Title</th>
                <th className="px-6 py-4">Entity Map</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedTopics.length > 0 ? (
                displayedTopics.map((topic) => (
                  <tr key={topic.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">{topic.topicName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md capitalize">
                        {topic.coreEntity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        {topic.status === "Published" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : 
                         topic.status === "In Progress" ? <Clock className="w-4 h-4 text-amber-500" /> : 
                         <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                        {topic.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-sm font-medium text-slate-500">No topics found for this entity.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* RIGHT: SEMANTIC ENTITIES (Interactive & Analyzed) */}
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
          <CardHeader className="py-5 border-b border-slate-50">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" /> Core Entities
              </div>
              <span className="text-[10px] font-normal text-slate-400">Click to filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {entities.length > 0 ? (
              entities.map((entity, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedEntity(selectedEntity === entity.name ? null : entity.name)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedEntity === entity.name 
                      ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500" 
                      : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-slate-900 capitalize">{entity.name}</span>
                    <div className="flex items-center gap-1.5" title={entity.gapStatus}>
                      <div className={`w-2 h-2 rounded-full ${
                        entity.gapStatus === 'Owned' ? 'bg-emerald-500' : 
                        entity.gapStatus === 'Battleground' ? 'bg-amber-400' : 'bg-rose-500'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Coverage Meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Coverage</span>
                      <span>{entity.coverage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                        style={{ width: `${entity.coverage}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-slate-400 flex flex-col items-center">
                <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                <span className="text-xs font-medium">No entities mapped yet.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}