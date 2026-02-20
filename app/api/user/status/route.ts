import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma"; // Adjust path if needed

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Fetch ONLY the onboarding flag to keep it blazing fast
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { onboardingCompleted: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ onboardingCompleted: user.onboardingCompleted }, { status: 200 });

  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}