"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession } from "@/lib/auth";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Settings,
  Sparkles,
  LogOut,
  ShieldAlert,
  Menu,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/planning", label: "Planning", icon: CalendarDays },
  { href: "/staff", label: "Intervenants", icon: Users },
  { href: "/audit", label: "Journal d'Audit", icon: ShieldAlert },
  { href: "/settings", label: "Param\u00e8tres", icon: Settings },
];

// Large screens: a fixed sidebar on the left.
// Phones and tablets: a top bar with a menu button that opens the same links.
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // When the menu opens: move the focus into it, and let Escape close it.
  useEffect(() => {
    if (open === false) {
      return;
    }
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (path: string) =>
    pathname === path || Boolean(pathname?.startsWith(`${path}/`));

  const linkStyle = (path: string) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-colors ${
      isActive(path)
        ? "bg-teal-50 text-teal-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-teal-700"
    }`;

  const handleLogout = () => {
    clearSession();
    router.push("/");
  };

  const closeMenu = () => {
    setOpen(false);
    menuButtonRef.current?.focus();
  };

  const logo = (
    <span className="flex items-center gap-2 text-xl font-bold text-slate-800">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </span>
      Admin
    </span>
  );

  const nav = (onNavigate?: () => void) => (
    <nav aria-label="Navigation principale" className="flex flex-col gap-2 p-4">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          aria-current={isActive(href) ? "page" : undefined}
          className={linkStyle(href)}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  );

  const logoutButton = (
    <button
      type="button"
      onClick={handleLogout}
      className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 font-medium text-slate-600 transition-colors hover:border-red-100 hover:bg-red-50 hover:text-red-600"
    >
      <LogOut className="h-5 w-5" aria-hidden="true" />
      D&eacute;connexion
    </button>
  );

  return (
    <>
      {/* Phones and tablets: top bar with the menu button */}
      <div className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden print:hidden">
        {logo}
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Ouvrir le menu"
          aria-expanded={open}
          aria-controls="admin-menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            aria-hidden="true"
            onClick={closeMenu}
          />
          <div
            ref={drawerRef}
            id="admin-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl"
          >
            <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
              {logo}
              <button
                type="button"
                aria-label="Fermer le menu"
                onClick={closeMenu}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            {nav(() => setOpen(false))}
            <div className="mt-auto p-4">{logoutButton}</div>
          </div>
        </div>
      )}

      {/* Large screens: the fixed sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-slate-200 bg-white text-slate-600 lg:flex print:hidden">
        <div className="flex h-20 items-center border-b border-slate-100 px-8">
          {logo}
        </div>
        {nav()}
        <div className="mt-auto p-4 pb-8">{logoutButton}</div>
      </aside>
    </>
  );
}
