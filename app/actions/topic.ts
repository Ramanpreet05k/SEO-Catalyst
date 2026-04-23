"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

/**
 * UPDATES TOPIC STATUS (For Drag & Drop)
 */
export async function updateTopicStatus(topicId: string, newStatus: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { status: newStatus }
  });

  revalidatePath("/dashboard/library");
}

/**
 * DELETES A TOPIC
 */
export async function deleteTopic(topicId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.seoTopic.delete({
    where: { id: topicId }
  });

  revalidatePath("/dashboard/library");
}

/**
 * ADDS A TOPIC FROM THE PIPELINE BOARD
 */
export async function addPipelineTopic(topicName: string, status: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: true }
  });

  if (!user || !user.workspaces[0]) throw new Error("User/Workspace not found");

  await prisma.seoTopic.create({
    data: {
      topicName,
      status,
      userId: user.id,
      workspaceId: user.workspaces[0].workspaceId,
      priority: "Medium",
      coreEntity: "General"
    }
  });

  revalidatePath("/dashboard/library");
}

/**
 * CREATES A NEW ARTICLE (For Modal Forms)
 */
export async function createNewArticle(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const topicName = formData.get("topicName") as string;
  
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: true }
  });

  if (!user || !user.workspaces[0]) throw new Error("Workspace not found");

  const newTopic = await prisma.seoTopic.create({
    data: {
      topicName,
      userId: user.id,
      workspaceId: user.workspaces[0].workspaceId,
      status: "To Do"
    }
  });

  revalidatePath("/dashboard/library");
  return newTopic.id;
}

/**
 * SAVES EDITOR CONTENT
 * Updates the 'content' field for a specific SEO Topic
 */
export async function saveDocument(topicId: string, content: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  try {
    const updatedTopic = await prisma.seoTopic.update({
      where: { id: topicId },
      data: { 
        content: content,
        // We can also automatically move it to 'In Progress' if it was 'To Do'
        status: {
          set: "In Progress"
        }
      }
    });

    // Revalidate the library and editor paths to show the latest saved state
    revalidatePath("/dashboard/library");
    revalidatePath(`/dashboard/editor/${topicId}`);

    return { success: true, topic: updatedTopic };
  } catch (error) {
    console.error("Failed to save document:", error);
    throw new Error("Failed to save content to database.");
  }
}