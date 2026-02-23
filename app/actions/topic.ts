"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createCustomTopic(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const topicName = formData.get("topicName") as string;
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  
  if (!user || !topicName) throw new Error("Invalid request");

  const newTopic = await prisma.seoTopic.create({
    data: {
      topicName,
      coreEntity: topicName.split(' ').slice(0, 2).join(' '), // Auto-generate entity
      userId: user.id,
      status: "Idea" // Changed from "In Progress" so it starts in the first Kanban column
    }
  });

  redirect(`/dashboard/editor/${newTopic.id}`);
}

export async function saveDocument(topicId: string, content: string) {
  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { content } // Removed forced "In Progress" so it doesn't overwrite Kanban drag-and-drop positioning
  });
  
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/topics");
}

export async function deleteTopic(topicId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Securely delete the topic, ensuring it belongs to the logged-in user
  // Using deleteMany prevents Prisma schema errors when combining ID and UserId
  await prisma.seoTopic.deleteMany({
    where: { 
      id: topicId,
      userId: user.id 
    }
  });

  // Refreshes all dashboards instantly to remove the deleted row
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/topics");
}

// NEW: Required for the Kanban Drag-and-Drop Board
export async function updateTopicStatus(topicId: string, newStatus: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Using updateMany for safe compound where-clauses
  await prisma.seoTopic.updateMany({
    where: { 
      id: topicId,
      userId: user.id 
    },
    data: { 
      status: newStatus 
    }
  });

  revalidatePath("/dashboard/topics");
  revalidatePath("/dashboard"); // Keeps the AEO status meter synced
}

// Add this new function to the bottom of app/actions/topic.ts

export async function addPipelineTopic(topicName: string, status: string = "Idea") {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Generate a basic entity from the title
  const coreEntity = topicName.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9 ]/g, "") || "General";

  await prisma.seoTopic.create({
    data: {
      topicName,
      coreEntity,
      userId: user.id,
      status: status,
      priority: "Medium"
    }
  });

  revalidatePath("/dashboard/pipeline");
  revalidatePath("/dashboard");
}