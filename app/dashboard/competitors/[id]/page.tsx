import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DetailedAnalysisClient } from "./DetailedAnalysisClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CompetitorDeepDivePage({ params }: { params: any }) {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  // THE FIX: Await the params object (Required in Next.js 15+)
  const resolvedParams = await params;
  const competitorId = resolvedParams.id;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");

  const competitor = await prisma.competitor.findUnique({
    where: { 
      id: competitorId, // Use the awaited ID here
      userId: user.id 
    }
  });

  if (!competitor) redirect("/dashboard/competitors");

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        
        <Link href="/dashboard/competitors" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Competitors
        </Link>

        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Vs. {competitor.name || competitor.url}</h1>
          <p className="text-slate-500 mt-1">
            Head-to-head semantic SEO comparison.
          </p>
        </header>

        <DetailedAnalysisClient competitorId={competitor.id} />
      </div>
    </div>
  );
}