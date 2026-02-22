"use client";

import { useState, useMemo } from "react";
import { 
  Sparkles, Save, Loader2, ArrowLeft, Target, CheckCircle2, Circle, Zap, Wand2, Layers, FileText, Type, Hash, Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveDocument } from "@/app/actions/topic";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TiptapEditor } from "@/components/editor/TiptapEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AIEditor({ topic }: { topic: any }) {
  const [content, setContent] = useState(topic.content || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [entities, setEntities] = useState<string[]>(topic.suggestedEntities || []);
  const [isGeneratingEntities, setIsGeneratingEntities] = useState(false);
  
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [isGeneratingSection, setIsGeneratingSection] = useState(false);
  const [isMaximizing, setIsMaximizing] = useState(false);

  // --- Core API Actions (Outline, Entities, Save, Sections) ---
  const handleGenerateOutline = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id })
      });
      const data = await res.json();
      if (data.success) setContent(data.outline + content); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEntities = async () => {
    setIsGeneratingEntities(true);
    try {
      const res = await fetch("/api/generate-entities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id })
      });
      const data = await res.json();
      if (data.success) setEntities(data.entities);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingEntities(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveDocument(topic.id, content);
    setTimeout(() => setIsSaving(false), 500);
  };

  const handleGenerateSection = async () => {
    if (selectedKeywords.length === 0) return;
    setIsGeneratingSection(true);
    try {
      const res = await fetch("/api/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, keywords: selectedKeywords })
      });
      const data = await res.json();
      if (data.success) {
        setContent(content + "<br>" + data.html); 
        setSelectedKeywords([]); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingSection(false);
    }
  };

  const handleMaximizeCoverage = async () => {
    const missingKeywords = entities.filter(e => !plainTextContent.includes(e.toLowerCase()));
    if (missingKeywords.length === 0 || !content) return;
    
    setIsMaximizing(true);
    try {
      const res = await fetch("/api/maximize-coverage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId: topic.id, currentContent: content, missingKeywords })
      });
      const data = await res.json();
      if (data.success) setContent(data.html); 
    } catch (error) {
      console.error(error);
    } finally {
      setIsMaximizing(false);
    }
  };

  // --- Real-Time Analytics Calculations ---
  
  // 1. Plain Text & Words
  const plainTextContent = useMemo(() => content.replace(/<[^>]*>?/gm, ''), [content]);
  const wordCount = useMemo(() => {
    const words = plainTextContent.trim().split(/\s+/);
    return words[0] === "" ? 0 : words.length;
  }, [plainTextContent]);

  // 2. Entity Math
  const coveredEntities = entities.filter(e => plainTextContent.toLowerCase().includes(e.toLowerCase()));
  const coveragePercent = entities.length === 0 ? 0 : Math.round((coveredEntities.length / entities.length) * 100);

  // 3. Headings Parser
  const headings = useMemo(() => {
    if (typeof window === "undefined") return { list: [], counts: { h1: 0, h2: 0, h3: 0 } };
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const hTags = doc.querySelectorAll("h1, h2, h3");
    
    const list: { tag: string, text: string }[] = [];
    const counts = { h1: 0, h2: 0, h3: 0 };
    
    hTags.forEach(h => {
      const tag = h.tagName.toLowerCase();
      list.push({ tag, text: h.textContent || "Empty Heading" });
      if (tag === "h1") counts.h1++;
      if (tag === "h2") counts.h2++;
      if (tag === "h3") counts.h3++;
    });
    
    return { list, counts };
  }, [content]);

  // 4. Auto-generated Metadata
  const defaultSlug = topic.topicName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const metaDescription = plainTextContent.substring(0, 155) + (plainTextContent.length > 155 ? "..." : "");

  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev => prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/dashboard" className="text-sm font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
        <div className="flex gap-3">
          <Button onClick={handleGenerateOutline} disabled={isGenerating} variant="outline" className="bg-indigo-50 border-indigo-100 text-indigo-700 font-bold hover:bg-indigo-100">
            {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Draft AI Outline
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-slate-900 text-white font-bold hover:bg-black">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: THE NEW TIPTAP EDITOR */}
        <div className="lg:col-span-8 space-y-4">
          <h1 className="text-4xl font-black text-slate-900 leading-tight">{topic.topicName}</h1>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest pb-8 border-b border-slate-100">
            <span>Entity: <span className="text-indigo-600">{topic.coreEntity}</span></span>
            <span>•</span>
            <span>Status: {topic.status}</span>
          </div>

          <TiptapEditor content={content} onChange={(html) => setContent(html)} />
        </div>

        {/* RIGHT: TABBED SIDEBAR */}
        <div className="lg:col-span-4">
          <Tabs defaultValue="analytics" className="w-full sticky top-10">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger value="entities" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Target className="w-3.5 h-3.5 mr-2" /> Entities
              </TabsTrigger>
              <TabsTrigger value="analytics" className="rounded-lg text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileText className="w-3.5 h-3.5 mr-2" /> Analytics
              </TabsTrigger>
            </TabsList>

            {/* --- TAB 1: SEMANTIC TRACKING --- */}
            <TabsContent value="entities">
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white flex flex-col max-h-[75vh]">
                <CardHeader className="pb-4 border-b border-slate-50 flex-shrink-0">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>Semantic Tracking</span>
                    <span className="text-xs font-bold text-slate-400">{coveragePercent}%</span>
                  </CardTitle>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${coveragePercent}%` }} />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4 flex-1 overflow-y-auto custom-scrollbar">
                  {entities.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">
                        Click entities to select them for AI generation
                      </p>
                      {entities.map((entity, i) => {
                        const isCovered = plainTextContent.toLowerCase().includes(entity.toLowerCase());
                        const isSelected = selectedKeywords.includes(entity);
                        
                        return (
                          <div key={i} onClick={() => toggleKeyword(entity)}
                            className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer border ${isSelected ? "border-indigo-400 bg-indigo-50/50 shadow-sm" : isCovered ? "border-transparent bg-emerald-50/50" : "border-transparent hover:bg-slate-50"}`}>
                            {isCovered ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" /> : <Circle className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-indigo-400" : "text-slate-300"}`} />}
                            <span className={`text-sm font-bold ${isSelected ? "text-indigo-700" : isCovered ? "text-emerald-700" : "text-slate-600"}`}>{entity}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Button onClick={handleGenerateEntities} disabled={isGeneratingEntities} className="w-full bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-sm">
                        {isGeneratingEntities ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2 text-amber-400" />}
                        Map Entities
                      </Button>
                    </div>
                  )}
                </CardContent>

                {entities.length > 0 && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl space-y-3 flex-shrink-0">
                    <Button onClick={handleGenerateSection} disabled={selectedKeywords.length === 0 || isGeneratingSection} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm">
                      {isGeneratingSection ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
                      Write Selected ({selectedKeywords.length})
                    </Button>
                    <Button onClick={handleMaximizeCoverage} disabled={coveragePercent === 100 || content.length < 50 || isMaximizing} variant="outline" className="w-full bg-white border-slate-200 text-slate-700 hover:text-slate-900 font-bold rounded-xl">
                      {isMaximizing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Layers className="w-4 h-4 mr-2 text-emerald-500" />}
                      Maximize Coverage
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* --- TAB 2: ANALYTICS & METADATA (NEW!) --- */}
            <TabsContent value="analytics" className="space-y-4">
              
              {/* Word Count Card */}
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center"><Type className="w-4 h-4 mr-2 text-indigo-500" /> Words</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">Total words in current draft</p>
                  </div>
                  <span className="text-2xl font-black text-slate-900">{wordCount.toLocaleString()}</span>
                </CardContent>
              </Card>

              {/* Headings Breakdown Card */}
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
                <CardHeader className="p-5 pb-3 border-b border-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center"><Hash className="w-4 h-4 mr-2 text-indigo-500" /> Headings</h3>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{headings.list.length} Total</span>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/50">
                    <div className="p-3 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">H1</p>
                      <p className="text-lg font-black text-slate-800">{headings.counts.h1}</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">H2</p>
                      <p className="text-lg font-black text-slate-800">{headings.counts.h2}</p>
                    </div>
                    <div className="p-3 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">H3</p>
                      <p className="text-lg font-black text-slate-800">{headings.counts.h3}</p>
                    </div>
                  </div>
                  <div className="p-5 max-h-48 overflow-y-auto custom-scrollbar space-y-3">
                    {headings.list.length > 0 ? headings.list.map((h, i) => (
                      <div key={i} className={`flex items-start gap-2 ${h.tag === 'h2' ? 'ml-4' : h.tag === 'h3' ? 'ml-8' : ''}`}>
                        <span className="text-[9px] font-black text-slate-400 uppercase mt-0.5 bg-slate-100 px-1 rounded">{h.tag}</span>
                        <p className="text-xs font-semibold text-slate-700 leading-snug">{h.text}</p>
                      </div>
                    )) : (
                      <p className="text-xs text-slate-400 italic text-center">No headings found.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Metadata Card */}
              <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
                <CardHeader className="p-5 pb-0">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center"><Globe className="w-4 h-4 mr-2 text-indigo-500" /> Metadata</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Defines how this page appears in search engines.</p>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Meta Title</label>
                    <p className="text-sm font-medium text-slate-900 bg-slate-50 p-2.5 rounded-lg border border-slate-100">{topic.topicName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">URL Slug</label>
                    <p className="text-sm font-medium text-indigo-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 break-all">{defaultSlug}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 mb-1 block">Meta Description</label>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed min-h-[60px]">
                      {metaDescription || "Start writing to auto-generate a description..."}
                    </p>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </div>

      </div>
    </div>
  );
}