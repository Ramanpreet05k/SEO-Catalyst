"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function publishToWebhook(topicId: string, webhookUrl: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // 1. Get the article data
  const topic = await prisma.seoTopic.findFirst({
    where: { id: topicId, userId: user.id }
  });

  if (!topic) throw new Error("Article not found.");

  // 2. Prepare the JSON payload to send
  const payload = {
    title: topic.topicName,
    content: topic.content,
    coreEntity: topic.coreEntity,
    authorName: user.name || user.email,
    publishedAt: new Date().toISOString()
  };

  try {
    // 3. Fire the Webhook
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook server responded with status: ${response.status}`);
    }

    // 4. If successful, update the status in our database
    await prisma.seoTopic.update({
      where: { id: topicId },
      data: { status: "Published" }
    });

    // 5. Refresh the UI
    revalidatePath("/dashboard/library");
    revalidatePath("/dashboard");

    return true;

  } catch (error: any) {
    console.error("Webhook Error:", error);
    throw new Error(error.message || "Failed to reach the webhook URL.");
  }
}