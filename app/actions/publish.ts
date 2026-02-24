"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function publishToWebhook(topicId: string, webhookUrl: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const topic = await prisma.seoTopic.findUnique({
    where: { id: topicId, userId: user.id }
  });

  if (!topic) throw new Error("Topic not found.");
  if (!topic.content) throw new Error("Cannot publish an empty article.");

  try {
    // 1. Fire the payload to the external Webhook (Zapier, Make, custom server, etc.)
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: topic.id,
        title: topic.topicName,
        content: topic.content,
        coreEntity: topic.coreEntity,
        author: user.name || user.email,
        publishedAt: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    // 2. If successful, update the database status to move the Kanban card
    await prisma.seoTopic.update({
      where: { id: topicId },
      data: { status: "Published" }
    });

    // 3. Refresh the pipeline and editor UI
    revalidatePath("/dashboard/topics");
    revalidatePath(`/dashboard/editor/${topicId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Publishing failed:", error);
    throw new Error(error.message || "Failed to publish to webhook.");
  }
}   