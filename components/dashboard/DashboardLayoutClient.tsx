"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar"; 
import { Navbar } from "./navbar";   

export default function DashboardLayoutClient({ 
  children,
  userRole 
}: { 
  children: React.ReactNode;
  userRole: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Automatically close sidebar on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    handleResize(); // Set initial state
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden relative">
      
      {/* MOBILE OVERLAY: Blurs the background when sidebar is open on phones */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* SIDEBAR WRAPPER: Handles the slide-in animation on mobile */}
      <div className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:w-0"}
      `}>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userRole={userRole} />
      </div>
      
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <Navbar sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}