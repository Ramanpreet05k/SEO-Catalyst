"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Save, Send, Wand2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestAiEdit, saveDraftManually } from "@/app/actions/draft";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { PublishModal } from "@/components/editor/PublishModal"; // <-- Added Import

const QUICK_ACTIONS = [
  "Fix grammar and spelling",
  "Make it sound more professional",
  "Expand this into a longer article",
  "Make it more concise and punchy",
  "Add a bulleted summary at the top"
];

export function DraftEditorClient({ topic }: { topic: any }) {
  const [content, setContent] = useState(topic.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Handle manual typing saves
  const handleSave = async () => {
    setIsSaving(true);
    await saveDraftManually(topic.id, content);
    setIsSaving(false);
    router.refresh();
  };

  // Handle AI Edit Requests
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
        alert("Failed to apply AI edits. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
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
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200"
          >
            <Wand2 className="w-4 h-4 mr-2" /> AI Edit Options
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isPending}
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>

          {/* THE NEW PUBLISH MODAL */}
          <PublishModal topicId={topic.id} isPublished={topic.status === "Published"} />
        </div>
      </header>

      {/* Editor Main Canvas */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 custom-scrollbar flex justify-center relative">
        <div className="w-full max-w-4xl relative">
          
          {isPending && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-2xl border border-indigo-100">
              <div className="p-4 bg-white rounded-full shadow-lg mb-4">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">AI is writing...</h3>
              <p className="text-sm text-slate-500">Applying your requested edits to the draft.</p>
            </div>
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your article here, or click 'AI Edit Options' to have Gemini draft it for you..."
            className="w-full h-full min-h-[600px] bg-white border border-slate-200 rounded-2xl p-8 md:p-12 text-slate-800 text-lg leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm resize-none custom-scrollbar"
            style={{ fontFamily: "Georgia, serif" }}
          />
        </div>
      </main>

      {/* AI Edit Request Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
            <Sparkles className="w-8 h-8 mb-4 text-indigo-200" />
            <DialogTitle className="text-2xl font-bold tracking-tight mb-2">Edit Request</DialogTitle>
            <p className="text-indigo-100 text-sm">Tell the AI exactly how you want to change this draft, or pick a quick action below.</p>
          </div>
          
          <div className="p-8 bg-white">
            {/* Quick Actions */}
            <div className="mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Suggested Quick Actions</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action, i) => (
                  <button
                    key={i}
                    onClick={() => handleAiEdit(action)}
                    disabled={isPending}
                    className="text-xs font-semibold px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-full hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-left"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Instruction Input */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Or type custom instructions</label>
              <div className="relative">
                <textarea 
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. 'Rewrite the second paragraph to sound more persuasive and add a call to action at the bottom.'"
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24 custom-scrollbar"
                />
                <Button 
                  onClick={() => handleAiEdit()}
                  disabled={!instruction.trim() || isPending}
                  size="icon"
                  className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-8 w-8 shadow-sm"
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