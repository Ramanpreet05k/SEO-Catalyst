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

    const topic = await prisma.seoTopic.findUnique({
      where: { id: topicId },
      include: { user: true }
    });

    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // UPDATED PROMPT: Requesting strict HTML
    const prompt = `You are an expert SEO Content Strategist. Create a detailed, professional article outline for the topic: "${topic.topicName}".
    
    Context about the brand writing this: "${topic.user.brandDescription || 'A professional brand'}".
    Target Core Entity/Keyword: "${topic.coreEntity}".

    Format the response strictly in valid HTML. 
    Use ONLY these tags: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>. 
    Do NOT wrap the output in markdown blocks (like \`\`\`html). Just return the raw HTML string. Make it structured, clean, and highly professional.`;

    const result = await model.generateContent(prompt);
    let outline = result.response.text();
    
    // Clean up any accidental markdown formatting from the LLM
    outline = outline.replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, outline });

  } catch (error) {
    console.error("Outline Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate outline" }, { status: 500 });
  }
}