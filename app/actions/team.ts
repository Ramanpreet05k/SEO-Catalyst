"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function inviteMember(email: string, role: Role) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  // Find the current user and their workspace
  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: { where: { role: "OWNER" }, take: 1 } }
  });

  const workspaceId = currentUser?.workspaces[0]?.workspaceId;
  if (!workspaceId) throw new Error("Only owners can invite members.");

  // Check if the invited user exists in the system
  let userToInvite = await prisma.user.findUnique({ where: { email } });

  if (!userToInvite) {
    throw new Error("User not found. They must sign up for an account first.");
  }

  // Prevent adding if they are already in the workspace
  const existingMember = await prisma.workspaceMember.findFirst({
    where: { userId: userToInvite.id, workspaceId: workspaceId }
  });

  if (existingMember) {
    throw new Error("This user is already a member of your workspace.");
  }

  // Add them to the workspace silently in the database
  await prisma.workspaceMember.create({
    data: {
      userId: userToInvite.id,
      workspaceId: workspaceId,
      role: role
    }
  });

  revalidatePath("/dashboard/settings/team");
}

export async function removeMember(memberId: string) {
  const session = await getServerSession();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: { where: { role: "OWNER" } } }
  });

  if (!currentUser || currentUser.workspaces.length === 0) {
    throw new Error("Only owners can remove members.");
  }

  const memberToDelete = await prisma.workspaceMember.findUnique({
    where: { id: memberId }
  });

  if (memberToDelete?.userId === currentUser.id) {
    throw new Error("You cannot remove yourself from the workspace.");
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId }
  });

  revalidatePath("/dashboard/settings/team");
}