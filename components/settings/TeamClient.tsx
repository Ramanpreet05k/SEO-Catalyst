"use client";

import { useState, useTransition } from "react";
import { Users, UserPlus, Shield, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inviteMember, removeMember } from "@/app/actions/team"; 

export function TeamClient({ members }: { members: any[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"OWNER" | "WRITER">("WRITER");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setMessage({ type: "", text: "" });
    
    startTransition(async () => {
      try {
        await inviteMember(email, role);
        setMessage({ type: "success", text: `${email} added successfully!` });
        setEmail("");
      } catch (error: any) {
        setMessage({ type: "error", text: error.message || "Failed to add member." });
      }
    });
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member? They will lose access to all drafts.")) return;
    
    startTransition(async () => {
      try {
        await removeMember(memberId);
      } catch (error: any) {
        alert(error.message || "Failed to remove member.");
      }
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-8 h-8 text-indigo-600" /> Team Management
        </h1>
        <p className="text-slate-500 mt-2">Manage your workspace members and their roles.</p>
      </header>

      {/* Invite Form */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <UserPlus className="w-5 h-5" /> Add Member
        </h2>
        <form onSubmit={handleInvite} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none h-10"
            />
            <span className="text-[10px] text-slate-400 mt-1 ml-1">User must have an existing account.</span>
          </div>
          <select 
            value={role}
            onChange={(e) => setRole(e.target.value as "OWNER" | "WRITER")}
            className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none h-10"
          >
            <option value="WRITER">Writer</option>
            <option value="OWNER">Owner</option>
          </select>
          <Button 
            type="submit" 
            disabled={isPending || !email}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-10"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Team"}
          </Button>
        </form>
        {message.text && (
          <p className={`mt-3 text-xs font-bold ${message.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Members List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Member</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500">Role</th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900">{member.user.name || "Unnamed User"}</div>
                  <div className="text-xs text-slate-500">{member.user.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                    member.role === 'OWNER' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {member.role === 'OWNER' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleRemove(member.id)}
                    disabled={isPending}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}