import { prisma } from "@/lib/prisma";

export default async function CleanupPage() {
  // We'll fetch all topics and find the ones where the userId doesn't exist in the User table
  const allTopics = await prisma.seoTopic.findMany({
    select: { id: true, userId: true }
  });

  const allUsers = await prisma.user.findMany({
    select: { id: true }
  });

  const userIds = new Set(allUsers.map(u => u.id));
  
  // Identify topics whose userId is NOT in our set of valid user IDs
  const orphanedIds = allTopics
    .filter(topic => !userIds.has(topic.userId))
    .map(topic => topic.id);

  let deletedCount = 0;

  if (orphanedIds.length > 0) {
    const deleted = await prisma.seoTopic.deleteMany({
      where: {
        id: { in: orphanedIds }
      }
    });
    deletedCount = deleted.count;
  }

  return (
    <div className="p-10 font-sans">
      <h1 className="text-2xl font-bold text-slate-900">Database Integrity Cleanup</h1>
      <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-amber-800">
          Scanned <strong>{allTopics.length}</strong> total articles.
        </p>
        <p className="text-amber-800 mt-2">
          Deleted <strong>{deletedCount}</strong> orphaned articles with missing user links.
        </p>
      </div>
      <p className="mt-6 text-slate-500 text-sm">
        You can now safely restart <strong>npx prisma studio</strong>.
      </p>
    </div>
  );
}