"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addClusterNode(topicName: string, coreEntity: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const newTopic = await prisma.seoTopic.create({
    data: {
      topicName,
      coreEntity,
      status: "To Do",
      userId: user.id,
    }
  });

  revalidatePath("/dashboard/topics");
  return newTopic;
}