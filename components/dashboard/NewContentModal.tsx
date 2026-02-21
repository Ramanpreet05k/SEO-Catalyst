"use client";

import { useState } from "react";
import { PenLine, FileText, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { createCustomTopic } from "@/app/actions/topic";

export function NewContentModal({ topics }: { topics: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSelectTopic = (id: string) => {
    setIsOpen(false);
    router.push(`/dashboard/editor/${id}`);
  };

  const handleCustomSubmit = async (formData: FormData) => {
    setIsLoading(true);
    await createCustomTopic(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-11 px-6 font-bold shadow-sm">
          <PenLine className="w-4 h-4 mr-2" /> New Content
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg rounded-2xl bg-white border-slate-100 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold text-slate-900">Start Writing</DialogTitle>
          <p className="text-sm text-slate-500">Select a topic from your AI pipeline or create a new one.</p>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Custom Topic Form */}
          <form action={handleCustomSubmit} className="flex gap-2">
            <input 
              type="text" 
              name="topicName" 
              required 
              placeholder="Or type a custom topic..." 
              className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button type="submit" disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 font-bold">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </Button>
          </form>

          <div className="border-t border-slate-100" />

          {/* Existing Pipeline Topics */}
          <div>
             <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Content Pipeline</h4>
             <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
               {topics.filter(t => t.status !== "Published").length > 0 ? (
                 topics.filter(t => t.status !== "Published").map(topic => (
                   <div 
                     key={topic.id} 
                     onClick={() => handleSelectTopic(topic.id)}
                     className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                         <FileText className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-900 line-clamp-1">{topic.topicName}</p>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{topic.coreEntity}</p>
                       </div>
                     </div>
                   </div>
                 ))
               ) : (
                 <p className="text-xs text-slate-500 italic text-center py-4">No pending topics in pipeline.</p>
               )}
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}