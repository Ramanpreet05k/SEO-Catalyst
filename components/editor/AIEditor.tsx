"use client";

import { useState } from "react";
import { Sparkles, Save, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDocument } from "@/app/actions/topic";
import Link from "next/link";

export function AIEditor({ topic }: { topic: any }) {
  const [content, setContent] = useState(topic.content || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateOutline = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id })
      });
      const data = await res.json();
      if (data.success) {
        setContent(data.outline + "\n\n" + content); // Prepends outline to existing content
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveDocument(topic.id, content);
    setTimeout(() => setIsSaving(false), 500);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-10">
        <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
        <div className="flex gap-3">
          <Button onClick={handleGenerateOutline} disabled={isGenerating} variant="outline" className="bg-indigo-50 border-indigo-100 text-indigo-700 font-bold">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            AI Outline
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-slate-900 text-white font-bold">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-black text-slate-900 leading-tight">
          {topic.topicName}
        </h1>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest pb-8 border-b border-slate-100">
          <span>Entity: <span className="text-indigo-600">{topic.coreEntity}</span></span>
          <span>•</span>
          <span>Status: {topic.status}</span>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing, or click 'AI Outline' to have Gemini structure your article..."
          className="w-full min-h-[60vh] resize-none focus:outline-none text-slate-700 text-lg leading-relaxed placeholder:text-slate-300 bg-transparent"
        />
      </div>
    </div>
  );
}