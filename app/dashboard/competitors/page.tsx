import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CompetitorClientView } from "./CompetitorClientView";

export default async function CompetitorsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { competitors: true }
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Competitive Analysis</h1>
          <p className="text-slate-500 mt-1">
            Compare your semantic positioning against tracked competitors.
          </p>
        </header>

        {/* We pass the data to a client component to handle the loading states */}
        <CompetitorClientView competitors={user.competitors} userWebsite={user.website} />
      </div>
    </div>
  );
}