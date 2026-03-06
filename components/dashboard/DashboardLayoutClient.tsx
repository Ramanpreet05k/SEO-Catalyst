"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar"; // Adjust path if needed
import { Navbar } from "./navbar";   // Adjust path if needed

export default function DashboardLayoutClient({ 
  children,
  userRole // <-- It receives the role here
}: { 
  children: React.ReactNode;
  userRole: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden">
      {/* It passes the role down to the Sidebar here */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} userRole={userRole} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Navbar sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}