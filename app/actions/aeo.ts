"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// --- NEW: Stealth Scraper for Brand Context ---
async function scrapeWebsiteContext(url: string) {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      next: { revalidate: 3600 } 
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove junk that distracts the AI
    $('script, style, nav, footer, header').remove();

    // Extract meaningful structural text
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || "";
    const h1 = $('h1').text().trim();
    
    // Grab the first chunk of body text to learn their actual tone of voice
    const paragraphs = $('p').text().replace(/\s+/g, ' ').trim().substring(0, 1500); 

    return `Website Title: ${title}\nMeta Description: ${description}\nMain H1: ${h1}\nSample Website Copy: ${paragraphs}`;
  } catch (error) {
    console.error("Failed to scrape brand context from", url);
    return null;
  }
}

export async function analyzeDraftForAEO(content: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Fetch BOTH the manual description AND the target website URL
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email },
    select: { brandDescription: true, website: true } 
  });

  if (!user) throw new Error("User not found");

  // 1. Get Manual Context
  const manualContext = user.brandDescription?.trim() 
    ? `User-provided Brand Guidelines: "${user.brandDescription}"`
    : "";

  // 2. Get Live Website Context via scraping
  let liveContext = "";
  if (user.website) {
    const scrapedData = await scrapeWebsiteContext(user.website);
    if (scrapedData) {
      liveContext = `Live Website Context (Extracted directly from their homepage):\n${scrapedData}`;
    }
  }

  // Combine them into a master brand identity block
  const brandConstraint = `
    STRICT BRAND IDENTITY & TONE:
    You must evaluate and rewrite this draft so it perfectly aligns with this company's identity.
    ${manualContext}
    ${liveContext}
  `;

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are an Answer Engine (like Perplexity or Google SGE). 
    Evaluate the following article draft to determine if you would cite it as a highly authoritative, unique source.
    
    ${brandConstraint}

    DRAFT CONTENT:
    """
    ${content || "(Empty Draft)"}
    """

    Generate a JSON response with exactly this structure:
    {
      "informationGainScore": <Number 0-100 representing how unique and brand-aligned this content is compared to generic web results>,
      "verdict": "<1 short sentence stating if this is cite-worthy>",
      "missingAngles": ["<String array of 2 unique, brand-aligned concepts the writer should add to stand out>"],
      "llmOptimizedSnippet": "<Generate a highly dense, fluff-free, 2-paragraph summary + 3 bullet points of the draft's core concepts. THIS MUST BE WRITTEN STRICTLY IN THE EXACT TONE OF THE BRAND IDENTITY PROVIDED ABOVE.>"
    }
  `;

  const result = await model.generateContent(prompt);
  let jsonString = result.response.text().trim();
  
  // Clean up markdown block if Gemini wraps it
  if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "");
  }

  return JSON.parse(jsonString);
}