import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { website: true, brandDescription: true }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an SEO content strategist. Based on the following brand information, suggest exactly 10 relevant and valuable content topics that would help this brand improve their SEO and answer engine optimization (AEO).

Brand Domain: ${user.website}
Description: ${user.brandDescription || 'No description provided'}

Requirements:
- Each topic should be specific, actionable, and relevant to the brand
- Topics should be SEO-friendly and answer-focused
- Return ONLY a valid JSON array of objects with this exact structure:
[
  {
    "topic": "Topic title here",
    "reason": "Brief explanation of why this topic is valuable"
  },
  ...
]

Return exactly 10 topics. Do not include any markdown formatting, code blocks, or additional text - only the JSON array.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    const suggestions = JSON.parse(text);

    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate topics" }, { status: 500 });
  }
}