import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { website } = await req.json();
    if (!website) {
      return NextResponse.json({ success: false, error: "No website provided" }, { status: 400 });
    }

    const targetUrl = website.startsWith('http') ? website : `https://${website}`;
    
    // 1. Fetch with an 8-Second Timeout & Realistic User-Agent
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); 

    let html = "";
    try {
      const siteResponse = await fetch(targetUrl, { 
          headers: { 
            // Pretend to be a real Chrome browser so firewalls don't block the request
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
          },
          signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!siteResponse.ok) {
          return NextResponse.json({ success: false, error: "Website blocked the request (403/404)." }, { status: 403 });
      }
      html = await siteResponse.text();
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error("Fetch failed or timed out:", fetchError.message);
      return NextResponse.json({ success: false, error: "Website timed out or is invalid." }, { status: 408 });
    }

    // 2. Strip HTML to get raw readable text
    const rawText = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 10000); // Cap at 10,000 characters for Gemini stability

    if (!rawText || rawText.length < 50) {
       return NextResponse.json({ success: false, error: "Not enough readable text on website." }, { status: 400 });
    }

    // 3. Ask Gemini to evaluate the text (FORCED JSON MODE)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" } // Forces strict JSON response
    });

   const prompt = `You are a STRICT, BRUTALLY HONEST Answer Engine Optimization (AEO) auditor. 
    Analyze the following website text. Be harsh. Most websites score poorly because they use marketing fluff instead of clear, LLM-readable facts.

    Grade the text from 0 to 100 based strictly on:
    1. Entity Clarity: Are the brand, product, and target audience instantly obvious without human inference?
    2. Context Depth: Is there enough concrete factual data for an AI to confidently cite this website as a source?
    3. Fluff vs. Fact: Deduct heavy points for vague buzzwords (e.g., "next-gen synergy").

    Website Text:
    "${rawText}"

    Return ONLY a valid JSON object. Do NOT wrap it in markdown. Use this exact structure, but replace the placeholder values with your strict assessment:
    {
      "score": <insert integer from 0 to 100>,
      "status": "<choose one: Critical | Needs Work | Fair | Good | Excellent>",
      "reasoning": "<Provide a critical 1-sentence explanation of exactly why it lost points.>"
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // 4. Failsafe Regex Extraction: Extract only the content between the first { and last }
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Gemini did not return a valid JSON object.");
    }
    
    const aeoData = JSON.parse(jsonMatch[0]);

    // 5. Save to Database so it never has to scan again
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        aeoScore: aeoData.score,
        aeoStatus: aeoData.status,
      }
    });

    return NextResponse.json({ success: true, ...aeoData });

  } catch (error: any) {
    console.error("AEO Scan Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to analyze website." }, { status: 500 });
  }
}