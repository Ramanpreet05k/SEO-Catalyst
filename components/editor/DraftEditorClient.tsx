"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Save, Send, Wand2, ArrowLeft, Bot, PlusCircle, LayoutPanelLeft, CheckCircle2, Circle, ChevronDown, Copy, ShieldCheck, MessageSquare, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestAiEdit, saveDraftManually, submitForReview, rejectToInProgress, addComment, resolveComment } from "@/app/actions/draft";
import { analyzeDraftForAEO } from "@/app/actions/aeo";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { PublishModal } from "@/components/editor/PublishModal";
import RichTextEditor from "./RichTextEditor";
import { ExportPdfButton } from "@/components/editor/ExportPdfButton"; // <-- Imported the new button

const QUICK_ACTIONS = [
  "Fix grammar and spelling",
  "Make it sound more professional",
  "Expand this into a longer article",
  "Make it more concise and punchy"
];

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

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter((w: string) => w).length, [content]);
  
  const targetEntities = useMemo(() => {
    const list = [topic.coreEntity, ...(topic.suggestedEntities || [])];
    if (list.length === 1) list.push("Strategy", "Optimization", "Growth"); 
    return Array.from(new Set(list)); 
  }, [topic]);

  const completedEntitiesCount = useMemo(() => {
    return targetEntities.filter(entity => content.toLowerCase().includes(entity.toLowerCase())).length;
  }, [content, targetEntities]);

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

          {/* --- NEW EXPORT PDF BUTTON --- */}
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
          {/* --- ADDED id="document-content" HERE --- */}
          <div id="document-content" className="w-full max-w-4xl relative bg-white p-4">
            {isPending && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl border border-indigo-100" data-html2canvas-ignore>
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse mb-4" />
                <h3 className="text-xl font-bold text-slate-900">AI is writing...</h3>
              </div>
            )}
            
            {/* Added a hidden print-only title so the PDF clearly shows what it is */}
            <div className="hidden print:block mb-8 border-b pb-4">
              <h1 className="text-3xl font-black text-slate-900">{topic.topicName}</h1>
              <p className="text-sm text-slate-500 mt-2">Core Entity: {topic.coreEntity}</p>
            </div>

            <RichTextEditor content={content} onChange={setContent} />
          </div>
        </main>

        {isSidebarOpen && (
          <aside className="w-[420px] bg-white flex flex-col z-20 shrink-0" data-html2canvas-ignore>
            {/* ... Rest of your Sidebar code remains exactly the same ... */}
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
                    <div className="p-6 space-y-4 animate-in fade-in">
                        <div className="border border-slate-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                            <div>
                                <h3 className="text-sm font-bold flex items-center gap-1">
                                    <ChevronDown className="w-4 h-4 text-slate-500" /> Words
                                </h3>
                                <p className="text-[11px] text-slate-500 ml-5">Total word count</p>
                            </div>
                            <span className="text-2xl font-bold">{wordCount.toLocaleString()}</span>
                        </div>
                    </div>
                )}

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

                        {/* Comment Input Sticky at Bottom */}
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

      {/* AI Edit Modal */}
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
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-32"
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