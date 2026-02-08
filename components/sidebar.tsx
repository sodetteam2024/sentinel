"use client";

import { useState, type ElementType } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid,
  ScanSearch,
  Users,
  PanelsLeftBottom,
} from "lucide-react";

type NavItem = {
  key: string;
  label: string;
  icon: ElementType;
  path: string;
};

const navItems: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid, path: "/dashboard" },
  { key: "scanner", label: "Scanner", icon: ScanSearch, path: "/scanner" },
  { key: "afiliados", label: "Afiliados", icon: Users, path: "/afiliados" },
];

export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (item: NavItem) => {
    router.push(item.path);
  };

  return (
    <aside
      className={`bg-[#1f9bb6] text-white flex flex-col justify-between py-6 transition-all duration-300 shadow-xl ${
        expanded ? "w-64 px-4" : "w-20 px-2"
      }`}
    >
      {/* Botón expandir / contraer */}
      <div>
        <button
          onClick={() => setExpanded((prev) => !prev)}
          className="w-full mb-6 flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-3 py-2 transition"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20">
            <PanelsLeftBottom size={18} strokeWidth={2} />
          </div>

          {expanded && (
            <span className="text-sm font-semibold tracking-wide">
              Menú principal
            </span>
          )}
        </button>

        {/* Items de navegación */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.path);

            return (
              <button
                key={item.key}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-3 w-full rounded-2xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-white text-[#1f9bb6] shadow-lg"
                    : "bg-white/0 text-white hover:bg-white/10"
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    isActive ? "bg-[#e6f7fa]" : "bg-white/10"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className={isActive ? "text-[#1f9bb6]" : "text-white"}
                  />
                </span>

                {expanded && (
                  <span
                    className={`font-medium ${
                      isActive ? "text-[#1f9bb6]" : "text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Usuario */}
      <div className="mt-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-3">
          <div className="h-10 w-10 rounded-full bg-[#4fd1ff] flex items-center justify-center text-[#0f5b6a] font-bold">
            LF
          </div>

          {expanded && (
            <div className="flex flex-col text-xs leading-tight">
              <span className="font-semibold">Luis Florez</span>
              <span className="text-white/80">Administrador</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
