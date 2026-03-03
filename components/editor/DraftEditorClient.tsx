"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Save, Send, Wand2, ArrowLeft, Bot, PlusCircle, LayoutPanelLeft, CheckCircle2, Circle, ChevronDown, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestAiEdit, saveDraftManually } from "@/app/actions/draft";
import { analyzeDraftForAEO } from "@/app/actions/aeo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { PublishModal } from "@/components/editor/PublishModal";

const QUICK_ACTIONS = [
  "Fix grammar and spelling",
  "Make it sound more professional",
  "Expand this into a longer article",
  "Make it more concise and punchy"
];

export function DraftEditorClient({ topic }: { topic: any }) {
  const [content, setContent] = useState(topic.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"Overview" | "Entities">("Overview");

  // AEO State
  const [aeoData, setAeoData] = useState<any>(null);
  const [isAeoLoading, setIsAeoLoading] = useState(false);

  // --- REAL-TIME SEO METRICS CALCULATION ---
  const wordCount = useMemo(() => content.trim().split(/\s+/).filter((w: string) => w).length, [content]);
  
  // Parse dynamic headings list
  const headingsList = useMemo(() => {
    const lines = content.split('\n');
    const headings: { level: number, text: string }[] = [];
    lines.forEach((line: string) => {
      const match = line.match(/^(#{1,3})\s+(.*)/);
      if (match) {
        headings.push({
          level: match[1].length,
          text: match[2].trim()
        });
      }
    });
    return headings;
  }, [content]);

  const h1Count = headingsList.filter(h => h.level === 1).length;
  const h2Count = headingsList.filter(h => h.level === 2).length;
  const h3Count = headingsList.filter(h => h.level === 3).length;
  
  const targetEntities = useMemo(() => {
    const list = [topic.coreEntity, ...(topic.suggestedEntities || [])];
    if (list.length === 1) list.push("Strategy", "Optimization", "Growth"); 
    return Array.from(new Set(list)); 
  }, [topic]);

  const completedEntitiesCount = useMemo(() => {
    return targetEntities.filter(entity => content.toLowerCase().includes(entity.toLowerCase())).length;
  }, [content, targetEntities]);

  // --- MOCK METADATA GENERATION ---
  const metaSlug = topic.topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const metaDescription = `Learn everything you need to know about ${topic.topicName}. Explore the best strategies, tips, and insights to optimize your workflow and drive better results.`;

  // --- ACTIONS ---
  const handleSave = async () => {
    setIsSaving(true);
    await saveDraftManually(topic.id, content);
    setIsSaving(false);
    router.refresh();
  };

  const handleAiEdit = (customInstruction?: string) => {
    const promptToUse = customInstruction || instruction;
    if (!promptToUse.trim()) return;

    startTransition(async () => {
      try {
        const result = await requestAiEdit(topic.id, content, promptToUse);
        setContent(result.content);
        setInstruction("");
        setIsModalOpen(false);
      } catch (error) {
        alert("Failed to apply AI edits.");
      }
    });
  };

  const runAEO = async () => {
    if (!content.trim()) return alert("Write some content first!");
    setIsAeoLoading(true);
    try {
      const data = await analyzeDraftForAEO(content);
      setAeoData(data);
    } catch (error) {
      alert("AEO Analysis failed.");
    } finally {
      setIsAeoLoading(false);
    }
  };

  const injectLlmSnippet = () => {
    if (!aeoData?.llmOptimizedSnippet) return;
    const injection = `\n\n## Quick Summary for Answer Engines\n${aeoData.llmOptimizedSnippet}\n`;
    setContent((prev: string) => prev + injection);
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      
      {/* Editor Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/topics" className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                {topic.status}
              </span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-1 line-clamp-1 max-w-xl">{topic.topicName}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200"
          >
            <LayoutPanelLeft className="w-4 h-4 mr-2" /> 
            {isSidebarOpen ? "Close Panel" : "Score & Optimize"}
          </Button>

          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200"
          >
            <Wand2 className="w-4 h-4 mr-2" /> AI Edit
          </Button>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || isPending}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>

          <PublishModal topicId={topic.id} isPublished={topic.status === "Published"} />
        </div>
      </header>

      {/* Editor Layout (Canvas + Sidebar) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Main Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar flex justify-center relative bg-white">
          <div className="w-full max-w-4xl relative">
            {isPending && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl border border-indigo-100">
                <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                  <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">AI is writing...</h3>
                <p className="text-sm text-slate-500">Applying your brand guidelines to the draft.</p>
              </div>
            )}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="# Start writing your article here..."
              className="w-full h-full min-h-[800px] bg-white border-0 focus:ring-0 resize-none text-slate-800 text-[17px] leading-relaxed custom-scrollbar"
              style={{ fontFamily: "Inter, sans-serif" }}
            />
          </div>
        </main>

        {/* Unified Sidebar */}
        {isSidebarOpen && (
          <aside className="w-[420px] bg-white border-l border-slate-200 flex flex-col animate-in slide-in-from-right-8 duration-300 z-20 shrink-0">
            
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" /> Content Analysis
              </h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 font-bold text-xl">&times;</button>
            </div>

            {/* Sidebar Tabs */}
            <div className="flex border-b border-slate-200">
              <button 
                onClick={() => setActiveTab("Overview")}
                className={`flex-1 py-3 text-[13px] font-bold border-b-2 transition-colors ${activeTab === "Overview" ? "border-indigo-600 text-indigo-900 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Overview & Structure
              </button>
              <button 
                onClick={() => setActiveTab("Entities")}
                className={`flex-1 py-3 text-[13px] font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === "Entities" ? "border-indigo-600 text-indigo-900 bg-indigo-50/30" : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                Target Entities
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${completedEntitiesCount === targetEntities.length ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {completedEntitiesCount}/{targetEntities.length}
                </span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
              
              {activeTab === "Overview" && (
                <div className="space-y-4 animate-in fade-in">
                  {/* --- SECTION 1: WORDS CARD --- */}
                  <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                        <ChevronDown className="w-4 h-4 text-slate-500" /> Words
                      </h3>
                      <p className="text-[11px] text-slate-500 ml-5 mt-0.5">Total words in current draft</p>
                    </div>
                    <span className="text-2xl font-bold text-slate-900 tracking-tight">{wordCount.toLocaleString()}</span>
                  </div>

                  {/* --- SECTION 2: METADATA CARD --- */}
                  <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
                    <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Metadata</h3>
                    <p className="text-[11px] text-slate-500 mb-5 leading-relaxed">Defines how this page appears in search and AI summaries.</p>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">Meta Title</span>
                          <button className="text-slate-400 hover:text-slate-900 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                        <p className="text-[13px] text-slate-800 font-medium leading-snug">{topic.topicName}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">Meta Description</span>
                          <button className="text-slate-400 hover:text-slate-900 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                        <p className="text-[13px] text-slate-800 leading-relaxed line-clamp-3">{metaDescription}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-slate-500">URL Slug</span>
                          <button className="text-slate-400 hover:text-slate-900 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        </div>
                        <p className="text-[13px] text-slate-800 font-medium">{metaSlug}</p>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 3: HEADINGS LIST CARD --- */}
                  <div className="border border-slate-200 rounded-xl p-0 shadow-sm overflow-hidden">
                    <div className="p-4 flex justify-between items-center border-b border-slate-100">
                      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">Headings</h3>
                      <span className="text-xs font-medium text-slate-500">{headingsList.length} Total</span>
                    </div>
                    
                    <div className="p-4 space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                      {headingsList.length === 0 ? (
                        <p className="text-sm text-slate-400 italic text-center py-4">No headings found. Use # for H1, ## for H2.</p>
                      ) : (
                        headingsList.map((h, i) => (
                          <div key={i} className="flex gap-3 bg-slate-50/80 p-3 rounded-lg border border-slate-100 items-start">
                            <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5 w-4 text-center">h{h.level}</span>
                            <span className={`text-[13px] font-semibold text-slate-800 leading-snug ${h.level === 1 ? 'text-[14px] font-bold text-black' : ''}`}>
                              {h.text}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex justify-around items-center py-3 border-t border-slate-100 text-center bg-slate-50/50">
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold mb-0.5">h1</p>
                        <p className="text-sm font-bold text-slate-900">{h1Count.toString().padStart(2, '0')}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold mb-0.5">h2</p>
                        <p className="text-sm font-bold text-slate-900">{h2Count.toString().padStart(2, '0')}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-400 font-bold mb-0.5">h3</p>
                        <p className="text-sm font-bold text-slate-900">{h3Count.toString().padStart(2, '0')}</p>
                      </div>
                    </div>
                  </div>

                  {/* --- SECTION 4: AEO ENGINE --- */}
                  <div className="pt-4 pb-6">
                    <h4 className="text-[13px] font-bold text-slate-900 mb-3 tracking-tight flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-600" /> Answer Engine Optimization
                    </h4>
                    
                    {!aeoData && !isAeoLoading && (
                      <div className="text-center py-6 bg-purple-50/50 rounded-xl border border-purple-100">
                        <p className="text-xs text-purple-700/80 font-medium mb-4 px-6 leading-relaxed">Scan your draft for Information Gain to ensure it stands out to AI bots.</p>
                        <Button onClick={runAEO} className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm h-9 text-xs">
                          Run AEO Scan
                        </Button>
                      </div>
                    )}

                    {isAeoLoading && (
                      <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 border border-purple-100 rounded-xl bg-purple-50/30">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                        <p className="text-xs font-medium text-slate-500">Analyzing brand alignment...</p>
                      </div>
                    )}

                    {aeoData && !isAeoLoading && (
                      <div className="space-y-6 animate-in fade-in">
                        <div className="text-center p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
                          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-[6px] border-purple-100 mb-3 relative">
                            <span className="text-2xl font-extrabold text-purple-700">{aeoData.informationGainScore}</span>
                          </div>
                          <p className="text-[13px] font-bold text-slate-900">Information Gain Score</p>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed px-2">{aeoData.verdict}</p>
                        </div>

                        <Button onClick={runAEO} variant="outline" className="w-full text-xs font-bold text-purple-700 border-purple-200 hover:bg-purple-50 h-9">
                          Rescan Draft
                        </Button>

                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Missing Angles:</h4>
                          <ul className="space-y-2">
                            {aeoData.missingAngles?.map((angle: string, i: number) => (
                              <li key={i} className="text-[13px] text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                                {angle}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LLM-Optimized Snippet</h4>
                          <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-xl">
                            <p className="text-[11px] leading-relaxed text-purple-900 whitespace-pre-wrap">{aeoData.llmOptimizedSnippet}</p>
                          </div>
                          <Button 
                            onClick={injectLlmSnippet}
                            className="w-full mt-3 bg-slate-900 hover:bg-black text-white font-bold h-9 text-xs"
                          >
                            <PlusCircle className="w-4 h-4 mr-2" /> Append to Draft
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "Entities" && (
                <div className="animate-in fade-in space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-1">Keyword Coverage</h3>
                    <p className="text-xs text-slate-500">Include these entities naturally within your content to improve semantic relevance.</p>
                  </div>
                  
                  <ul className="space-y-2">
                    {targetEntities.map((entity, i) => {
                      const isIncluded = content.toLowerCase().includes(entity.toLowerCase());
                      return (
                        <li key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isIncluded ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                          {isIncluded ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2.5} />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className={`text-[13px] font-semibold ${isIncluded ? 'text-emerald-800' : 'text-slate-700'}`}>
                            {entity}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

            </div>
          </aside>
        )}
      </div>

      {/* AI Edit Request Modal (Unchanged) */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
            <Sparkles className="w-8 h-8 mb-4 text-indigo-200" />
            <DialogTitle className="text-2xl font-bold tracking-tight mb-2">AI Brand Editor</DialogTitle>
            <p className="text-indigo-100 text-sm">Edits will automatically adhere to your saved Brand Guidelines.</p>
          </div>
          <div className="p-8 bg-white">
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Suggested Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleAiEdit(action)}
                    disabled={isPending}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Or type custom instructions</label>
              <div className="relative">
                <textarea 
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 custom-scrollbar"
                />
                <Button 
                  onClick={() => handleAiEdit()}
                  disabled={!instruction.trim() || isPending}
                  size="icon"
                  className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-8 w-8"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}