import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topicId } = await req.json();

    // Fetch the topic and user's brand description
    const topic = await prisma.seoTopic.findUnique({
      where: { id: topicId },
      include: { user: true }
    });

    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are an expert SEO Content Strategist. Create a detailed, professional article outline for the topic: "${topic.topicName}".
    
    Context about the brand writing this: "${topic.user.brandDescription || 'A professional brand'}".
    Target Core Entity/Keyword: "${topic.coreEntity}".

    Format the response strictly in plain text (using standard Markdown headers like ## and bullet points). 
    Do not include conversational filler, just the outline. Include a compelling H1 title at the top.`;

    const result = await model.generateContent(prompt);
    const outline = result.response.text();

    return NextResponse.json({ success: true, outline });

  } catch (error) {
    console.error("Outline Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate outline" }, { status: 500 });
  }
}