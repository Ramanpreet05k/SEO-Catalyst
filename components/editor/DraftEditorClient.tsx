"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, Loader2, Save, Send, Bot, CheckCircle2, 
  ChevronDown, MessageSquare, User, Search, AlertCircle, 
  FileText, Library, ChevronRight, Target, PanelRightClose, X, PanelRight
} from "lucide-react";
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
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false); 
  const [isRejecting, setIsRejecting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  // NEW: Mobile Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const router = useRouter();

  // Sidebar State
  const [activeTab, setActiveTab] = useState<"Overview" | "Entities" | "Feedback">("Overview");

  // AEO State
  const [aeoData, setAeoData] = useState<any>(null);
  const [isAeoLoading, setIsAeoLoading] = useState(false);
  const [isAeoModalOpen, setIsAeoModalOpen] = useState(false);

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

  const handleAutoGenerate = () => {
    const entitiesList = targetEntities.join(", ");
    const instruction = `Write a comprehensive, professional, and SEO-optimized article about "${topic.topicName}". 
    CRITICAL: You MUST naturally weave in and explicitly cover ALL of the following key entities: ${entitiesList}. 
    Ensure the content is highly detailed, flows naturally, utilizes proper markdown headings (H2, H3), and provides maximum information gain.`;

    startTransition(async () => {
      try {
        const result = await requestAiEdit(topic.id, content, instruction);
        setContent(result.content);
      } catch (error) {
        alert("Failed to generate content.");
      }
    });
  };

  const handleRunAeoAnalysis = async () => {
    if (wordCount < 50) {
      alert("Please write at least 50 words before running the AEO analysis.");
      return;
    }
    
    setIsAeoLoading(true);
    try {
      const result = await analyzeDraftForAEO(content);
      setAeoData(result);
      setIsAeoModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze draft. Make sure your website URL is saved in Settings.");
    } finally {
      setIsAeoLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white selection:bg-indigo-100 selection:text-indigo-900 relative">
      
      {/* HEADER: Glassmorphism Breadcrumb Bar */}
      <header className="flex items-center justify-between px-3 md:px-6 py-3 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30 transition-all">
        
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 md:gap-2 text-sm text-slate-500 font-medium overflow-hidden">
          <Link href="/dashboard/library" className="hover:text-slate-900 flex items-center gap-1.5 transition-colors p-1.5 rounded-md hover:bg-slate-100/50 shrink-0">
            <Library className="w-4 h-4" /> 
            <span className="hidden sm:inline">Library</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-900 font-bold tracking-tight truncate max-w-[100px] sm:max-w-[150px] md:max-w-[300px]">
            {topic.topicName}
          </span>
          <span className={`ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 rounded-md text-[8px] md:text-[9px] font-bold uppercase tracking-widest border shrink-0 ${
            topic.status === 'Review' ? 'bg-amber-50 text-amber-600 border-amber-200/60' : 
            topic.status === 'Published' ? 'bg-emerald-50 text-emerald-600 border-emerald-200/60' :
            'bg-indigo-50 text-indigo-600 border-indigo-200/60'
          }`}>
            {topic.status}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 md:gap-2.5 shrink-0">
          
          <Button 
            onClick={handleAutoGenerate}
            disabled={isPending}
            size="sm"
            className="bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200/60 shadow-sm transition-all px-2 md:px-3"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 md:mr-2 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 md:mr-2" />}
            <span className="hidden md:inline">{isPending ? "Generating..." : "Auto-Generate"}</span>
          </Button>

          <div className="hidden sm:block">
            <ExportPdfButton targetId="document-content" defaultFileName={topic.topicName || "Draft"} />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isSaving || isPending}
            size="sm"
            className="bg-white border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold shadow-sm transition-all px-2 md:px-3"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin md:mr-2" /> : <Save className="w-3.5 h-3.5 md:mr-2" />}
            <span className="hidden md:inline">Save</span>
          </Button>

          {role === "OWNER" && (
            <div className="flex items-center gap-1.5 md:gap-2">
              {topic.status === "Review" && (
                <Button 
                  onClick={handleRequestChanges}
                  disabled={isRejecting}
                  size="sm"
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/60 font-semibold shadow-sm px-2 md:px-3 hidden sm:flex"
                >
                  {isRejecting ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> : <AlertCircle className="w-3.5 h-3.5 mr-2" />}
                  Reject
                </Button>
              )}
              <PublishModal topicId={topic.id} isPublished={topic.status === "Published"} role={role} />
            </div>
          )}

          {role === "WRITER" && (
             <Button 
              onClick={handleSubmitForReview} 
              disabled={isSubmitting || topic.status === "Review" || topic.status === "Published"}
              size="sm"
              className="bg-slate-900 hover:bg-black text-white font-semibold shadow-sm transition-all px-2 md:px-3"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin sm:mr-2" /> : <Send className="w-3.5 h-3.5 sm:mr-2" />}
              <span className="hidden sm:inline">{topic.status === "Review" ? "In Review" : "Submit"}</span>
            </Button>
          )}

          {/* Mobile Sidebar Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden ml-1 text-slate-500 hover:text-slate-900"
          >
            <PanelRight className="w-5 h-5" />
          </Button>

        </div>
      </header>

      {/* WORKSPACE AREA */}
      <div className="flex flex-1 overflow-hidden bg-[#FDFDFD] relative">
        
        {/* Main Canvas (Notion Style) */}
        <main className="flex-1 overflow-y-auto custom-scrollbar relative flex justify-center w-full">
          
          <div id="document-content" className="w-full max-w-3xl relative px-5 py-8 sm:px-8 sm:py-12 md:px-12 md:py-24">
            
            {isPending && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-3xl" data-html2canvas-ignore>
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200/60 flex flex-col items-center text-center mx-4">
                  <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse mb-4" />
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">AI is writing content...</h3>
                  <p className="text-slate-500 mt-1 text-xs font-medium">Weaving in your target entities.</p>
                </div>
              </div>
            )}
            
            {/* Document Header */}
            <div className="mb-8 md:mb-12 group relative">
              <div className="flex items-center gap-2 mb-3 md:mb-4">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 md:px-2.5 md:py-1 rounded-md text-[9px] md:text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 w-fit">
                  <Target className="w-3 h-3" /> {topic.coreEntity}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] outline-none placeholder:text-slate-300">
                {topic.topicName}
              </h1>
            </div>

            {/* Rich Text Editor */}
            <div className="prose prose-slate prose-base sm:prose-lg max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-a:text-indigo-600 hover:prose-a:text-indigo-500 prose-img:rounded-2xl prose-img:border prose-img:border-slate-200/60">
              <RichTextEditor content={content} onChange={setContent} />
            </div>
          </div>
        </main>

        {/* MOBILE OVERLAY */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR: Intelligence & Feedback */}
        <aside className={`
          fixed inset-y-0 right-0 z-50 w-[85%] sm:w-[380px] bg-[#FAFAFA] border-l border-slate-200/60 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:shadow-[-4px_0_24px_rgba(0,0,0,0.02)] lg:z-20 lg:shrink-0
          ${isMobileSidebarOpen ? "translate-x-0" : "translate-x-full"}
        `} data-html2canvas-ignore>
          
          {/* Sidebar Header */}
          <div className="p-4 md:p-5 border-b border-slate-200/60 bg-white/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 tracking-tight text-sm md:text-base">
              <Bot className="w-4 h-4 text-indigo-600" /> Intelligence Panel
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden h-8 w-8 text-slate-500 hover:text-slate-900"
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* iOS-Style Segmented Controller */}
          <div className="p-3 bg-white/50 border-b border-slate-200/60">
            <div className="flex p-1 bg-slate-100/80 rounded-xl">
              {["Overview", "Entities", "Feedback"].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex-1 py-1.5 text-[11px] md:text-xs font-bold rounded-lg transition-all relative ${
                    activeTab === tab 
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {tab === "Feedback" && (topic.comments?.filter((c:any) => !c.isResolved).length > 0) && (
                    <span className="absolute top-1 right-2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-rose-500"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 lg:pb-0">
              
              {/* --- OVERVIEW TAB --- */}
              {activeTab === "Overview" && (
                <div className="p-4 md:p-5 space-y-6 animate-in fade-in duration-300">
                    
                    {/* Stat Card */}
                    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-200/60">
                        <div className="flex justify-between items-center">
                          <div>
                              <h3 className="text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                 Word Count
                              </h3>
                              <span className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">{wordCount.toLocaleString()}</span>
                          </div>
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                            <FileText className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                          </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200/60" />

                    {/* AEO Card */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Answer Engine Score</h3>
                      </div>

                      {!aeoData ? (
                        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 md:p-5 text-center shadow-sm">
                          <p className="text-[11px] md:text-xs text-slate-500 mb-4 font-medium leading-relaxed">
                            Evaluate this draft against your site's tone to see if AI engines will cite it as an authority.
                          </p>
                          <Button 
                            onClick={handleRunAeoAnalysis}
                            disabled={isAeoLoading}
                            className="w-full bg-slate-900 hover:bg-black text-white font-semibold h-9 shadow-sm text-xs md:text-sm"
                          >
                            {isAeoLoading ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin mr-2" /> : <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />}
                            {isAeoLoading ? "Running Audit..." : "Run AEO Audit"}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 animate-in slide-in-from-bottom-2">
                          <div className="flex items-center gap-3 md:gap-4 bg-white p-3 md:p-4 rounded-2xl border border-slate-200/60 shadow-sm">
                            <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center text-base md:text-lg font-black border-[3px] md:border-4 ${
                              aeoData.informationGainScore > 80 ? 'border-emerald-500 text-emerald-600' : 
                              aeoData.informationGainScore > 50 ? 'border-amber-500 text-amber-600' : 
                              'border-rose-500 text-rose-600'
                            }`}>
                              {aeoData.informationGainScore}
                            </div>
                            <div>
                              <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Information Gain</p>
                              <p className="text-[11px] md:text-xs font-semibold text-slate-900 leading-snug mt-0.5 line-clamp-2">{aeoData.verdict}</p>
                            </div>
                          </div>

                          <Button 
                            onClick={() => setIsAeoModalOpen(true)}
                            variant="outline"
                            className="w-full bg-white border-slate-200/60 text-slate-700 font-semibold h-9 shadow-sm text-xs md:text-sm"
                          >
                            View Full Report
                          </Button>

                          <Button 
                            onClick={handleRunAeoAnalysis}
                            disabled={isAeoLoading}
                            variant="ghost"
                            className="w-full h-8 text-[10px] md:text-[11px] font-bold text-slate-400 hover:text-slate-600"
                          >
                            {isAeoLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Re-run Analysis"}
                          </Button>
                        </div>
                      )}
                    </div>
                </div>
              )}

              {/* --- ENTITIES TAB --- */}
              {activeTab === "Entities" && (
                  <div className="p-4 md:p-5 space-y-4 animate-in fade-in duration-300">
                      <p className="text-[11px] md:text-xs text-slate-500 font-medium">Keywords injected into content:</p>
                      <div className="flex flex-wrap gap-1.5 md:gap-2">
                          {targetEntities.map(e => {
                            const isIncluded = content.toLowerCase().includes(e.toLowerCase());
                            return (
                              <span key={e} className={`px-2 md:px-2.5 py-1 md:py-1.5 rounded-lg border text-[10px] md:text-xs font-semibold flex items-center gap-1 md:gap-1.5 transition-colors ${
                                isIncluded 
                                  ? 'bg-emerald-50 border-emerald-200/60 text-emerald-700' 
                                  : 'bg-white border-slate-200/60 text-slate-500'
                              }`}>
                                {isIncluded && <CheckCircle2 className="w-3 h-3" />}
                                {e}
                              </span>
                            );
                          })}
                      </div>
                  </div>
              )}

              {/* --- FEEDBACK TAB --- */}
              {activeTab === "Feedback" && (
                  <div className="flex flex-col h-full animate-in fade-in duration-300">
                      <div className="p-4 md:p-5 space-y-3 md:space-y-4 flex-1">
                          {topic.comments?.length === 0 ? (
                              <div className="text-center py-12 md:py-16">
                                  <MessageSquare className="w-8 h-8 md:w-10 md:h-10 text-slate-200 mx-auto mb-2 md:mb-3" />
                                  <p className="text-xs md:text-sm font-medium text-slate-400">No feedback added yet.</p>
                              </div>
                          ) : (
                              topic.comments.map((comment: any) => (
                                  <div key={comment.id} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                                    comment.isResolved 
                                      ? 'bg-transparent border-slate-200/60 opacity-60' 
                                      : comment.role === 'OWNER' ? 'bg-amber-50/50 border-amber-200/60 shadow-sm' : 'bg-white border-slate-200/60 shadow-sm'
                                  }`}>
                                      <div className="flex items-center gap-2 mb-2">
                                          <div className={`p-1 md:p-1.5 rounded-lg ${comment.isResolved ? 'bg-slate-200 text-slate-500' : comment.role === 'OWNER' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                                              <User className="w-2.5 h-2.5 md:w-3 md:h-3" />
                                          </div>
                                          <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-600">
                                              {comment.role}
                                          </span>
                                          {comment.isResolved && (
                                            <span className="text-[8px] md:text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 md:px-1.5 py-0.5 rounded border border-emerald-100 uppercase tracking-widest ml-1">Resolved</span>
                                          )}
                                          <span className="text-[9px] md:text-[10px] font-medium text-slate-400 ml-auto">
                                              {new Date(comment.createdAt).toLocaleDateString()}
                                          </span>
                                      </div>
                                      <p className={`text-[11px] md:text-sm leading-relaxed mt-1 md:mt-2 ${comment.isResolved ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{comment.text}</p>
                                      
                                      {!comment.isResolved && (
                                        <button 
                                          onClick={() => handleResolve(comment.id)}
                                          className="mt-2 md:mt-3 text-[10px] md:text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                                        >
                                          <CheckCircle2 className="w-3 h-3 md:w-3.5 md:h-3.5" /> Mark Resolved
                                        </button>
                                      )}
                                  </div>
                              ))
                          )}
                      </div>
                      
                      {/* Comment Input */}
                      <div className="p-4 md:p-5 border-t border-slate-200/60 bg-white sticky bottom-0">
                          <textarea 
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a note..."
                              className="w-full p-2.5 md:p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-xs md:text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none resize-none h-16 md:h-20 placeholder:text-slate-400 transition-all"
                          />
                          <Button 
                              onClick={handlePostComment}
                              disabled={isPostingComment || !newComment.trim()}
                              size="sm"
                              className="w-full mt-2 md:mt-3 bg-slate-900 hover:bg-black text-white font-semibold shadow-sm text-xs md:text-sm h-8 md:h-9"
                          >
                              {isPostingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Post Note"}
                          </Button>
                      </div>
                  </div>
              )}
          </div>
        </aside>
      </div>

      {/* BIG AEO AUDIT REPORT MODAL */}
      <Dialog open={isAeoModalOpen} onOpenChange={setIsAeoModalOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90vh] md:h-[85vh] flex flex-col rounded-2xl md:rounded-3xl p-0 overflow-hidden border border-slate-200/60 shadow-2xl bg-white">
          <div className="bg-slate-900 p-6 md:p-8 text-white shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10 md:-mr-20 md:-mt-20"></div>
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4 md:mb-6 relative z-10">
              <Bot className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
              <div>
                <DialogTitle className="text-xl md:text-2xl font-black tracking-tight text-white">AEO Analysis Report</DialogTitle>
                <p className="text-slate-400 text-xs md:text-sm mt-0.5 md:mt-1">Insights for: <span className="text-white font-medium line-clamp-1">{topic.topicName}</span></p>
              </div>
            </div>

            <div className="flex items-center gap-4 md:gap-6 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 relative z-10">
              <div className={`w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-full flex items-center justify-center text-xl md:text-2xl font-black border-[3px] md:border-4 ${
                  aeoData?.informationGainScore > 80 ? 'border-emerald-500 text-emerald-400' : 
                  aeoData?.informationGainScore > 50 ? 'border-amber-500 text-amber-400' : 
                  'border-rose-500 text-rose-400'
                }`}>
                  {aeoData?.informationGainScore}
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white mb-0.5 md:mb-1 tracking-tight">Information Gain Score</h3>
                <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">{aeoData?.verdict}</p>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row gap-6 md:gap-8 bg-[#FAFAFA]">
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">Missing Angles</h3>
              </div>
              <p className="text-[11px] md:text-sm text-slate-500 font-medium">Consider weaving these concepts into your draft to increase citations:</p>
              
              <div className="grid gap-2.5 md:gap-3">
                {aeoData?.missingAngles?.map((angle: string, i: number) => (
                  <div key={i} className="bg-white border border-slate-200/60 p-3 md:p-4 rounded-xl shadow-sm flex items-start gap-3">
                    <div className="bg-amber-100 text-amber-700 w-5 h-5 md:w-6 md:h-6 rounded-md flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-700 text-[11px] md:text-sm leading-relaxed">{angle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 md:w-5 md:h-5 text-indigo-500" />
                <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">Search Engine View</h3>
              </div>
              <p className="text-[11px] md:text-sm text-slate-500 font-medium">How an AI like Perplexity or Google SGE might summarize your draft.</p>
              
              <div className="bg-[#f0f4f9] border border-[#e8eaed] p-4 md:p-6 rounded-2xl md:rounded-3xl relative shadow-sm">
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-[#1a73e8]" />
                </div>
                <h4 className="font-semibold text-[#202124] text-sm md:text-base mb-3 md:mb-4 pr-10 md:pr-12">AI Overview</h4>
                
                <div className="text-[#4d5156] text-xs md:text-sm leading-relaxed space-y-3 md:space-y-4 font-sans">
                  {aeoData?.llmOptimizedSnippet?.split('\n').map((paragraph: string, idx: number) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-[#e8eaed] flex gap-2">
                  <span className="bg-white border border-[#e8eaed] text-[#3c4043] text-[9px] md:text-[11px] px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-semibold shadow-sm">
                    Sources
                  </span>
                  <span className="bg-white border border-indigo-200/60 text-indigo-700 text-[9px] md:text-[11px] px-2.5 py-1 md:px-3 md:py-1.5 rounded-full font-bold shadow-sm flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3" /> Your Website
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}