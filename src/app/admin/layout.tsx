"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, Users, Calendar, MessageSquare, 
  Settings, LogOut, Menu, X, FileText, Image as ImageIcon,
  ShieldCheck, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/admin/leads", icon: Users },
  { name: "Appointments", href: "/admin/appointments", icon: Calendar },
  { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
  { name: "Services", href: "/admin/services", icon: FileText },
  { name: "FAQ", href: "/admin/faq", icon: HelpCircle },
  { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
  { name: "Website Content", href: "/admin/cms", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    // We will create the logout API route shortly
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold text-xl font-serif">
            <ShieldCheck size={24} />
            Admin Portal
          </div>
          <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 mt-2">Menu</p>
          {sidebarLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-white shadow-md shadow-primary/20" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-dark"
                )}
              >
                <link.icon size={18} className={cn(isActive ? "text-white" : "text-gray-500")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              A
            </div>
            <div className="hidden sm:block text-sm">
              <p className="font-semibold text-dark">Super Admin</p>
              <p className="text-xs text-gray-500">admin@thecarefirst.com</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}
