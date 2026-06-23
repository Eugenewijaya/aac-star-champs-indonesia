"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Settings,
  LogOut,
  Monitor,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: LayoutGrid },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Nav */}
      <header className="bg-white border-b-4 border-amber-100 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow">
            <span className="text-xl">🗣️</span>
          </div>
          <div>
            <h1 className="font-black text-amber-600 text-lg leading-none">AAC</h1>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Star Champs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/board"
            id="enter-kid-mode"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black px-4 py-2 rounded-2xl shadow card-press text-sm transition-colors"
          >
            <Monitor size={16} />
            <span className="hidden sm:inline">Mode Anak</span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            id="logout-btn"
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-3 py-2 rounded-2xl card-press text-sm transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r-2 border-slate-100 p-4 gap-2 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all card-press ${
                  active
                    ? "bg-amber-50 text-amber-700 border-2 border-amber-200"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex border-t-2 border-slate-100 bg-white safe-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 text-xs font-bold transition-colors ${
                active ? "text-amber-600" : "text-slate-400"
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
