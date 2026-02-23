"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import * as cheerio from "cheerio";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==========================================
// 1. ADD & DELETE COMPETITORS
// ==========================================

export async function addCompetitor(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const website = formData.get("website") as string;
  if (!website) return;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  let autoName = website;
  try {
    const parsedUrl = new URL(website.startsWith('http') ? website : `https://${website}`);
    autoName = parsedUrl.hostname.replace('www.', ''); 
  } catch (error) {
    autoName = website; 
  }

  await prisma.competitor.create({
    data: {
      name: autoName, 
      url: website, 
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/competitors");
}

export async function deleteCompetitor(competitorId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  await prisma.competitor.deleteMany({
    where: { 
      id: competitorId,
      userId: user.id 
    }
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/competitors");
}

// ==========================================
// 2. AI CONTENT GAP ANALYSIS ENGINE
// ==========================================

async function scrapePageText(url: string) {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, { next: { revalidate: 3600 } });
    
    if (!response.ok) {
      return { content: null, error: `Server returned a ${response.status} error.` };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || "";
    const h1 = $('h1').first().text();
    
    const h2s: string[] = [];
    $('h2').each((_, el) => {
      h2s.push($(el).text().trim());
    });

    return { 
      content: `Title: ${title}\nDescription: ${description}\nH1: ${h1}\nTopics Covered (H2s): ${h2s.join(", ")}`, 
      error: null 
    };
  } catch (error: any) {
    console.error(`Failed to scrape ${url}`, error);
    const reason = error.cause?.reason || error.cause?.code || error.message;
    return { content: null, error: reason };
  }
}

export async function runGapAnalysis(competitorId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.website) throw new Error("Please set your Target Website in Workspace Settings first.");

  const competitor = await prisma.competitor.findUnique({
    where: { id: competitorId, userId: user.id }
  });

  if (!competitor) throw new Error("Competitor not found.");

  const compUrl = (competitor as any).url || (competitor as any).website || competitor.name;

  const userScrape = await scrapePageText(user.website);
  const compScrape = await scrapePageText(compUrl);

  if (!userScrape.content) {
    throw new Error(`Failed to read your website (${user.website}): ${userScrape.error}`);
  }
  if (!compScrape.content) {
    throw new Error(`Failed to read competitor website (${compUrl}). Check for typos! Error: ${compScrape.error}`);
  }

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    You are an expert SEO Strategist. Compare these two website summaries.
    
    My Website:
    ${userScrape.content}

    Competitor Website:
    ${compScrape.content}

    Generate a JSON response with exactly this structure:
    {
      "scores": {
        "userScore": 85,
        "compScore": 70,
        "reasoning": "1 sentence explaining the scores"
      },
      "featureComparison": [
        { "feature": "Clear Pricing", "userStatus": "Yes", "compStatus": "No" }
      ],
      "myAdvantages": ["String array of 3 things I do better"],
      "competitorAdvantages": ["String array of 3 things they do better"],
      "actionPlan": ["String array of 3 actionable SEO steps"]
    }
    Ensure featureComparison has exactly 5 items.
  `;

  const result = await model.generateContent(prompt);
  const data = JSON.parse(result.response.text());

  return data;
}