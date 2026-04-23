"use client";

import { useState, useTransition } from "react";
import { Bell, Menu, User, ChevronDown, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { signOut } from "next-auth/react";
import { updateUserName } from "@/app/actions/user";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSaveName = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        await updateUserName(newName);
        setIsProfileModalOpen(false);
        setNewName(""); // Clear input after success
      } catch (error) {
        alert("Failed to update name.");
      }
    });
  };

  return (
    <>
      <header className="h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
        <div className="flex items-center gap-4">
          {!sidebarOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSidebarOpen(true)}
              className="text-slate-500 hover:text-slate-900 hover:bg-slate-100/50 rounded-xl"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50/50 border border-indigo-100/80 text-indigo-600 rounded-full text-xs font-bold tracking-tight cursor-default">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pro Workspace</span>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          <Button variant="ghost" size="icon" className="relative text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors rounded-full">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative flex items-center gap-2 h-auto py-1 pl-1 pr-3 rounded-full border border-slate-200/60 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-inner border border-white/20">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-200/60 p-2 bg-white">
              <div className="px-2 py-2 mb-1">
                <p className="text-sm font-bold text-slate-900 tracking-tight">My Account</p>
                <p className="text-xs font-medium text-slate-500">Manage your workspace</p>
              </div>
              
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              <DropdownMenuItem 
                className="cursor-pointer text-sm font-semibold text-slate-700 focus:bg-slate-50 focus:text-slate-900 rounded-lg py-2 transition-colors"
                onSelect={() => setIsProfileModalOpen(true)}
              >
                Profile Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-100 my-1" />
              
              <DropdownMenuItem 
                className="cursor-pointer text-sm font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg py-2 transition-colors" 
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* --- PROFILE SETTINGS MODAL --- */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6 border-0 shadow-2xl bg-white">
          <div className="mb-4">
            <DialogTitle className="text-xl font-bold tracking-tight text-slate-900">Profile Settings</DialogTitle>
            <p className="text-sm text-slate-500 mt-1">Update your personal account details.</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Display Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter your new name" 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            
            <Button 
              onClick={handleSaveName}
              disabled={isPending || !newName.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl shadow-sm"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}