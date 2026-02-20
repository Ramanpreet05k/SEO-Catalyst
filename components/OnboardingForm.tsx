"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle 
} from "@/components/ui/dialog"
import { 
    Search, Plus, X, Loader2, ArrowRight, 
    Globe, Building2, CheckCircle2, ChevronLeft 
} from "lucide-react"

// --- Interfaces ---
interface Competitor {
    name: string;
    url: string;
}

export function OnboardingForm() {
    const router = useRouter()

    // --- Flow State ---
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // --- Brand Data State ---
    const [website, setWebsite] = useState("")
    const [brandDescription, setBrandDescription] = useState("")
    
    // --- Topics State (Gemini Powered) ---
    const [allTopics, setAllTopics] = useState<string[]>([])
    const [selectedTopics, setSelectedTopics] = useState<string[]>([])
    const [topicsLoading, setTopicsLoading] = useState(false)

    // --- Competitor UI State ---
    const [competitors, setCompetitors] = useState<Competitor[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<Competitor[]>([])
    const [showDropdown, setShowDropdown] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newBrand, setNewBrand] = useState<Competitor>({ name: "", url: "" })

    // --- Step 1: Save Brand Info ---
    const handleDomainSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            // Save initial brand details to DB so Gemini has context later
            const res = await fetch('/api/onboarding/save-brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ website, brandDescription })
            })
            if (res.ok) setStep(2)
        } catch (err) {
            console.error("Save failed", err)
        } finally {
            setLoading(false)
        }
    }

    // --- Step 5: Gemini Topic Generation ---
    const fetchGeminiTopics = useCallback(async () => {
        setTopicsLoading(true)
        try {
            const res = await fetch('/api/topic/generate')
            const data = await res.json()
            if (data.success && Array.isArray(data.suggestions)) {
                const topics = data.suggestions.map((s: any) => s.topic)
                setAllTopics(topics)
                setSelectedTopics(topics.slice(0, 3)) // Default select first 3
            }
        } catch (err) {
            console.error("Gemini failed", err)
            setAllTopics(["Brand Visibility", "SEO Strategy", "Market Trends"])
        } finally {
            setTopicsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (step === 5 && allTopics.length === 0) {
            fetchGeminiTopics()
        }
    }, [step, allTopics.length, fetchGeminiTopics])

    // --- Step 6: Competitor Search Logic ---
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length >= 2) {
                const res = await fetch(`/api/competitors/search?q=${encodeURIComponent(searchQuery)}`)
                const data = await res.json()
                setSearchResults(data.results || [])
                setShowDropdown(true)
            } else {
                setShowDropdown(false)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    const addCompetitor = (brand: Competitor) => {
        if (!competitors.find(c => c.name.toLowerCase() === brand.name.toLowerCase())) {
            setCompetitors([...competitors, brand])
        }
        setSearchQuery("")
        setShowDropdown(false)
    }

    // --- Final Submission ---
    const finishOnboarding = async () => {
        setIsSubmitting(true)
        try {
            const res = await fetch('/api/onboarding', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    website, 
                    brandDescription, 
                    topics: selectedTopics, 
                    competitors 
                })
            })
            if (res.ok) router.push("/dashboard")
        } catch (error) {
            console.error("Finalization failed", error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-12 px-6 relative">
            {/* Step Navigation */}
            {step > 1 && (
                <button onClick={() => setStep(step - 1)} className="absolute -left-12 top-14 text-slate-400 hover:text-slate-900 transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                </button>
            )}

            {/* --- STEP 1: BRAND INPUT --- */}
            {step === 1 && (
                <form onSubmit={handleDomainSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Start tracking your brand</h1>
                        <p className="text-slate-500 text-lg">Enter your details to begin visibility analysis.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Website URL</Label>
                            <Input placeholder="https://example.com" value={website} onChange={(e) => setWebsite(e.target.value)} required className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-slate-700">Brand Description</Label>
                            <textarea 
                                className="w-full min-h-[120px] rounded-xl border border-slate-200 p-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                placeholder="What does your company do?"
                                value={brandDescription}
                                onChange={(e) => setBrandDescription(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin" /> : "Continue"}
                        </Button>
                    </div>
                </form>
            )}

            {/* --- Intermediary steps (2, 3, 4) omitted for brevity - logic same as previous versions --- */}
            {step >= 2 && step <= 4 && (
                <div className="text-center py-20 space-y-6 animate-in fade-in">
                    <h1 className="text-3xl font-bold">Step {step}: Analysis & Configuration</h1>
                    <Button onClick={() => setStep(step + 1)} className="bg-black text-white px-10 h-12 rounded-xl">Continue</Button>
                </div>
            )}

            {/* --- STEP 5: GEMINI TOPICS --- */}
            {step === 5 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Recommended SEO Topics</h1>
                        <p className="text-slate-500">AI-generated topics based on your brand profile.</p>
                    </div>

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {topicsLoading ? (
                            <div className="flex flex-col items-center py-10 gap-3">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                                <p className="text-sm font-medium text-slate-500">Gemini is analyzing your brand...</p>
                            </div>
                        ) : (
                            allTopics.map((topic, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => setSelectedTopics(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic])}
                                    className={`flex items-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedTopics.includes(topic) ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-200'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${selectedTopics.includes(topic) ? 'bg-slate-900 border-slate-900' : 'border-slate-300'}`}>
                                        {selectedTopics.includes(topic) && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                    <span className="font-semibold text-slate-900">{topic}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <Button onClick={() => setStep(6)} className="w-full h-14 bg-slate-900 text-white rounded-xl font-bold">Continue</Button>
                </div>
            )}

            {/* --- STEP 6: COMPETITORS --- */}
            {step === 6 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
                    <div className="space-y-3">
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Who are your main competitors?</h1>
                        <p className="text-slate-500 text-lg">Benchmarking visibility against these brands.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search brands..."
                                className="h-16 pl-12 pr-24 text-lg border-2 border-slate-200 rounded-2xl shadow-sm focus-visible:border-slate-900"
                                onKeyDown={(e) => e.key === 'Enter' && (setNewBrand({ name: searchQuery, url: "" }), setShowAddModal(true))}
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 border">ENTER ↵</div>
                        </div>

                        {showDropdown && (
                            <div className="absolute w-full mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
                                {searchResults.map((result, i) => (
                                    <button key={i} onClick={() => addCompetitor(result)} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 border-b last:border-0">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold">{result.name.charAt(0)}</div>
                                            <div><p className="font-bold">{result.name}</p><p className="text-xs text-slate-400">{result.url}</p></div>
                                        </div>
                                        <Plus className="w-6 h-6 text-slate-300" />
                                    </button>
                                ))}
                                <button onClick={() => { setNewBrand({ name: searchQuery, url: "" }); setShowAddModal(true); }} className="w-full p-5 bg-slate-50 text-blue-600 font-bold text-sm">+ Add "{searchQuery}" manually</button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3 pt-2">
                            {competitors.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border-2 border-slate-100 shadow-sm animate-in scale-95">
                                    <span className="text-sm font-bold text-slate-800">{c.name}</span>
                                    <button onClick={() => setCompetitors(competitors.filter(x => x.name !== c.name))}><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                                </div>
                            ))}
                        </div>

                        <Button onClick={finishOnboarding} disabled={isSubmitting || competitors.length === 0} className="w-full h-16 bg-slate-900 text-white rounded-2xl text-xl font-bold shadow-lg">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : <span className="flex items-center gap-3">Submit & Generate Strategy <ArrowRight /></span>}
                        </Button>
                    </div>
                </div>
            )}

            {/* --- ADD MODAL --- */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="sm:max-w-[480px] rounded-[2rem] p-10">
                    <DialogHeader><DialogTitle className="text-2xl font-black">Add New Competitor</DialogTitle></DialogHeader>
                    <div className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-black uppercase tracking-widest">Company Name</Label>
                            <div className="relative"><Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={newBrand.name} onChange={(e) => setNewBrand({...newBrand, name: e.target.value})} className="h-14 pl-12 bg-slate-50 border-none rounded-2xl font-bold text-lg" /></div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-black uppercase tracking-widest">Website URL</Label>
                            <div className="relative"><Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><Input value={newBrand.url} onChange={(e) => setNewBrand({...newBrand, url: e.target.value})} className="h-14 pl-12 border-2 border-slate-100 rounded-2xl font-bold text-lg" /></div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => setShowAddModal(false)} className="flex-1 h-14 rounded-2xl font-black">Cancel</Button>
                        <Button onClick={() => { addCompetitor(newBrand); setShowAddModal(false); }} className="flex-1 h-14 bg-slate-900 text-white rounded-2xl font-black">Add Brand</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}