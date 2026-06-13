"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Users, Settings, Sparkles, LogOut } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  // Helper function to check if the link is active and apply the correct Tailwind classes
  const getLinkStyle = (path: string) => {
    // Check if the current URL matches the link's path
    const isActive = pathname === path || pathname?.startsWith(`${path}/`);
    
    return `flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
      isActive
        ? "bg-teal-50 text-teal-700" // Active state
        : "text-slate-600 hover:bg-slate-50 hover:text-teal-600" // Inactive state
    }`;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-slate-200 bg-white text-slate-600">
      {/* Logo Area */}
      <div className="flex h-20 items-center gap-2 border-b border-slate-100 px-8 font-bold text-xl text-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        Admin
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2 p-4">
        <Link 
          href="/dashboard" 
          className={getLinkStyle("/dashboard")}
        >
          <LayoutDashboard className="h-5 w-5" />
          Tableau de bord
        </Link>
        
        <Link 
          href="/planning" 
          className={getLinkStyle("/planning")}
        >
          <CalendarDays className="h-5 w-5" />
          Planning
        </Link>
        
        <Link 
          href="/staff" 
          className={getLinkStyle("/staff")}
        >
          <Users className="h-5 w-5" />
          Intervenants
        </Link>
        
        <Link 
          href="/settings" // Changed from "#" to "/settings" to make the active state work properly
          className={getLinkStyle("/settings")}
        >
          <Settings className="h-5 w-5" />
          Paramètres
        </Link>
      </nav>

      {/* Bottom Actions */}
      <div className="absolute bottom-8 left-0 w-full px-4">
        <button className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">
          <LogOut className="h-5 w-5" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}