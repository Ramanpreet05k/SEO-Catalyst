import Link from "next/link";
import { ArrowRight, Bot, Target, Wand2, Users, Activity, CheckCircle2, Zap, Code2, Globe } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* --- NAVIGATION --- */}
      <nav className="border-b border-slate-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">SEO Catalyst</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-full shadow-sm transition-all hover:scale-105">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Dominate Search with the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Ultimate AI Content Pipeline.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            From competitor gap analysis to Answer Engine Optimization (AEO), SEO Catalyst provides everything marketing teams, think tanks, and deep-dive researchers need to rank higher and write faster.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/signup" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-1">
              Start Your Workspace <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 text-base font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-8 py-4 rounded-full shadow-sm transition-all">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* --- FEATURE GRID --- */}
      <section className="py-24 bg-white border-y border-slate-200 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">An Enterprise-Grade Engine</h2>
            <p className="text-slate-500">Every tool you need to research, draft, optimize, and publish.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Answer Engine Optimization</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Score your drafts for "Information Gain" to ensure they get cited by Perplexity, ChatGPT, and Google AI Overviews.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Competitor Intelligence</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Input a rival URL to scrape their content strategy and instantly inject high-value missing topics directly into your pipeline.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI Brand Editor</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                A gorgeous Rich Text editor that uses Gemini 2.0 to rewrite your content while strictly enforcing your custom brand voice.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Technical SEO Audits</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Scan your live website for missing H1s and Meta tags, and let our AI generate the exact code snippets to fix them.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Team Workspaces</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Invite writers, manage role-based access, leave inline feedback, and route articles through an automated review queue.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Search Visibility Tracking</h3>
              <p className="text-slate-600 leading-relaxed text-sm">
                Connect your Google Search Console to track real-time clicks, impressions, and ranking positions alongside your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- PIPELINE WORKFLOW SECTION --- */}
      <section className="py-24 px-6 relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black mb-4">A Streamlined Workflow</h2>
            <p className="text-slate-400">Move your content from raw idea to published authority seamlessly.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            {['Idea & Gap Analysis', 'AI-Assisted Drafting', 'Owner Review', 'Published & Audited'].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center relative w-full">
                <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-indigo-500 flex items-center justify-center text-xl font-black text-white mb-4 z-10 relative shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  {i + 1}
                </div>
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-200">{step}</h4>
                {i < 3 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-indigo-500 to-slate-800"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-24 px-6 bg-white text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Globe className="w-10 h-10 text-indigo-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Ready to command the SERPs?</h2>
          <p className="text-lg text-slate-500">
            Join the platform built for serious content teams. Create your workspace, invite your writers, and start optimizing today.
          </p>
          <div className="pt-4">
            <Link href="/signup" className="inline-flex items-center justify-center gap-2 text-lg font-bold bg-slate-900 hover:bg-black text-white px-10 py-5 rounded-full shadow-xl hover:scale-105 transition-all">
              Create Free Workspace <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-bold text-slate-500 pt-8">
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Setup in 60 seconds</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Unlimited drafts</li>
          </ul>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 border-t border-slate-200 bg-slate-50 text-center text-sm text-slate-500 font-medium">
        <p>© {new Date().getFullYear()} SEO Catalyst. Built for the modern web.</p>
      </footer>
    </div>
  );
}