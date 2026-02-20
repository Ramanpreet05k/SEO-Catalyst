import { NextResponse } from "next/server";
import { getServerSession } from "next-auth"; 
import { prisma } from "@/lib/prisma"; 

export async function POST(req: Request) {
  try {
    // 1. Authenticate the User
    const session = await getServerSession();
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the form data
    const body = await req.json();
    const { website, brandDescription, region, language, topics, competitors } = body;

    // 3. Find the user in the database to get their actual MongoDB ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // 4. Update the User's main profile details
    await prisma.user.update({
      where: { id: user.id },
      data: {
        website,
        brandDescription,
        region,
        language,
        onboardingCompleted: true,
      }
    });

    // 5. Explicitly save Competitors with the User ID attached!
    if (competitors && competitors.length > 0) {
      await prisma.competitor.createMany({
        data: competitors.map((comp: { name: string, url: string }) => ({
          name: comp.name,
          url: comp.url || "",
          userId: user.id, // <--- SAVING THE USER ID HERE
        }))
      });
    }

    // 6. Explicitly save Topics with the User ID attached!
    if (topics && topics.length > 0) {
      await prisma.seoTopic.createMany({
        data: topics.map((topicStr: string) => ({
          topicName: topicStr,
          userId: user.id, // <--- SAVING THE USER ID HERE
        }))
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Data securely saved and linked to your User ID!" 
    }, { status: 200 });

  } catch (error: any) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}