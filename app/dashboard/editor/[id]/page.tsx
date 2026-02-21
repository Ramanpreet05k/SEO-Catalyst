import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AIEditor } from "@/components/editor/AIEditor";

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

  // 2. Await the params object to extract the ID
  const { id } = await params;

  // 3. Fetch the topic from the database using the resolved ID
  const topic = await prisma.seoTopic.findUnique({
    where: { id: id }
  });

  // If the topic doesn't exist, send them back to the workspace
  if (!topic) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <AIEditor topic={topic} />
    </div>
  );
}