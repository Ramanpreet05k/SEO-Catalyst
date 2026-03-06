"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateWorkspaceSettings(formData: FormData) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Extract only the fields we kept
  const website = formData.get("website") as string;
  const brandVoice = formData.get("brandVoice") as string;

  // Verify the user is the Owner of the workspace
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: { where: { role: "OWNER" }, take: 1 } }
  });

  if (!user) throw new Error("User not found.");

  const workspaceId = user.workspaces[0]?.workspaceId;
  if (!workspaceId) throw new Error("Only owners can update workspace settings.");

  // 1. Update the Workspace (Brand Voice)
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { brandVoice }
  });

  // 2. Update the User profile (Website)
  await prisma.user.update({
    where: { id: user.id },
    data: { website }
  });

  revalidatePath("/dashboard/settings");
}