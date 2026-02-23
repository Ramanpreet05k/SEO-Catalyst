"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateTopicStatus, deleteTopic, addPipelineTopic } from "@/app/actions/topic";
import { GripVertical, Edit3, Loader2, ArrowUpRight, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COLUMNS = ["Idea", "To Do", "In Progress", "Ready", "Published"];

export function PipelineBoard({ initialTopics }: { initialTopics: any[] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [isPending, startTransition] = useTransition();
  const [draggedTopicId, setDraggedTopicId] = useState<string | null>(null);
  
  // New States for Adding & Deleting
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addingToColumn, setAddingToColumn] = useState<string | null>(null);
  const [newTopicName, setNewTopicName] = useState("");
  
  const router = useRouter();

  // --- DRAG & DROP LOGIC ---
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTopicId(id);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      const el = document.getElementById(`card-${id}`);
      if (el) el.classList.add("opacity-40", "scale-95");
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent, id: string) => {
    setDraggedTopicId(null);
    const el = document.getElementById(`card-${id}`);
    if (el) el.classList.remove("opacity-40", "scale-95");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (!draggedTopicId) return;

    setTopics((prev) => 
      prev.map((t) => t.id === draggedTopicId ? { ...t, status: newStatus } : t)
    );

    startTransition(async () => {
      await updateTopicStatus(draggedTopicId, newStatus);
      router.refresh();
    });
  };

  // --- DELETE LOGIC ---
  const handleDelete = (id: string) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteTopic(id);
      setTopics((prev) => prev.filter(t => t.id !== id));
      setDeletingId(null);
      router.refresh();
    });
  };

  // --- ADD LOGIC ---
  const handleAddTopic = (e: React.FormEvent, column: string) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const tempId = `temp-${Date.now()}`;
    
    // Optimistic UI Update
    setTopics((prev) => [...prev, {
      id: tempId,
      topicName: newTopicName,
      status: column,
      priority: "Medium",
      coreEntity: "General"
    }]);

    const titleToSave = newTopicName;
    setNewTopicName("");
    setAddingToColumn(null);

    // Save to DB
    startTransition(async () => {
      await addPipelineTopic(titleToSave, column);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-260px)] min-h-[500px] custom-scrollbar">
      {COLUMNS.map((column) => {
        const columnTopics = topics.filter(t => t.status === column);
        
        return (
          <div 
            key={column}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column)}
            className="flex flex-col flex-shrink-0 w-[300px] h-full bg-slate-50/80 border border-slate-200/60 rounded-xl overflow-hidden shadow-sm"
          >
            {/* Column Header */}
            <div className="p-3 border-b border-slate-200/60 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">{column}</h3>
              <span className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">
                {columnTopics.length}
              </span>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 custom-scrollbar">
              {columnTopics.map((topic) => (
                <div
                  key={topic.id}
                  id={`card-${topic.id}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, topic.id)}
                  onDragEnd={(e) => handleDragEnd(e, topic.id)}
                  className="bg-white border border-slate-200 p-3.5 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all group relative flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600`}>
                      {topic.priority || 'Medium'} Priority
                    </span>
                    <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                    {topic.topicName}
                  </h4>
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
                    <span className="text-[11px] font-medium text-slate-500 truncate max-w-[130px]">
                      {topic.coreEntity || "General"}
                    </span>
                    
                    {/* Action Buttons: Delete & Edit */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleDelete(topic.id)}
                        disabled={deletingId === topic.id}
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded transition-colors"
                        title="Delete Topic"
                      >
                        {deletingId === topic.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                      <Link href={`/dashboard/editor/${topic.id}`} className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1 text-[11px] font-bold bg-slate-50 hover:bg-indigo-50 px-2 py-1 rounded">
                        Edit <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

              {/* Inline Add Card Feature */}
              {addingToColumn === column ? (
                <form onSubmit={(e) => handleAddTopic(e, column)} className="p-2.5 bg-white rounded-lg border border-indigo-300 shadow-sm flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                  <input 
                    autoFocus
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="What are you writing about?"
                    className="text-sm outline-none px-1 text-slate-900 placeholder:text-slate-400"
                  />
                  <div className="flex justify-end gap-1 mt-1">
                    <Button type="button" variant="ghost" onClick={() => {setAddingToColumn(null); setNewTopicName("");}} className="h-6 px-2 text-xs text-slate-500 hover:text-slate-700">Cancel</Button>
                    <Button type="submit" disabled={isPending || !newTopicName.trim()} className="h-6 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded">
                      {isPending && addingToColumn === column ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                    </Button>
                  </div>
                </form>
              ) : (
                <button 
                  onClick={() => setAddingToColumn(column)} 
                  className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-lg transition-colors border border-dashed border-transparent hover:border-slate-300"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Card
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
}