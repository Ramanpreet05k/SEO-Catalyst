"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Users, TrendingUp, ChevronLeft, Settings, Zap, Activity, Library, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  userRole?: string;
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

  // Helper to auto-close sidebar on mobile when a link is clicked
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <aside 
      className={cn(
        "flex flex-col border-r bg-white h-full transition-all duration-300 w-64 lg:w-64",
        !isOpen && "lg:w-0 lg:overflow-hidden lg:opacity-0"
      )}
    >
      {/* Brand Logo & Controls */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-slate-900 text-white p-1 rounded-lg">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="truncate">Catalyst</span>
        </div>
        
        {/* Desktop Collapse Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-slate-100 hidden lg:flex shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Mobile Close Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 hover:bg-slate-100 lg:hidden shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/dashboard");
          
          return (
            <Link key={item.href} href={item.href} onClick={handleNavClick}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group mb-1",
                isActive 
                  ? "bg-slate-100 text-slate-900 font-bold" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}>
                <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
                <span className="text-sm truncate">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer Settings Area */}
      <div className="p-4 border-t space-y-1 bg-slate-50/50">
        {userRole === "OWNER" && (
          <Link href="/dashboard/settings/team" onClick={handleNavClick}>
            <div className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-sm",
              pathname.startsWith("/dashboard/settings/team")
                ? "bg-slate-100 text-slate-900 font-bold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <Users className={cn("w-4 h-4 shrink-0", pathname.startsWith("/dashboard/settings/team") ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
              <span className="truncate">Team Settings</span>
            </div>
          </Link>
        )}

        <Link href="/dashboard/settings" onClick={handleNavClick}>
          <div className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group text-sm",
            pathname === "/dashboard/settings"
              ? "bg-slate-100 text-slate-900 font-bold" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}>
            <Settings className={cn("w-4 h-4 shrink-0", pathname === "/dashboard/settings" ? "text-slate-900" : "text-slate-400 group-hover:text-slate-900")} />
            <span className="truncate">Settings</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}