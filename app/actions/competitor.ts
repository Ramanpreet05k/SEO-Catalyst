"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addCompetitor(formData: FormData) {
  // 1. Verify the user is logged in
  const session = await getServerSession();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  // 2. Extract data from the form
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;

  if (!name || !url) {
    throw new Error("Name and URL are required");
  }

  // 3. Get the user's ID
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 4. Insert the new competitor linked to the user's ID
  await prisma.competitor.create({
    data: {
      name,
      url,
      userId: user.id, // Connects the competitor to the current user
    },
  });

  // 5. Tell Next.js to refresh the dashboard page to show the new data instantly
  revalidatePath("/dashboard");
}