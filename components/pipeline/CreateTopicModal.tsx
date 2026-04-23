"use client";

import { useState, useTransition } from "react";
import { Plus, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createNewArticle } from "@/app/actions/topic"; // Changed from createCustomTopic
import { useRouter } from "next/navigation";

export function CreateTopicModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        // Call the correct exported function
        const newTopicId = await createNewArticle(formData);
        
        setIsOpen(false);
        // Navigate the user to the editor for their new topic
        router.push(`/dashboard/editor/${newTopicId}`);
      } catch (error) {
        console.error("Failed to create topic:", error);
        alert("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm h-10 px-4">
          <Plus className="w-4 h-4 mr-2" />
          Add Topic
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rounded-2xl bg-white border-slate-100 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-50">
          <DialogTitle className="text-xl font-bold text-slate-900">Create New Topic</DialogTitle>
          <p className="text-sm text-slate-500">Manually add a specific article to your pipeline and start writing.</p>
        </DialogHeader>

        {/* Changed from action={handleSubmit} to onSubmit to handle the transition and redirect manually */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-indigo-500" /> Topic / Target Keyword
            </label>
            <input 
              type="text" 
              name="topicName" 
              required 
              autoFocus
              placeholder="e.g. How to optimize React performance..." 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <Button type="submit" disabled={isPending} className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 font-bold shadow-sm">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating & Loading Editor...
              </>
            ) : (
              "Create Topic"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}