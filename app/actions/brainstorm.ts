"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateAiTopics(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const keyword = formData.get("keyword") as string;
  if (!keyword) return;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  try {
    // 1. Switched to Flash (faster) and explicitly forced JSON output
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });
    
    // 2. Simplified prompt since we don't need to beg it to avoid markdown anymore
    const prompt = `
      You are an expert SEO strategist. The user wants to build authority around the keyword/topic: "${keyword}".
      Generate exactly 5 highly relevant, semantic SEO article topics that will help them rank.
      
      Respond with a JSON array of objects.
      Each object must have exactly these three keys:
      - "topicName" (The catchy, SEO-optimized title of the article)
      - "coreEntity" (A 1-2 word broad category for the article, e.g. "Email Marketing" or "Growth")
      - "priority" (Must be exactly "High", "Medium", or "Low")
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 3. Log it just in case so you can see the magic in your terminal
    console.log("Raw Gemini Output:", text);
    
    // 4. Safely parse the guaranteed JSON
    const topicsData = JSON.parse(text);

    // Map the AI data to your database schema
    const dbTopics = topicsData.map((t: any) => ({
      topicName: t.topicName,
      coreEntity: t.coreEntity,
      priority: t.priority,
      status: "Idea", 
      userId: user.id
    }));

    // Bulk insert
    await prisma.seoTopic.createMany({
      data: dbTopics
    });

    // Refresh pages
    revalidatePath("/dashboard/pipeline");
    revalidatePath("/dashboard");

  } catch (error) {
    console.error("AI Brainstorming Failed:", error);
    throw new Error("Failed to generate topics. Please try again.");
  }
}