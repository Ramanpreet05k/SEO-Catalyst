import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { topicId, currentContent, missingKeywords } = await req.json();

    const topic = await prisma.seoTopic.findUnique({ where: { id: topicId } });
    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // UPDATED STRICT PROMPT
    const prompt = `You are a master SEO editor.
    Here is a working draft for the article "${topic.topicName}":
    
    ${currentContent}
    
    Your task is to Maximize Keyword Coverage. 
    CRITICAL INSTRUCTION: You MUST seamlessly and naturally weave these EXACT missing keywords into the draft: ${missingKeywords.join(", ")}.
    Do NOT use synonyms. You must use the exact phrases provided. Please wrap these newly added keywords in <strong> tags.
    
    DO NOT delete the user's existing points or dramatically change their voice. Just enhance and expand it to include the missing entities.
    
    Format the response strictly in valid HTML using ONLY: <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>. 
    Do NOT include markdown blocks (\`\`\`html). Return only the raw HTML.`;

    const result = await model.generateContent(prompt);
    const html = result.response.text().replace(/```html\n?/g, '').replace(/```\n?/g, '');

    return NextResponse.json({ success: true, html });

  } catch (error) {
    return NextResponse.json({ error: "Failed to maximize coverage" }, { status: 500 });
  }
}