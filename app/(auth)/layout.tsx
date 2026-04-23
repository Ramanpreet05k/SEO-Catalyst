import Link from "next/link";
import { Zap } from "lucide-react"; 
import { ParticlesBackground } from "@/components/ParticlesBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid md:max-w-none md:grid-cols-2 md:px-0">
      
      {/* Left Side - Interactive Particles Pattern */}
      <div className="relative hidden h-full flex-col bg-white p-10 text-slate-900 border-r border-slate-200 lg:flex overflow-hidden">
        
        {/* Render the particles behind the logo */}
        <ParticlesBackground />
        
        {/* Brand Logo */}
        <div className="relative z-20 flex items-center text-xl font-black tracking-tight gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          SEO Catalyst
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="relative flex h-full items-center justify-center p-4 lg:p-8 bg-slate-50/50">
        
        {/* Mobile Logo (only visible on small screens) */}
        <div className="absolute left-4 top-4 z-20 flex items-center text-xl font-black tracking-tight gap-2 md:hidden">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          SEO Catalyst
        </div>
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {children}
          <p className="px-8 text-center text-sm text-slate-500">
            By clicking continue, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-4 hover:text-indigo-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4 hover:text-indigo-600">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}