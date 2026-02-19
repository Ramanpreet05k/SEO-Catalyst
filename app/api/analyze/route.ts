import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: Request) {
  try {
    // 1. Check if the key is actually loaded
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_actual_key_here") {
      return NextResponse.json({ 
        error: "Key Error", 
        message: "The server cannot see your API Key. Check your .env.local file." 
      }, { status: 500 });
    }

    // 2. Initialize Gemini with the specific API version
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Get URL from request
    const { url } = await req.json();

    // 4. Scraper with error handling
    const fetchResponse = await fetch(url);
    if (!fetchResponse.ok) throw new Error("Could not reach the website.");
    
    const html = await fetchResponse.text();
    const $ = cheerio.load(html);
    $('script, style, nav, footer').remove();
    const pageText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);

    // 5. Generate content
    const prompt = `Perform an SEO audit on this text: ${pageText}. Provide a target keyword and 3 tips.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ result: text });

  } catch (error: any) {
    console.error("DEBUG ERROR:", error.message);
    return NextResponse.json({ 
      error: "AI Failure", 
      message: error.message 
    }, { status: 500 });
  }
}