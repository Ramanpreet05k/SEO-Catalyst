import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CompetitorManager } from "./CompetitorManager";
import { Crosshair } from "lucide-react";

export default async function CompetitorsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { competitors: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Crosshair className="w-8 h-8 text-indigo-600" /> Competitor Intelligence
        </h1>
        <p className="text-slate-500 mt-2">Track rival domains, analyze their content strategy, and steal their highest-value topics.</p>
      </div>

      <CompetitorManager initialCompetitors={user.competitors} />
    </div>
  );
}