"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addCompetitor(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const website = formData.get("website") as string;
  if (!website) return;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User not found");

  // Auto-generate a clean name from the URL to satisfy the database schema
  let autoName = website;
  try {
    const parsedUrl = new URL(website);
    autoName = parsedUrl.hostname.replace('www.', ''); // turns https://nykaa.com into nykaa.com
  } catch (error) {
    autoName = website; // Fallback just in case
  }

  // Create the record with the missing 'name' argument
  await prisma.competitor.create({
    data: {
      name: autoName, 
      url: website, // <--- CHANGED 'website' to 'url'
      userId: user.id
    }
  });

  revalidatePath("/dashboard");
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
}