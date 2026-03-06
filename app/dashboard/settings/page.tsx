import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsForm } from "./SettingsForm";
import { Sparkles, Settings } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  // Fetch the user and their workspace to get the current brand voice
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: { include: { workspace: true }, take: 1 } }
  });

  if (!user || user.workspaces.length === 0) {
    return <div>No workspace found.</div>;
  }

  const workspace = user.workspaces[0].workspace;
  const isOwner = user.workspaces[0].role === "OWNER";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-600" /> Workspace Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage your team's global preferences and AI guidelines.</p>
      </div>

      {isOwner ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold">AI Brand Guidelines</h2>
              <p className="text-indigo-200 text-sm">Instructions here will be automatically applied to every AI Edit across your workspace.</p>
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <SettingsForm initialVoice={workspace.brandVoice || ""} />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-bold text-slate-900 mb-2">Restricted Access</h2>
          <p className="text-slate-500">Only the Workspace Owner can modify the global brand guidelines.</p>
        </div>
      )}
    </div>
  );
}