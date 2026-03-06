"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Users, TrendingUp, ChevronLeft, Settings, Zap, Activity, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole?: string; // Added userRole prop
}

export function Sidebar({ isOpen, setIsOpen, userRole = "WRITER" }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Library, label: "Content Library", href: "/dashboard/library" }, 
    { icon: Users, label: "Competitors", href: "/dashboard/competitors" },
    { icon: TrendingUp, label: "Visibility", href: "/dashboard/visibility" },
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
          const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/dashboard");
          
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

      <div className="p-4 border-t space-y-1">
        {/* --- OWNER ONLY TEAM LINK --- */}
        {userRole === "OWNER" && (
          <Link href="/dashboard/settings/team">
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-sm",
              pathname.startsWith("/dashboard/settings/team")
                ? "bg-slate-100 text-slate-900 font-bold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <Users className={cn("w-4 h-4", pathname.startsWith("/dashboard/settings/team") ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
              <span>Team Settings</span>
            </div>
          </Link>
        )}

        <Link href="/dashboard/settings">
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-sm",
            pathname === "/dashboard/settings"
              ? "bg-slate-100 text-slate-900 font-bold" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}>
            <Settings className={cn("w-4 h-4", pathname === "/dashboard/settings" ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
            <span>Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}