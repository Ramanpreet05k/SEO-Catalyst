"use client";

import { useTransition, useRef } from "react";
import { Sparkles, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateAiTopics } from "@/app/actions/brainstorm";

export function AiBrainstormer() {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const handleBrainstorm = (formData: FormData) => {
    startTransition(async () => {
      try {
        await generateAiTopics(formData);
        formRef.current?.reset();
      } catch (error) {
        console.error(error);
        alert("Failed to generate ideas. Please try again.");
      }
    });
  };

  return (
    <div className="mb-8 bg-white border border-slate-200 rounded-xl shadow-sm p-2 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 pl-2 w-full md:w-auto">
        <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-900">AI Topic Generator</h2>
          <p className="text-xs text-slate-500">Instantly fill your pipeline with semantic keywords.</p>
        </div>
      </div>

      <form ref={formRef} action={handleBrainstorm} className="flex w-full md:w-[400px] gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            name="keyword" 
            required 
            placeholder="e.g. B2B SaaS Growth..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <Button 
          type="submit" 
          disabled={isPending} 
          className="bg-slate-900 hover:bg-black text-white rounded-lg px-4 text-sm font-bold shadow-sm transition-all whitespace-nowrap"
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate"}
        </Button>
      </form>
    </div>
  );
}