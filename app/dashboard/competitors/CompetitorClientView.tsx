"use client";

import { Target, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CompetitorClientView({ competitors, userWebsite }: { competitors: any[], userWebsite: string | null }) {
  if (competitors.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
        <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900">No Competitors Tracked</h3>
        <p className="text-slate-500 mt-2">Add competitors via the dashboard modal to start tracking.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {competitors.map((comp) => {
        const compUrl = comp.url || comp.website;

        return (
          <div key={comp.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:border-indigo-300 transition-all">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 flex-shrink-0">
                <Target className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 line-clamp-1">{comp.name || compUrl}</h3>
                <p className="text-sm text-slate-500 truncate">{compUrl}</p>
              </div>
            </div>

            <Link href={`/dashboard/competitors/${comp.id}`}>
              <Button className="w-full bg-slate-900 hover:bg-black text-white rounded-xl h-11">
                Deep Dive Analysis <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        );
      })}
    </div>
  );
}