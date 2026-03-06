"use client";

import { useState, useTransition } from "react";
import { Globe, Save, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateWorkspaceSettings } from "@/app/actions/settings";

export function SettingsForm({ 
  initialWebsite, 
  initialBrandVoice 
}: { 
  initialWebsite: string | null,
  initialBrandVoice: string | null 
}) {
  const [website, setWebsite] = useState(initialWebsite || "");
  const [brandVoice, setBrandVoice] = useState(initialBrandVoice || "");
  
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(false);

    const formData = new FormData();
    formData.append("website", website);
    formData.append("brandVoice", brandVoice);

    startTransition(async () => {
      try {
        await updateWorkspaceSettings(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000); 
      } catch (error) {
        alert("Failed to save settings.");
      }
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Target Domain & Brand Guidelines */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" /> Workspace Settings
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your target domain and global AI instructions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
              Primary Website URL
            </label>
            <input 
              type="text" 
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://yourdomain.com" 
              className="w-full max-w-xl px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-6 border-t border-slate-100 pt-6">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> AI Brand Voice & Editor Guidelines
            </label>
            <p className="text-sm text-slate-500 mb-3">
              Instructions here are automatically applied to the AI when generating or editing drafts. Perfect for maintaining a consistent academic or professional tone.
            </p>
            <textarea 
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              placeholder="e.g. Always write in an academic, objective tone suitable for a research paper. Avoid marketing jargon. Use short paragraphs." 
              className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-4 mt-8">
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-slate-900 hover:bg-black text-white font-bold rounded-xl h-11 px-6 shadow-sm"
            >
              {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Configuration
            </Button>
            
            {isSaved && (
              <span className="text-sm font-bold text-emerald-600 animate-in fade-in slide-in-from-left-2">
                Settings updated successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}