import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path if needed

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    // If the query is too short, return an empty array
    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] }, { status: 200 });
    }

    // Search the database for competitors with matching names
    const competitors = await prisma.competitor.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive", // Case-insensitive search
        },
      },
      select: {
        name: true,
        url: true,
      },
      distinct: ["name"], // Prevents showing 5 identical "Apple" entries if multiple users tracked it
      take: 5, // Only return the top 5 matches
    });

    return NextResponse.json({ results: competitors }, { status: 200 });
  } catch (error) {
    console.error("Competitor Search Error:", error);
    return NextResponse.json({ error: "Failed to search competitors" }, { status: 500 });
  }
}