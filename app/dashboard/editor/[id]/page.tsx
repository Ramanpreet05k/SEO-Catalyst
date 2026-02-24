import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DraftEditorClient } from "@/components/editor/DraftEditorClient";

// In Next.js 15+, params is a Promise that must be awaited
export default async function EditorPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const session = await getServerSession();
  
  // 1. Check Auth
  if (!session?.user?.email) {
    redirect("/login");
  }

  // Fetch the user so we can verify ownership of the document
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  if (!user) redirect("/login");

  // 2. Await the params object to extract the ID
  const { id } = await params;

  // 3. Fetch the topic securely using the resolved ID AND the user's ID
  const topic = await prisma.seoTopic.findUnique({
    where: { 
      id: id,
      userId: user.id // Security check: ensures the logged-in user owns this topic
    }
  });

  // If the topic doesn't exist (or they don't own it), send them back to the pipeline
  if (!topic) {
    redirect("/dashboard/topics");
  }

  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      <DraftEditorClient topic={topic} />
    </div>
  );
}