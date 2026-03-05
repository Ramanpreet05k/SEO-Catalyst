"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Imported the Trash2 icon for the delete button
import { FileText, CheckCircle2, Clock, Search, ExternalLink, Edit3, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Imported deleteTopic
import { createNewArticle, deleteTopic } from "@/app/actions/topic"; 

type Topic = {
  id: string;
  topicName: string;
  status: string;
  coreEntity: string;
  createdAt: Date;
};

export function ContentLibraryClient({ initialTopics }: { initialTopics: Topic[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"All" | "Drafts" | "Published">("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredTopics = initialTopics.filter(topic => {
    const matchesSearch = topic.topicName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === "Published") return topic.status === "Published";
    if (filter === "Drafts") return topic.status !== "Published";
    return true; 
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Published":
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Published</span>;
      case "In Progress":
      case "Review":
      case "To Do": // Added To Do to show up correctly as drafting
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> Drafting</span>;
      default:
        return <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"><FileText className="w-3 h-3" /> Idea</span>;
    }
  };

  const handleCreateArticle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Extracted from startTransition to fix the Next.js routing bug
    try {
      const newTopicId = await createNewArticle(formData);
      setIsModalOpen(false);
      // Force a hard navigation to the new ID
      window.location.href = `/dashboard/editor/${newTopicId}`;
    } catch (error) {
      alert("Failed to create article. Please try again.");
    }
  };

  // --- NEW: Handle Deletion ---
  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this article?")) return;
    
    startTransition(async () => {
      try {
        await deleteTopic(id);
        router.refresh(); // Visually removes the row from the table instantly
      } catch (error) {
        alert("Failed to delete article.");
      }
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Top Controls Bar */}
      <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          {(["All", "Drafts", "Published"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all ${
                filter === tab 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>
          
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl h-[42px] px-5 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> New Article
          </Button>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Article Title</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Status</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Core Topic</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs">Created</th>
              <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-xs text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredTopics.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                  <p className="font-medium">No articles found in this category.</p>
                </td>
              </tr>
            ) : (
              filteredTopics.map((topic) => (
                <tr key={topic.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900 line-clamp-1">{topic.topicName}</p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(topic.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                      {topic.coreEntity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                    {new Date(topic.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      <Link href={`/dashboard/editor/${topic.id}`}>
                        <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip-trigger" title="Open in AI Editor">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </Link>
                      
                      {topic.status === "Published" && (
                        <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors tooltip-trigger" title="View Live">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* NEW: Working Delete Button */}
                      <button 
                        onClick={() => handleDelete(topic.id)}
                        disabled={isPending}
                        className="p-2 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors tooltip-trigger disabled:opacity-50" 
                        title="Delete Article"
                      >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* NEW ARTICLE CREATION MODAL */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <DialogHeader className="bg-slate-50 p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Start a New Draft
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateArticle} className="p-6 bg-white space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Article Title (H1)
              </label>
              <input 
                type="text" 
                name="topicName"
                required
                placeholder="e.g. 10 Best SEO Strategies for 2026" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">
                Core Target Keyword / Entity
              </label>
              <input 
                type="text" 
                name="coreEntity"
                placeholder="e.g. SEO Strategy" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-black text-white font-bold rounded-xl h-11 shadow-sm"
              >
                Create & Open Editor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}