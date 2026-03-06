"use client";

import { useState, useTransition } from "react";
import { addCompetitor, deleteCompetitor, analyzeCompetitorGap, addSuggestedTopic } from "@/app/actions/competitors";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Trash2, Search, Zap, CheckCircle2, Globe, Sparkles, Target } from "lucide-react";

export function CompetitorManager({ initialCompetitors }: { initialCompetitors: any[] }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [gapResults, setGapResults] = useState<any[] | null>(null);
  const [addedTopics, setAddedTopics] = useState<string[]>([]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;
    startTransition(async () => {
      await addCompetitor(name, url);
      setName("");
      setUrl("");
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteCompetitor(id);
    });
  };

  const handleAnalyze = async (id: string, compUrl: string) => {
    setAnalyzingId(id);
    setGapResults(null);
    setAddedTopics([]); 
    try {
      const ideas = await analyzeCompetitorGap(compUrl);
      setGapResults(ideas);
    } catch (error) {
      alert("Failed to analyze competitor. They might be blocking bots.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleAddTopic = async (topicName: string, coreEntity: string) => {
    try {
      await addSuggestedTopic(topicName, coreEntity);
      setAddedTopics([...addedTopics, topicName]);
    } catch (error) {
      alert("Failed to add topic to pipeline.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Competitor List & Form */}
      <div className="lg:col-span-1 space-y-6">
        <form onSubmit={handleAdd} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-indigo-600" /> Track New Competitor
          </h3>
          <div className="space-y-4">
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Competitor Name" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <input 
              type="url" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://theirwebsite.com" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold h-11"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Competitor"}
            </Button>
          </div>
        </form>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700">Tracked Domains</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {initialCompetitors.length === 0 ? (
              <p className="p-6 text-sm text-slate-500 text-center">No competitors tracked yet.</p>
            ) : (
              initialCompetitors.map((comp) => (
                <div key={comp.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{comp.name}</p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3" /> {comp.url}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button 
                      onClick={() => handleAnalyze(comp.id, comp.url)}
                      disabled={analyzingId === comp.id}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-bold text-indigo-700 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
                    >
                      {analyzingId === comp.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Search className="w-3 h-3" />}
                    </Button>
                    <button 
                      onClick={() => handleDelete(comp.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right Column: AI Strategy Results */}
      <div className="lg:col-span-2">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[500px] flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-2xl flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold">Content Gap Analysis</h2>
              <p className="text-indigo-200 text-sm">Scan a competitor to reveal missing topics and strategic opportunities.</p>
            </div>
          </div>

          <div className="p-6 md:p-8 flex-1 bg-slate-50/50">
            {!analyzingId && !gapResults && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-4 py-20">
                <Target className="w-16 h-16 text-slate-200" />
                <p className="text-sm">Click the scan icon next to a competitor to generate topic ideas.</p>
              </div>
            )}

            {analyzingId && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 animate-in fade-in duration-500">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full animate-ping"></div>
                  <Search className="w-16 h-16 text-indigo-600 relative z-10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Scanning Domain Structure...</h3>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">AI is mapping their content strategy and identifying gaps you can exploit.</p>
                </div>
              </div>
            )}

            {gapResults && !analyzingId && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Strategic Opportunities Found
                </h3>
                
                {gapResults.map((idea, i) => (
                  <div key={i} className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:border-indigo-300 transition-colors flex flex-col lg:flex-row items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                          {idea.coreEntity}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2 leading-tight">{idea.topicName}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{idea.reason}</p>
                    </div>
                    
                    <Button
                      onClick={() => handleAddTopic(idea.topicName, idea.coreEntity)}
                      disabled={addedTopics.includes(idea.topicName)}
                      className={`shrink-0 font-bold ${
                        addedTopics.includes(idea.topicName) 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50' 
                          : 'bg-slate-900 hover:bg-black text-white'
                      }`}
                    >
                      {addedTopics.includes(idea.topicName) ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Added</>
                      ) : (
                        <><Plus className="w-4 h-4 mr-2" /> To Pipeline</>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}