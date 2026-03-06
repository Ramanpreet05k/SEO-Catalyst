import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardLayoutClient from "@/components/dashboard/DashboardLayoutClient";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  // 1. Fetch the user's role securely on the server
  let userRole = "WRITER"; 
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { workspaces: { take: 1 } }
  });

  if (user?.workspaces?.[0]) {
    userRole = user.workspaces[0].role;
  }

  // 2. Pass the role to the Client Layout
  return (
    <DashboardLayoutClient userRole={userRole}>
      {children}
    </DashboardLayoutClient>
  );
}