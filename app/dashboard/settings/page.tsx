import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { website: true } // We only need to fetch the website for this page
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Settings</h1>
          <p className="text-slate-500 mt-1">
            Manage your workspace domain, AI preferences, and automation rules.
          </p>
        </header>

        <SettingsForm initialWebsite={user.website} />
      </div>
    </div>
  );
}