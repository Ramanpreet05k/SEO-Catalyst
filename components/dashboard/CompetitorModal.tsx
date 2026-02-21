"use client";

import { useState } from "react";
import { Plus, Target, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { addCompetitor } from "@/app/actions/competitor";

interface Competitor {
  id: string;
  name: string;
  url: string | null;
}

export function CompetitorModal({ activeCompetitors }: { activeCompetitors: Competitor[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle the form submission
  async function onSubmit(formData: FormData) {
    setIsLoading(true);
    try {
      await addCompetitor(formData); // Calls the backend action
      setIsOpen(false); // Close modal on success
    } catch (error) {
      console.error("Failed to add competitor", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-white rounded-xl h-11 border-slate-200 font-bold shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Track Competitor
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Competitor Intelligence
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* LIST OF ALREADY PRESENT COMPETITORS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Currently Tracking ({activeCompetitors.length})
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {activeCompetitors.length > 0 ? (
                activeCompetitors.map((comp) => (
                  <div key={comp.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-sm font-bold text-slate-700">{comp.name}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{comp.url}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">No competitors tracked yet.</p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 my-2" />

          {/* INSERT NEW COMPETITOR FORM */}
          <form action={onSubmit} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Add New Competitor
            </h4>
            
            <div className="space-y-3">
              <div className="relative">
                <Target className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Brand Name (e.g. Linear)" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="relative">
                <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="url" 
                  name="url" 
                  placeholder="Website URL (e.g. https://linear.app)" 
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 font-bold shadow-md transition-all mt-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Insert Competitor <Plus className="w-4 h-4 ml-2" /></>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}