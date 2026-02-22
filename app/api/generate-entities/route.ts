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
      where: { id: topicId }
    });

    if (!topic) return NextResponse.json({ error: "Topic not found" }, { status: 404 });

    // Force strict JSON mode for a clean array
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are an Answer Engine Optimization (AEO) expert. 
    The user is writing an article titled: "${topic.topicName}".
    The primary core entity/keyword is: "${topic.coreEntity}".

    Generate a list of 6 to 8 highly relevant Latent Semantic Indexing (LSI) keywords, secondary entities, or concepts that MUST be included in this article for a Large Language Model (like ChatGPT) to consider it authoritative.
    Keep the entities short (1 to 3 words max).

    Return ONLY a JSON object with this exact structure:
    {
      "entities": ["keyword 1", "keyword 2", "keyword 3"]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Failsafe parsing
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid JSON from Gemini");
    
    const data = JSON.parse(jsonMatch[0]);

    // Save the generated entities to the database
    await prisma.seoTopic.update({
      where: { id: topicId },
      data: { suggestedEntities: data.entities }
    });

    return NextResponse.json({ success: true, entities: data.entities });

  } catch (error) {
    console.error("Entity Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate entities" }, { status: 500 });
  }
}