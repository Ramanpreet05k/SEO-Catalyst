"use client";

import { useState, useTransition } from "react";
import { Target, Plus, Trash2, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { addCompetitor, deleteCompetitor } from "@/app/actions/competitor";

export function CompetitorModal({ activeCompetitors }: { activeCompetitors: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (formData: FormData) => {
    startTransition(async () => {
      await addCompetitor(formData);
      // Reset the input field after successful addition
      const form = document.getElementById("competitor-form") as HTMLFormElement;
      if (form) form.reset();
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteCompetitor(id);
      setDeletingId(null);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 bg-white shadow-sm rounded-xl px-4">
          <Target className="w-4 h-4 mr-2 text-rose-500" />
          Competitors ({activeCompetitors.length})
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-100 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-50">
          <DialogTitle className="text-xl font-bold text-slate-900">Tracked Competitors</DialogTitle>
          <p className="text-sm text-slate-500">Add or remove competitor URLs to track their content gaps.</p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          
          {/* Add New Competitor Form */}
          <form id="competitor-form" action={handleAdd} className="flex gap-2">
            <div className="relative flex-1">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="url" 
                name="website" 
                required 
                placeholder="https://competitor.com" 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button type="submit" disabled={isPending} className="bg-slate-900 hover:bg-black text-white rounded-xl font-bold px-4 shadow-sm">
              {isPending && !deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </form>

          {/* Managed Competitor List */}
          <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Currently Tracking</h3>
            
            {activeCompetitors.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                No competitors tracked yet.
              </p>
            ) : (
              activeCompetitors.map((comp) => (
                <div key={comp.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-slate-400" />
                    </div>
                    
                    {/* THE FIX: Automatically fall back to whichever database field exists */}
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {comp.url || comp.name || "Unknown Competitor"}
                    </span>

                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(comp.id)}
                    disabled={deletingId === comp.id}
                    className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg h-8 w-8 p-0"
                  >
                    {deletingId === comp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                </div>
              ))
            )}
          </div>
          
        </div>
      </DialogContent>
    </Dialog>
  );
}