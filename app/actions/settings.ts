"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWorkspaceSettings(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  let website = formData.get("website") as string;
  const brandDescription = formData.get("brandDescription") as string;
  const region = formData.get("region") as string;
  const language = formData.get("language") as string;
  
  // Basic cleanup
  if (website) {
    website = website.trim().replace(/\/$/, "");
    if (!website.startsWith("http://") && !website.startsWith("https://")) {
      website = `https://${website}`;
    }
  }

  // Save the real, useful data to the database
  await prisma.user.update({
    where: { email: session.user.email },
    data: { 
      website,
      brandDescription,
      region,
      language
    }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/optimization");
  revalidatePath("/dashboard/competitors");
  revalidatePath("/dashboard/editor");

  return { success: true };
}