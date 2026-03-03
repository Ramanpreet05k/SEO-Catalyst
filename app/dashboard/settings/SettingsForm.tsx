"use client";

import { useState, useTransition } from "react";
import { Globe, Save, Loader2, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateWorkspaceSettings } from "@/app/actions/settings";

export function SettingsForm({ initialWebsite }: { initialWebsite: string | null }) {
  // 1. We add state for the new toggles
  const [website, setWebsite] = useState(initialWebsite || "");
  const [autoPublish, setAutoPublish] = useState(false); 
  const [requireApproval, setRequireApproval] = useState(true); 
  
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(false);

    const formData = new FormData();
    formData.append("website", website);
    // In the future, we will send these toggle states to the server too:
    formData.append("autoPublish", autoPublish.toString());
    formData.append("requireApproval", requireApproval.toString());

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
      
      {/* Target Domain Configuration */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" /> Workspace Target Domain
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            This URL is used as the baseline for your Competitor Gap Analysis and SEO Optimization audits.
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

          <div className="flex items-center gap-4">
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

      {/* Workflow & AI Preferences (NOW INTERACTIVE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Automation Settings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" /> Automation Preferences
          </h3>
          <div className="space-y-4">
            
            {/* INTERACTIVE TOGGLE: Auto Publish */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Auto-Publish Approved Drafts</p>
                <p className="text-xs text-slate-500">Instantly push to webhook upon approval</p>
              </div>
              <button 
                type="button"
                onClick={() => setAutoPublish(!autoPublish)}
                className={`w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${autoPublish ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-200 ease-in-out ${autoPublish ? 'translate-x-5' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-700">Outreach Email Limits</p>
                <p className="text-xs text-slate-500">Max automated emails per day</p>
              </div>
              <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">Pro Feature</span>
            </div>
          </div>
        </div>

        {/* Security & Approvals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm transition-all">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-emerald-500" /> Governance
          </h3>
          <div className="space-y-4">
            
            {/* INTERACTIVE TOGGLE: Require Approval */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700">Require Manual Approval</p>
                <p className="text-xs text-slate-500">Block AI from modifying Pipeline status</p>
              </div>
              <button 
                type="button"
                onClick={() => setRequireApproval(!requireApproval)}
                className={`w-10 h-6 rounded-full relative transition-colors duration-200 ease-in-out focus:outline-none ${requireApproval ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-200 ease-in-out ${requireApproval ? 'translate-x-5' : 'translate-x-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-700">AI Safety Filters</p>
                <p className="text-xs text-slate-500">Strict tone and brand safety constraints</p>
              </div>
              <span className="text-xs font-bold bg-emerald-100 px-2 py-1 rounded text-emerald-700">Active</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}