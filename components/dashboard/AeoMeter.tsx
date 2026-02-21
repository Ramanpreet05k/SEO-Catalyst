"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AeoMeter({ website }: { website: string }) {
  const [score, setScore] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
   const scanWebsite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website })
      });
      
      const data = await res.json();
      if (data.success) {
        setScore(data.score);
        setStatus(data.status);
      } else {
        // Now it will show the actual error message (e.g., "Timed out")
        setScore(0);
        setStatus(data.error || "Scan Failed"); 
      }
    } catch (error) {
      setScore(0);
      setStatus("Server Error");
    } finally {
      setLoading(false); // This guarantees the spinner stops
    }
  };

    scanWebsite();
  }, [website]);

  const displayScore = score || 0;
  const arcLength = 251.2; 
  const arcOffset = arcLength * (1 - displayScore / 100);
  const statusColor = displayScore >= 80 ? "text-emerald-500" : displayScore >= 60 ? "text-amber-500" : "text-rose-500";

  return (
    <Card className="border-slate-200 shadow-sm rounded-2xl bg-white h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
            AEO Readiness
          </CardTitle>
          {loading ? <Loader2 className="w-4 h-4 text-slate-300 animate-spin" /> : <ShieldCheck className={`w-4 h-4 ${statusColor}`} />}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-28 space-y-3">
            <div className="relative flex items-center justify-center w-12 h-12">
               <div className="absolute w-full h-full border-4 border-indigo-100 rounded-full"></div>
               <div className="absolute w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Scanning DOM...</p>
          </div>
        ) : (
          <div className="relative w-48 h-28 flex justify-center overflow-hidden animate-in zoom-in-95 duration-500">
            <svg viewBox="0 0 200 120" className="w-full h-full drop-shadow-sm">
              <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#f1f5f9" strokeWidth="14" strokeLinecap="round" />
              <path 
                d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" 
                strokeDasharray={arcLength} strokeDashoffset={arcOffset} className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute bottom-2 flex flex-col items-center">
              <span className="text-4xl font-black text-slate-900 leading-none">{displayScore}</span>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${statusColor}`}>
                {status || "Analyzed"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}