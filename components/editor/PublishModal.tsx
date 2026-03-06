"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Globe, Sparkles } from "lucide-react";
import { publishDraft } from "@/app/actions/draft";

export function PublishModal({ 
  topicId, 
  isPublished, 
  role 
}: { 
  topicId: string; 
  isPublished: boolean; 
  role: "OWNER" | "WRITER";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (role !== "OWNER") return null;

  const handlePublish = () => {
    startTransition(async () => {
      try {
        await publishDraft(topicId);
        setIsOpen(false);
        router.push("/dashboard/library"); 
      } catch (error) {
        alert("Failed to publish draft.");
      }
    });
  };

  if (isPublished) {
    return (
      <Button disabled className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold opacity-100">
        <CheckCircle2 className="w-4 h-4 mr-2" /> Published
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm">
          <Globe className="w-4 h-4 mr-2" /> Approve & Publish
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight mb-2 text-white">Ready to Publish?</DialogTitle>
          <p className="text-emerald-50 text-sm">This will mark the draft as complete and move it out of the active review queue.</p>
        </div>
        
        <div className="p-8 bg-white flex flex-col gap-4">
          <Button 
            onClick={handlePublish}
            disabled={isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-lg"
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Yes, Mark as Published"}
          </Button>
          <Button 
            onClick={() => setIsOpen(false)}
            variant="ghost"
            className="w-full text-slate-500 hover:text-slate-900 font-bold"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}