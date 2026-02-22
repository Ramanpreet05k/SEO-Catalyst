import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topicId, keywords } = await req.json();

    const topic = await prisma.seoTopic.findUnique({ where: { id: topicId } });
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // UPDATED STRICT PROMPT
    const prompt = `You are an expert AEO Content Writer. 
    The article is about: "${topic.topicName}".
    
    Write a highly professional, engaging section for this article. 
    
    CRITICAL INSTRUCTION: You MUST naturally include these EXACT keyword phrases in your response: ${keywords.join(", ")}. 
    Do NOT use synonyms. You must use the exact phrases provided. Please wrap these specific keywords in <strong> tags so they stand out.
    
    Format the response strictly in valid HTML using ONLY: <h2>, <h3>, <p>, <ul>, <li>, <strong>. 
    Do NOT include markdown blocks (\`\`\`html). Return only the raw HTML.`;

    const result = await model.generateContent(prompt);
    const html = result.response.text().replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, html });

  } catch (error) {
    return NextResponse.json({ error: "Failed to generate section" }, { status: 500 });
  }
}