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
      status: "In Progress"
    }
  });

  redirect(`/dashboard/editor/${newTopic.id}`);
}

export async function saveDocument(topicId: string, content: string) {
  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { content, status: "In Progress" }
  });
  revalidatePath("/dashboard");
}


export async function deleteTopic(topicId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Securely delete the topic, ensuring it belongs to the logged-in user
  await prisma.seoTopic.delete({
    where: { 
      id: topicId,
      userId: user.id 
    }
  });

  // Refreshes the dashboard instantly to remove the deleted row
  revalidatePath("/dashboard");
}