"use client";

import { useState } from "react";
// 1. Added LogOut to the lucide-react imports
import { Settings, Save, Loader2, Globe, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { updateUserProfile } from "@/app/actions/user";
// 2. Imported the signOut function from next-auth
import { signOut } from "next-auth/react";

export function UserSettingsModal({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await updateUserProfile(formData);
      setIsOpen(false); // Close modal on success
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-slate-200 text-slate-500 hover:text-slate-900 bg-white shadow-sm">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-100 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-50">
          <DialogTitle className="text-xl font-bold text-slate-900">Workspace Settings</DialogTitle>
          <p className="text-sm text-slate-500">Update your brand context to improve AI generation.</p>
        </DialogHeader>

        <form action={handleSubmit} className="p-6 space-y-5">
          {/* Website Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-indigo-500" /> Target Website
            </label>
            <input 
              type="url" 
              name="website" 
              defaultValue={user.website || ""}
              required 
              placeholder="https://yourwebsite.com" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Brand Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Brand Context & Tone
            </label>
            <p className="text-[10px] text-slate-400 leading-snug">
              Gemini uses this to write your outlines and sections. Tell the AI exactly how you want it to sound (e.g. "Professional and analytical, avoid fluff").
            </p>
            <textarea 
              name="brandDescription" 
              defaultValue={user.brandDescription || ""}
              required 
              rows={5}
              placeholder="Describe your brand, target audience, and preferred writing tone..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none custom-scrollbar"
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button type="submit" disabled={isLoading} className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 font-bold shadow-sm">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
            
            {/* 3. THE NEW SIGN OUT BUTTON */}
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl h-11 font-bold"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}