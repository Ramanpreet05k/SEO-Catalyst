"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNewArticle(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // 1. Fetch user and their workspace membership
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email },
    include: {
      workspaces: {
        take: 1 // Get their primary workspace
      }
    }
  });

  if (!user) throw new Error("User not found");
  
  // 2. Ensure a workspace exists (Safety fallback)
  const workspaceId = user.workspaces[0]?.workspaceId;
  if (!workspaceId) throw new Error("No active workspace found. Please refresh your dashboard.");

  const topicName = formData.get("topicName") as string;
  let coreEntity = formData.get("coreEntity") as string;

  if (!topicName || !topicName.trim()) {
    throw new Error("Article title is required.");
  }

  if (!coreEntity || !coreEntity.trim()) {
    coreEntity = topicName.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9 ]/g, "") || "General";
  }

  // 3. Create the article linked to BOTH the User and the Workspace
  const newTopic = await prisma.seoTopic.create({
    data: {
      topicName: topicName.trim(),
      coreEntity: coreEntity.trim(),
      status: "To Do", 
      userId: user.id,
      workspaceId: workspaceId, // Now linked to the team workspace!
    }
  });

  revalidatePath("/dashboard/library");
  
  return newTopic.id.toString(); 
}

export async function deleteTopic(topicId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Securely delete the topic
  await prisma.seoTopic.deleteMany({
    where: { 
      id: topicId,
      userId: user.id 
    }
  });

  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard");
}

export async function saveDocument(topicId: string, content: string) {
  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { content } 
  });
  
  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard");
}