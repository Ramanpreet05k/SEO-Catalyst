"use client";
import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { Network, Plus, FileText, CheckCircle2, Clock, Edit3, Loader2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addClusterNode } from "@/app/actions/cluster";
type Topic = {
  id: string;
  topicName: string;
  status: string;
  coreEntity: string;
};

export function TopicClusterClient({ initialTopics }: { initialTopics: Topic[] }) {
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  
  // Extract unique core entities (Pillars)
  const pillars = useMemo(() => {
    const unique = Array.from(new Set(topics.map(t => t.coreEntity)));
    return unique.length > 0 ? unique : ["General SEO"];
  }, [topics]);

  const [activePillar, setActivePillar] = useState(pillars[0]);
  const [newNodeName, setNewNodeName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Get only the topics for the currently selected pillar
  const activeNodes = topics.filter(t => t.coreEntity === activePillar);

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) return;

    startTransition(async () => {
      try {
        const newNode = await addClusterNode(newNodeName, activePillar);
        setTopics([...topics, newNode]);
        setNewNodeName("");
        setIsAdding(false);
      } catch (error) {
        alert("Failed to add topic node.");
      }
    });
  };

  // --- MATH FOR ORBITAL LAYOUT ---
  const radius = 220; // Distance from center
  const centerX = 400; // SVG center X
  const centerY = 300; // SVG center Y

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Sidebar: Pillar Selection */}
      <div className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Network className="w-4 h-4 text-indigo-600" /> Semantic Pillars
          </h2>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Select a core entity to view its supporting topic cluster.</p>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {pillars.map((pillar) => {
            const nodeCount = topics.filter(t => t.coreEntity === pillar).length;
            return (
              <button
                key={pillar}
                onClick={() => setActivePillar(pillar)}
                className={`w-full text-left p-3 rounded-xl transition-all border ${
                  activePillar === pillar 
                    ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[13px] font-bold line-clamp-1 ${activePillar === pillar ? "text-indigo-900" : "text-slate-700"}`}>
                    {pillar}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activePillar === pillar ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                    {nodeCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Canvas: The Node Graph */}
      <div className="flex-1 relative bg-[#f8fafc] overflow-hidden flex items-center justify-center">
        
        {/* Background Grid Pattern for high-tech feel */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }}></div>

        <div className="relative w-[800px] h-[600px] animate-in zoom-in-95 duration-500">
          
          {/* SVG Connecting Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            {activeNodes.map((_, i) => {
              const angle = (i / activeNodes.length) * 2 * Math.PI;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              return (
                <line 
                  key={`line-${i}`} 
                  x1={centerX} 
                  y1={centerY} 
                  x2={x} 
                  y2={y} 
                  stroke="#cbd5e1" 
                  strokeWidth="2" 
                  strokeDasharray="6 6"
                />
              );
            })}
          </svg>

          {/* CENTRAL NODE (The Pillar Page) */}
          <div 
            className="absolute z-10 flex flex-col items-center justify-center text-center p-6 bg-slate-900 border-4 border-indigo-500 rounded-full shadow-2xl transition-transform hover:scale-105 cursor-pointer"
            style={{ 
              width: '160px', height: '160px', 
              left: `${centerX - 80}px`, top: `${centerY - 80}px` 
            }}
          >
            <Target className="w-8 h-8 text-indigo-400 mb-2" />
            <span className="text-white font-black text-sm leading-tight line-clamp-3">{activePillar}</span>
            <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider mt-2 bg-indigo-950/50 px-2 py-0.5 rounded-full">Core Entity</span>
          </div>

          {/* SATELLITE NODES (The Cluster Articles) */}
          {activeNodes.map((node, i) => {
            const angle = (i / activeNodes.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            // Determine styling based on status
            const isPublished = node.status === "Published";
            const isDrafting = node.status === "In Progress" || node.status === "Review";

            return (
              <div 
                key={node.id}
                className={`absolute z-10 flex flex-col p-4 w-48 bg-white border-2 rounded-2xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl group`}
                style={{ 
                  left: `${x - 96}px`, top: `${y - 48}px`,
                  borderColor: isPublished ? '#10b981' : isDrafting ? '#f59e0b' : '#e2e8f0'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-1.5 rounded-lg ${isPublished ? 'bg-emerald-100 text-emerald-600' : isDrafting ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                    {isPublished ? <CheckCircle2 className="w-4 h-4" /> : isDrafting ? <Clock className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <Link href={`/dashboard/editor/${node.id}`}>
                    <button className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 hover:bg-indigo-50 rounded-md">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
                <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">{node.topicName}</h3>
              </div>
            );
          })}

          {/* Floating "Add Node" Panel */}
          <div className="absolute bottom-4 right-4 z-20">
            {!isAdding ? (
              <Button 
                onClick={() => setIsAdding(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-full h-12 px-6 font-bold"
              >
                <Plus className="w-5 h-5 mr-2" /> Add Cluster Article
              </Button>
            ) : (
              <form onSubmit={handleAddNode} className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-200 flex flex-col gap-3 w-72 animate-in slide-in-from-bottom-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Node for "{activePillar}"</h4>
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. Best Settings for..." 
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)} className="flex-1 text-xs h-8">Cancel</Button>
                  <Button type="submit" disabled={isPending} className="flex-1 text-xs h-8 bg-indigo-600 hover:bg-indigo-700">
                    {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Create"}
                  </Button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}