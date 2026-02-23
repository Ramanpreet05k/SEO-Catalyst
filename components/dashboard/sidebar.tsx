"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  TrendingUp, 
  ChevronLeft,
  Settings,
  Zap,
  Activity // 1. Added a new icon for the optimization tab
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Target, label: "Topic Pipeline", href: "/dashboard/topics" },
    { icon: Users, label: "Competitors", href: "/dashboard/competitors" },
    { icon: TrendingUp, label: "Visibility", href: "/dashboard/visibility" },
    // 2. Added the new Optimization route to your navigation list
    { icon: Activity, label: "Optimization", href: "/dashboard/optimization" }, 
  ];

  return (
    <aside 
      className={cn(
        "relative flex flex-col border-r bg-white transition-all duration-300 ease-in-out z-40",
        isOpen ? "w-64" : "w-0 -ml-px overflow-hidden"
      )}
    >
      {/* Brand Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-slate-900 text-white p-1 rounded-lg">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className={cn("transition-opacity", isOpen ? "opacity-100" : "opacity-0")}>
            Catalyst
          </span>
        </div>
        
        {/* Toggle Button to Move Sidebar Inside */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-slate-100 lg:flex hidden"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map((item) => {
          // Check if the current pathname includes the href to keep it highlighted on sub-pages
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group mb-1",
                isActive 
                  ? "bg-slate-100 text-slate-900 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}>
                <item.icon className={cn("w-4 h-4", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
                <span className="text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t space-y-2">
        <Link href="/dashboard/settings">
          <div className="flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-900 text-sm">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}