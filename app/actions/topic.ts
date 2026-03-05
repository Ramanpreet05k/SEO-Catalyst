"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNewArticle(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const topicName = formData.get("topicName") as string;
  let coreEntity = formData.get("coreEntity") as string;

  if (!topicName || !topicName.trim()) {
    throw new Error("Article title is required.");
  }

  if (!coreEntity || !coreEntity.trim()) {
    coreEntity = topicName.split(' ').slice(0, 2).join(' ').replace(/[^a-zA-Z0-9 ]/g, "") || "General";
  }

  // Create the blank canvas
  const newTopic = await prisma.seoTopic.create({
    data: {
      topicName: topicName.trim(),
      coreEntity: coreEntity.trim(),
      status: "To Do", 
      userId: user.id,
    }
  });

  revalidatePath("/dashboard/library");
  
  // Return explicitly as a clean string
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