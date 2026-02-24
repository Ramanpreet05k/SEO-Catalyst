"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Rocket, Loader2, Globe, ShoppingBag, Webhook, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { publishToWebhook } from "@/app/actions/publish";

export function PublishModal({ topicId, isPublished }: { topicId: string, isPublished: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [selectedPlatform, setSelectedPlatform] = useState<"wordpress" | "shopify" | "webhook">("webhook");
  const router = useRouter();

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlatform !== "webhook") return; // Only webhook is active for MVP
    if (!webhookUrl.trim()) return;

    startTransition(async () => {
      try {
        await publishToWebhook(topicId, webhookUrl);
        setIsOpen(false);
        setWebhookUrl("");
        alert("Success! Article payload sent to webhook and marked as Published.");
        router.push("/dashboard/topics"); // Redirect back to pipeline
      } catch (error: any) {
        alert(error.message || "Failed to publish. Check your webhook URL.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          disabled={isPublished}
          className={`font-bold shadow-sm h-10 px-4 ${
            isPublished 
              ? "bg-emerald-100 text-emerald-700 cursor-not-allowed border border-emerald-200" 
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {isPublished ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Rocket className="w-4 h-4 mr-2" />}
          {isPublished ? "Published" : "Approve & Publish"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-lg rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <DialogHeader className="bg-slate-900 p-8 text-white border-b border-slate-800">
          <Rocket className="w-8 h-8 mb-4 text-indigo-400" />
          <DialogTitle className="text-2xl font-bold tracking-tight mb-1">Publish Options</DialogTitle>
          <p className="text-slate-400 text-sm">Select your distribution platform to push this content live.</p>
        </DialogHeader>

        <form onSubmit={handlePublish} className="p-8 bg-slate-50">
          <div className="space-y-4 mb-8">
            
            {/* WordPress Option */}
            <div 
              onClick={() => setSelectedPlatform("wordpress")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlatform === "wordpress" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-3">
                <Globe className={`w-5 h-5 ${selectedPlatform === "wordpress" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="font-bold text-slate-900">WordPress</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700">Not Connected</span>
            </div>

            {/* Shopify Option */}
            <div 
              onClick={() => setSelectedPlatform("shopify")}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlatform === "shopify" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className={`w-5 h-5 ${selectedPlatform === "shopify" ? "text-indigo-600" : "text-slate-400"}`} />
                <span className="font-bold text-slate-900">Shopify Blog</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-700">Not Connected</span>
            </div>

            {/* Webhook Option (Active) */}
            <div 
              onClick={() => setSelectedPlatform("webhook")}
              className={`flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlatform === "webhook" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Webhook className={`w-5 h-5 ${selectedPlatform === "webhook" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="font-bold text-slate-900">Custom Webhook</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">Ready</span>
              </div>
              
              {selectedPlatform === "webhook" && (
                <div className="animate-in fade-in slide-in-from-top-2 pt-2 border-t border-indigo-100">
                  <input 
                    type="url" 
                    required 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.zapier.com/..." 
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">We will POST a JSON payload with the title, content, and author.</p>
                </div>
              )}
            </div>

          </div>

          <Button 
            type="submit" 
            disabled={isPending || selectedPlatform !== "webhook" || !webhookUrl.trim()} 
            className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11 font-bold shadow-sm"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Firing Webhook...</>
            ) : selectedPlatform !== "webhook" ? (
              "Please Connect Platform in Settings"
            ) : (
              "Push to Webhook"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}