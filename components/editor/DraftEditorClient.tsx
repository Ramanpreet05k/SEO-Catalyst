"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Save, Send, Wand2, ArrowLeft, Bot, PlusCircle, LayoutPanelLeft, CheckCircle2, Circle, ChevronDown, Copy, ShieldCheck, MessageSquare, User, Search, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestAiEdit, saveDraftManually, submitForReview, rejectToInProgress, addComment, resolveComment } from "@/app/actions/draft";
import { analyzeDraftForAEO } from "@/app/actions/aeo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { PublishModal } from "@/components/editor/PublishModal";
import RichTextEditor from "./RichTextEditor";
import { ExportPdfButton } from "@/components/editor/ExportPdfButton";

export function DraftEditorClient({ 
  topic, 
  role,
  user
}: { 
  topic: any, 
  role: "OWNER" | "WRITER",
  user: any
}) {
  const [content, setContent] = useState(topic.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isRejecting, setIsRejecting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  const router = useRouter();

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"Overview" | "Entities" | "Feedback">("Overview");

  // AEO State
  const [aeoData, setAeoData] = useState<any>(null);
  const [isAeoLoading, setIsAeoLoading] = useState(false);
  const [isAeoModalOpen, setIsAeoModalOpen] = useState(false); // <-- NEW STATE

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter((w: string) => w).length, [content]);
  
  const targetEntities = useMemo(() => {
    const list = [topic.coreEntity, ...(topic.suggestedEntities || [])];
    if (list.length === 1) list.push("Strategy", "Optimization", "Growth"); 
    return Array.from(new Set(list)); 
  }, [topic]);

  // --- ACTIONS ---
  const handleSave = async () => {
    setIsSaving(true);
    await saveDraftManually(topic.id, content);
    setIsSaving(false);
    router.refresh();
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setIsPostingComment(true);
    try {
        await addComment(topic.id, newComment, role, user?.name || "Team Member");
        setNewComment("");
        router.refresh();
    } catch (error) {
        alert("Failed to post comment.");
    } finally {
        setIsPostingComment(false);
    }
  };

  const handleResolve = async (commentId: string) => {
    try {
      await resolveComment(commentId, topic.id);
      router.refresh();
    } catch (error) {
      alert("Failed to resolve comment.");
    }
  }

  const handleSubmitForReview = async () => {
    setIsSubmitting(true);
    try {
      await handleSave(); 
      await submitForReview(topic.id);
      alert("Draft submitted for review!");
    } catch (error) {
      alert("Failed to submit for review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!confirm("Move back to 'In Progress'? Leave a comment in the Feedback tab so the writer knows what to change!")) return;
    setIsRejecting(true);
    try {
      await rejectToInProgress(topic.id);
      router.refresh();
    } catch (error) {
      alert("Failed to request changes.");
    } finally {
      setIsRejecting(false);
    }
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

  // --- AEO Analysis Handler ---
  const handleRunAeoAnalysis = async () => {
    if (wordCount < 50) {
      alert("Please write at least 50 words before running the AEO analysis.");
      return;
    }
    
    setIsAeoLoading(true);
    try {
      const result = await analyzeDraftForAEO(content);
      setAeoData(result);
      setIsAeoModalOpen(true); // Automatically open the big report on success
    } catch (error) {
      console.error(error);
      alert("Failed to analyze draft. Make sure your website URL is saved in Settings.");
    } finally {
      setIsAeoLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      
      {/* Editor Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/library" className="p-2 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                topic.status === 'Review' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                topic.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                'bg-indigo-50 text-indigo-600 border-indigo-100'
              }`}>
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

          <ExportPdfButton 
            targetId="document-content" 
            defaultFileName={topic.topicName || "Draft_Export"} 
          />

          <Button 
            onClick={handleSave} 
            disabled={isSaving || isPending}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save
          </Button>

          {role === "OWNER" && (
            <div className="flex items-center gap-2">
              {topic.status === "Review" && (
                <Button 
                  onClick={handleRequestChanges}
                  disabled={isRejecting}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold"
                >
                  {isRejecting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  Request Changes
                </Button>
              )}
              <PublishModal topicId={topic.id} isPublished={topic.status === "Published"} role={role} />
            </div>
          )}

          {role === "WRITER" && (
             <Button 
              onClick={handleSubmitForReview} 
              disabled={isSubmitting || topic.status === "Review" || topic.status === "Published"}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {topic.status === "Review" ? "Waiting for Approval" : "Submit for Review"}
            </Button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar flex justify-center relative bg-white border-r border-slate-200">
          <div id="document-content" className="w-full max-w-4xl relative bg-white p-4">
            {isPending && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl border border-indigo-100" data-html2canvas-ignore>
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse mb-4" />
                <h3 className="text-xl font-bold text-slate-900">AI is writing...</h3>
              </div>
            )}
            
            <div className="hidden print:block mb-8 border-b pb-4">
              <h1 className="text-3xl font-black text-slate-900">{topic.topicName}</h1>
              <p className="text-sm text-slate-500 mt-2">Core Entity: {topic.coreEntity}</p>
            </div>

            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </main>

        {isSidebarOpen && (
          <aside className="w-[420px] bg-white flex flex-col z-20 shrink-0" data-html2canvas-ignore>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-600" /> Analysis & Feedback
              </h3>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-slate-900 text-xl">&times;</button>
            </div>

            <div className="flex border-b border-slate-200">
              {["Overview", "Entities", "Feedback"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-3 text-[12px] font-bold border-b-2 transition-colors relative ${
                    activeTab === tab ? "border-indigo-600 text-indigo-900 bg-indigo-50/30" : "border-transparent text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {tab}
                  {tab === "Feedback" && (topic.comments?.filter((c:any) => !c.isResolved).length > 0) && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black">
                      {topic.comments?.filter((c:any) => !c.isResolved).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar text-slate-900">
                
                {activeTab === "Overview" && (
                  <div className="p-6 space-y-6 animate-in fade-in">
                      
                      {/* Word Count Box */}
                      <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm bg-white">
                          <div>
                              <h3 className="text-sm font-bold flex items-center gap-1">
                                  <ChevronDown className="w-4 h-4 text-slate-500" /> Words
                              </h3>
                              <p className="text-[11px] text-slate-500 ml-5">Total word count</p>
                          </div>
                          <span className="text-2xl font-bold text-slate-900">{wordCount.toLocaleString()}</span>
                      </div>

                      <hr className="border-slate-100" />

                      {/* AEO Engine Section (Sidebar Summary) */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
                            <Bot className="w-4 h-4 text-indigo-600" /> Answer Engine Optimization
                          </h3>
                        </div>

                        {!aeoData ? (
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center shadow-inner">
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                              Analyze this draft against your live website's brand tone to see if AI search engines will cite it as an authoritative source.
                            </p>
                            <Button 
                              onClick={handleRunAeoAnalysis}
                              disabled={isAeoLoading}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 shadow-sm"
                            >
                              {isAeoLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                              {isAeoLoading ? "Analyzing..." : "Run AEO Audit"}
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-in slide-in-from-bottom-2">
                            {/* Summary Card */}
                            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                              <div className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center text-xl font-black border-4 ${
                                aeoData.informationGainScore > 80 ? 'border-emerald-500 text-emerald-600' : 
                                aeoData.informationGainScore > 50 ? 'border-amber-500 text-amber-600' : 
                                'border-rose-500 text-rose-600'
                              }`}>
                                {aeoData.informationGainScore}
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Information Gain</p>
                                <p className="text-xs font-medium text-slate-900 leading-snug mt-1">{aeoData.verdict}</p>
                              </div>
                            </div>

                            {/* Button to open the BIG report */}
                            <Button 
                              onClick={() => setIsAeoModalOpen(true)}
                              className="w-full bg-slate-900 hover:bg-black text-white font-bold h-10 shadow-sm"
                            >
                              <FileText className="w-4 h-4 mr-2" /> View Detailed Report
                            </Button>

                            <Button 
                              onClick={handleRunAeoAnalysis}
                              disabled={isAeoLoading}
                              variant="outline"
                              className="w-full h-9 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
                            >
                              {isAeoLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Re-run Analysis"}
                            </Button>
                          </div>
                        )}
                      </div>
                  </div>
                )}

                {/* Entities & Feedback Tabs remain exactly the same... */}
                {activeTab === "Entities" && (
                    <div className="p-6 space-y-4 animate-in fade-in">
                        <p className="text-xs text-slate-500 font-medium">Entities found in content:</p>
                        <div className="flex flex-wrap gap-2">
                            {targetEntities.map(e => (
                                <span key={e} className={`px-2 py-1 rounded-md border text-[11px] font-bold ${content.toLowerCase().includes(e.toLowerCase()) ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                    {e}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === "Feedback" && (
                    <div className="flex flex-col h-full animate-in fade-in">
                        <div className="p-4 space-y-4 flex-1">
                            {topic.comments?.length === 0 ? (
                                <div className="text-center py-20">
                                    <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400 italic">No feedback for this draft yet.</p>
                                </div>
                            ) : (
                                topic.comments.map((comment: any) => (
                                    <div key={comment.id} className={`p-4 rounded-2xl border transition-all ${comment.isResolved ? 'bg-slate-50/50 border-slate-100 opacity-60' : comment.role === 'OWNER' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className={`p-1 rounded-md ${comment.isResolved ? 'bg-slate-300' : comment.role === 'OWNER' ? 'bg-amber-500' : 'bg-slate-500'}`}>
                                                <User className="w-3 h-3 text-white" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-tighter text-slate-600">
                                                {comment.role}
                                            </span>
                                            {comment.isResolved && (
                                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">Resolved</span>
                                            )}
                                            <span className="text-[9px] text-slate-400 ml-auto">
                                                {new Date(comment.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${comment.isResolved ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{comment.text}</p>
                                        
                                        {!comment.isResolved && (
                                          <button 
                                            onClick={() => handleResolve(comment.id)}
                                            className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                                          >
                                            <CheckCircle2 className="w-3 h-3" /> Mark as Resolved
                                          </button>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-white sticky bottom-0">
                            <textarea 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a note or request a change..."
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                            />
                            <Button 
                                onClick={handlePostComment}
                                disabled={isPostingComment || !newComment.trim()}
                                className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-10 shadow-sm"
                            >
                                {isPostingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Feedback"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
          </aside>
        )}
      </div>

      {/* --- BIG AEO AUDIT REPORT MODAL --- */}
      <Dialog open={isAeoModalOpen} onOpenChange={setIsAeoModalOpen}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col rounded-2xl p-0 overflow-hidden border-0 shadow-2xl bg-slate-50">
          
          {/* Report Header */}
          <div className="bg-slate-900 p-8 text-white shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <Bot className="w-8 h-8 text-indigo-400" />
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight text-white">AEO Analysis Report</DialogTitle>
                <p className="text-slate-400 text-sm mt-1">Answer Engine Optimization insights for: <span className="text-white font-medium">{topic.topicName}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
              <div className={`w-20 h-20 shrink-0 rounded-full flex items-center justify-center text-3xl font-black border-4 ${
                  aeoData?.informationGainScore > 80 ? 'border-emerald-500 text-emerald-400' : 
                  aeoData?.informationGainScore > 50 ? 'border-amber-500 text-amber-400' : 
                  'border-rose-500 text-rose-400'
                }`}>
                  {aeoData?.informationGainScore}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Information Gain Score</h3>
                <p className="text-slate-300 leading-relaxed">{aeoData?.verdict}</p>
              </div>
            </div>
          </div>

          {/* Report Body (2 Columns) */}
          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar flex gap-8">
            
            {/* Left Column: Missing Angles */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-slate-900">Missing Angles</h3>
              </div>
              <p className="text-sm text-slate-600">To increase your chances of being cited as a unique source, consider weaving these concepts into your draft:</p>
              
              <div className="grid gap-4">
                {aeoData?.missingAngles?.map((angle: string, i: number) => (
                  <div key={i} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex items-start gap-4">
                    <div className="bg-amber-100 text-amber-700 w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-800 leading-relaxed">{angle}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: AI Snippet Preview (Simulated UI) */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Search Engine View</h3>
              </div>
              <p className="text-sm text-slate-600">How an AI like Perplexity or Google SGE might summarize your current draft.</p>
              
              {/* Simulated SGE Box */}
              <div className="bg-[#f0f4f9] border border-[#e8eaed] p-6 rounded-3xl relative">
                <div className="absolute top-6 right-6">
                  <Sparkles className="w-6 h-6 text-[#1a73e8]" />
                </div>
                <h4 className="font-medium text-[#202124] text-lg mb-4 pr-12">AI Overview</h4>
                
                <div className="text-[#4d5156] text-[15px] leading-[1.6] space-y-4 font-sans">
                   {/* We split the snippet by newlines to render paragraphs naturally */}
                  {aeoData?.llmOptimizedSnippet?.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[#e8eaed] flex gap-2">
                  <span className="bg-white border border-[#e8eaed] text-[#3c4043] text-xs px-3 py-1.5 rounded-full font-medium shadow-sm">
                    Sources
                  </span>
                  <span className="bg-white border border-indigo-200 text-indigo-700 text-xs px-3 py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Your Website
                  </span>
                </div>
              </div>

            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Edit Modal remains the same */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
            <Sparkles className="w-8 h-8 mb-4 text-indigo-200" />
            <DialogTitle className="text-2xl font-bold tracking-tight mb-2 text-white">AI Brand Editor</DialogTitle>
            <p className="text-indigo-100 text-sm">Edits will automatically adhere to your saved Brand Guidelines.</p>
          </div>
          <div className="p-8 bg-white">
            <textarea 
                value={instruction} 
                onChange={(e) => setInstruction(e.target.value)} 
                placeholder="How should I improve this article?"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32 text-slate-800"
            />
            <Button 
                onClick={() => handleAiEdit()}
                disabled={isPending || !instruction.trim()}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
                Apply AI Rewrite
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}