"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const website = formData.get("website") as string;
  const brandDescription = formData.get("brandDescription") as string;

  await prisma.user.update({
    where: { email: session.user.email },
    data: { 
      website, 
      brandDescription 
    }
  });

  // Instantly refresh the dashboard so the new data shows up
  revalidatePath("/dashboard");
}