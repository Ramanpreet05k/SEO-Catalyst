"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import * as cheerio from "cheerio";

export type SEOIssue = {
  id: string;
  type: "critical" | "warning" | "passed";
  title: string;
  description: string;
  whyItMatters?: string;
  howToFix?: string[];
  codeSnippet?: string;
};

export async function runSeoAudit(): Promise<SEOIssue[]> {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.website) {
    throw new Error("No website configured in Workspace Settings.");
  }

  const issues: SEOIssue[] = [];
  
  try {
    // Fetch the HTML of the user's website
    const response = await fetch(user.website, { next: { revalidate: 3600 } });
    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. Check H1 Tags (Critical)
    const h1Count = $('h1').length;
    if (h1Count === 0) {
      issues.push({
        id: "missing-h1",
        type: "critical",
        title: "Missing H1 Tag on Homepage",
        description: "Your homepage is missing a primary H1 heading, affecting hierarchy and ranking.",
        whyItMatters: "Search engines use the H1 tag to understand the main topic of a page. A missing H1 is a missed opportunity for ranking for your primary keyword.",
        howToFix: [
          "Identify the main product or brand name for the page.",
          "Add an <h1> tag at the top of the content area.",
          "Ensure it is unique and descriptive."
        ],
        codeSnippet: `\n<h1 class="product-title">Premium Espresso Machine Series X</h1>`
      });
    } else {
      issues.push({ id: "pass-h1", type: "passed", title: "H1 Tag Present", description: "Homepage has an H1 tag." });
    }

    // 2. Check Meta Description (Warning)
    const metaDesc = $('meta[name="description"]').attr('content');
    if (!metaDesc || metaDesc.trim() === '') {
      issues.push({
        id: "missing-meta-desc",
        type: "warning",
        title: "Missing Meta Descriptions",
        description: "Your homepage has an empty meta description. Google will generate its own snippet.",
        whyItMatters: "Meta descriptions act as ad copy in search results. A compelling description improves Click-Through Rate (CTR).",
        howToFix: ["Write a compelling description (150-160 characters) summarizing the page content."]
      });
    } else {
      issues.push({ id: "pass-meta", type: "passed", title: "Meta Description Present", description: "Homepage has a meta description." });
    }

    // 3. Check Image Alt Tags (Warning)
    const imagesWithoutAlt = $('img:not([alt])').length;
    if (imagesWithoutAlt > 0) {
      issues.push({
        id: "missing-alts",
        type: "warning",
        title: `Missing Alt Attributes on ${imagesWithoutAlt} Images`,
        description: `We found ${imagesWithoutAlt} images without alt text on your homepage.`,
        whyItMatters: "Alt text describes images to search engines and visually impaired users. Missing alts hurt accessibility and image search rankings.",
        howToFix: ["Add descriptive alt text to every <img> tag.", "Keep it concise and relevant to the image."]
      });
    }

    // 4. Check Title Tag (Critical)
    const title = $('title').text();
    if (!title) {
      issues.push({
        id: "missing-title",
        type: "critical",
        title: "Missing Title Tag",
        description: "Your page has no title tag defined in the <head>.",
        whyItMatters: "The title tag is the most important on-page SEO factor. It tells users and search engines what your page is about.",
        howToFix: ["Add a <title> tag inside your HTML <head>."]
      });
    }

    return issues;

  } catch (error) {
    console.error("Scraping failed:", error);
    throw new Error("Failed to scan website. Please ensure your URL is correct in settings.");
  }
}