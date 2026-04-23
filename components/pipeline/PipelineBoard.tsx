"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTopicStatus, deleteTopic, addPipelineTopic } from "@/app/actions/topic";
import { GripVertical, Loader2, ArrowUpRight, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const COLUMNS = ["Idea", "To Do", "In Progress", "Ready", "Published"];

export function PipelineBoard({ initialTopics }: { initialTopics: any[] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [isPending, startTransition] = useTransition();
  const [draggedTopicId, setDraggedTopicId] = useState<string | null>(null);
  
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  
  const router = useRouter();

  // FIX: Type the event as 'any' to bridge the gap between Framer Motion and Native DnD
  const handleDragStart = (e: any, id: string) => {
    setDraggedTopicId(id);
    
    // Check if it's a native drag event before accessing dataTransfer
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      // Optional: Set a drag image or data if needed
      e.dataTransfer.setData("text/plain", id);
    }

    setTimeout(() => {
      const el = document.getElementById(`card-${id}`);
      if (el) el.classList.add("opacity-20");
    }, 0);
  };

  const handleDragEnd = (e: any, id: string) => {
    setDraggedTopicId(null);
    const el = document.getElementById(`card-${id}`);
    if (el) el.classList.remove("opacity-20");
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTopicId) return;

    setTopics((prev) => 
      prev.map((t) => t.id === draggedTopicId ? { ...t, status: newStatus } : t)
    );

    startTransition(async () => {
      try {
        await updateTopicStatus(draggedTopicId, newStatus);
        router.refresh();
      } catch (err) {
        setTopics(initialTopics);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this topic?")) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteTopic(id);
        setTopics((prev) => prev.filter(t => t.id !== id));
        router.refresh();
      } finally {
        setDeletingId(null);
      }
    });
  };

  const handleAddTopic = (e: React.FormEvent, column: string) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const titleToSave = newTopicName;
    setNewTopicName("");
    setAddingToColumn(null);

    startTransition(async () => {
      try {
        await addPipelineTopic(titleToSave, column);
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-260px)] min-h-[500px] custom-scrollbar">
      {COLUMNS.map((column) => {
        const columnTopics = topics.filter(t => t.status === column);
        
        return (
          <div 
            key={column}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column)}
            className="flex flex-col flex-shrink-0 w-[300px] h-full bg-slate-50/50 border border-slate-200/60 rounded-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200/60 bg-white/50 backdrop-blur-sm flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500">{column}</h3>
              <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-sm">
                {columnTopics.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {columnTopics.map((topic) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={topic.id}
                    id={`card-${topic.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, topic.id)}
                    onDragEnd={(e) => handleDragEnd(e, topic.id)}
                    className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-md transition-all group relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[9px] font-bold uppercase tracking-tighter text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {topic.priority || 'Medium'}
                      </span>
                      <GripVertical className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 leading-tight mb-3">{topic.topicName}</h4>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                      <span className="text-[10px] font-bold text-slate-400 truncate max-w-[100px]">{topic.coreEntity}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(topic.id)} disabled={deletingId === topic.id} className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                          {deletingId === topic.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                        <Link href={`/dashboard/editor/${topic.id}`} className="text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {addingToColumn === column ? (
                <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={(e) => handleAddTopic(e, column)} className="p-3 bg-white rounded-xl border-2 border-indigo-500 shadow-lg flex flex-col gap-3">
                  <input autoFocus value={newTopicName} onChange={(e) => setNewTopicName(e.target.value)} placeholder="Article title..." className="text-sm font-bold outline-none text-slate-900 placeholder:text-slate-300" />
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setAddingToColumn(null)} className="text-[10px] font-bold text-slate-400 uppercase">Cancel</button>
                    <button type="submit" disabled={isPending} className="text-[10px] font-bold text-indigo-600 uppercase">{isPending ? "..." : "Add"}</button>
                  </div>
                </motion.form>
              ) : (
                <button onClick={() => setAddingToColumn(column)} className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all border-2 border-dashed border-transparent hover:border-slate-200">
                  <Plus className="w-3 h-3" /> New Card
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}