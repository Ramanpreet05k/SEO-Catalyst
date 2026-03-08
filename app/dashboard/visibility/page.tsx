import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { VisibilityClient } from "./VisibilityClient";
import { Eye } from "lucide-react";

export default async function VisibilityPage() {
  const session = await getServerSession();
  if (!session?.user?.email) redirect("/login");

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <Eye className="w-8 h-8 text-indigo-600" /> Search Visibility
        </h1>
        <p className="text-slate-500 mt-2">Monitor your actual Google Search Console performance and organic traffic growth.</p>
      </div>

      <VisibilityClient />
    </div>
  );
}