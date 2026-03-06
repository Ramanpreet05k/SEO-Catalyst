"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as cheerio from "cheerio";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function addCompetitor(name: string, url: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  await prisma.competitor.create({
    data: { name, url, userId: user.id }
  });

  revalidatePath("/dashboard/competitors");
}

export async function deleteCompetitor(id: string) {
  await prisma.competitor.delete({ where: { id } });
  revalidatePath("/dashboard/competitors");
}

export async function analyzeCompetitorGap(competitorUrl: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // 1. Scrape the Competitor's website for context
  let competitorContext = "No live context available. Base assumptions on the URL.";
  try {
    const targetUrl = competitorUrl.startsWith('http') ? competitorUrl : `https://${competitorUrl}`;
    const response = await fetch(targetUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 } 
    });
    
    if (response.ok) {
      const html = await response.text();
      const $ = cheerio.load(html);
      $('script, style, nav, footer, header').remove();
      const title = $('title').text();
      const description = $('meta[name="description"]').attr('content') || "";
      const paragraphs = $('p').text().replace(/\s+/g, ' ').trim().substring(0, 1500);
      competitorContext = `Title: ${title}\nDescription: ${description}\nContent: ${paragraphs}`;
    }
  } catch (e) {
    console.error("Scraping failed", e);
  }

  // 2. Ask Gemini to find the content gaps
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" } 
  });
  
  const prompt = `
    You are an elite SEO and Content Strategist. Analyze this competitor's website content.
    Competitor URL: ${competitorUrl}
    
    Context scraped from their site:
    ${competitorContext}
    
    Identify 3 high-value, specific "Content Gaps"—topics they are writing about that we should steal and improve upon, OR topics they completely missed that represent an open opportunity.
    
    Return STRICTLY valid JSON with this structure:
    {
      "ideas": [
        {
          "topicName": "<Actionable, catchy title for the article>",
          "coreEntity": "<The main SEO keyword/entity (1-2 words)>",
          "reason": "<1 short sentence explaining why this specific topic beats or outsmarts the competitor>"
        }
      ]
    }
  `;

  const result = await model.generateContent(prompt);
  let jsonString = result.response.text().trim();
  
  // Clean up markdown block if Gemini wraps it
  if (jsonString.startsWith("```json")) {
      jsonString = jsonString.replace(/^```json\n/, "").replace(/\n```$/, "");
  }

  return JSON.parse(jsonString).ideas;
}

export async function addSuggestedTopic(topicName: string, coreEntity: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email },
    include: { workspaces: true }
  });
  
  if (!user || user.workspaces.length === 0) throw new Error("Workspace not found");
  const workspaceId = user.workspaces[0].workspaceId;

  // Inject the new topic directly into the To Do pipeline
  await prisma.seoTopic.create({
    data: {
      topicName,
      coreEntity,
      status: "To Do",
      priority: "High",
      userId: user.id,
      workspaceId: workspaceId
    }
  });

  revalidatePath("/dashboard/library");
}