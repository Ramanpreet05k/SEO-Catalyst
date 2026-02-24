"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function requestAiEdit(topicId: string, currentContent: string, instruction: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  const topic = await prisma.seoTopic.findUnique({
    where: { id: topicId, userId: user.id }
  });

  if (!topic) throw new Error("Topic not found.");

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert SEO copywriter and editor. 
      Below is the current draft of an article titled "${topic.topicName}".
      
      CURRENT DRAFT:
      """
      ${currentContent || "(This draft is currently empty. Please write it from scratch based on the title and instructions.)"}
      """

      THE USER INSTRUCTION:
      "${instruction}"

      Rewrite or update the draft to perfectly fulfill the user's instruction. 
      Return ONLY the formatted markdown content. Do not include introductory or concluding conversational filler (e.g., "Here is the rewritten version:").
    `;

    const result = await model.generateContent(prompt);
    let newContent = result.response.text().trim();
    
    // Clean up potential markdown code block wrappers
    if (newContent.startsWith("```markdown")) {
        newContent = newContent.replace(/^```markdown\n/, "").replace(/\n```$/, "");
    }

    // Save the new draft to the database
    await prisma.seoTopic.update({
      where: { id: topicId },
      data: { 
        content: newContent,
        status: "In Progress" // Update pipeline status automatically
      }
    });

    revalidatePath(`/dashboard/editor/${topicId}`);
    revalidatePath("/dashboard/pipeline");

    return { content: newContent };
  } catch (error) {
    console.error("AI Edit Failed:", error);
    throw new Error("Failed to process AI edit. Please try again.");
  }
}

// Simple function to save manual typing
export async function saveDraftManually(topicId: string, content: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  await prisma.seoTopic.update({
    where: { id: topicId },
    data: { content }
  });
}