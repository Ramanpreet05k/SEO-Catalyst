import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContentLibraryClient } from "./ContentLibraryClient";

export default async function ContentLibraryPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      seoTopics: {
        orderBy: { createdAt: 'desc' } // Most recent first
      }
    }
  });

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50/30 p-6 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Content Library</h1>
          <p className="text-slate-500 mt-1">
            Manage, filter, and review all your published and drafted articles.
          </p>
        </header>

        <ContentLibraryClient initialTopics={user.seoTopics} />
      </div>
    </div>
  );
}