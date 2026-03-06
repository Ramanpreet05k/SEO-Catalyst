"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Role } from "@prisma/client";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function requestAiEdit(topicId: string, currentContent: string, instruction: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `Rewrite this draft based on: "${instruction}"\n\nDRAFT:\n${currentContent}\n\nReturn ONLY markdown.`;
  const result = await model.generateContent(prompt);
  let newContent = result.response.text().trim().replace(/^```markdown\n/, "").replace(/\n```$/, "");

  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { content: newContent, status: "In Progress" }
  });

  revalidatePath(`/dashboard/editor/${topicId}`);
  return { content: newContent };
}

export async function saveDraftManually(topicId: string, content: string) {
  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { content }
  });
  revalidatePath(`/dashboard/editor/${topicId}`);
}

export async function submitForReview(topicId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: true }
  });

  if (!user || user.workspaces.length === 0) throw new Error("User has no workspace");

  const primaryWorkspaceId = user.workspaces[0].workspaceId;

  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { 
      status: "Review",
      workspaceId: primaryWorkspaceId // Fixes the "invisible" dashboard issue
    }
  });

  revalidatePath("/dashboard/library");
  revalidatePath(`/dashboard/editor/${topicId}`);
  revalidatePath("/dashboard"); 
}

export async function rejectToInProgress(topicId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { status: "In Progress" }
  });

  revalidatePath(`/dashboard/editor/${topicId}`);
  revalidatePath("/dashboard/library");
  revalidatePath("/dashboard");
}

export async function addComment(topicId: string, text: string, role: Role, userName: string) {
  await prisma.comment.create({
    data: { text, role, userName: userName || "Team Member", topicId }
  });
  revalidatePath(`/dashboard/editor/${topicId}`);
}

export async function resolveComment(commentId: string, topicId: string) {
  await prisma.comment.update({
    where: { id: commentId },
    data: { isResolved: true }
  });
  revalidatePath(`/dashboard/editor/${topicId}`);
}