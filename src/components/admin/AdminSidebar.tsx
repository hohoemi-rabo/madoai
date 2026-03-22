"use client";

import { Database, Building2, Tags, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin/knowledge", label: "ナレッジ", icon: Database, active: true },
  { href: "/admin/municipalities", label: "自治体", icon: Building2, active: true },
  { href: "/admin/tags", label: "タグ", icon: Tags, active: false },
  { href: "/admin/analytics", label: "分析", icon: BarChart3, active: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 border-r border-[var(--border)] bg-[var(--background)] h-full">
      <div className="px-4 py-5">
        <Link href="/admin/knowledge" className="text-sm font-semibold text-white/80">
          MADOAI Admin
        </Link>
      </div>
      <nav className="px-2 space-y-1">
        {navItems.map((item) => {
          const isCurrent = pathname.startsWith(item.href);
          return item.active ? (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ) : (
            <div
              key={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] text-sm text-white/30 cursor-not-allowed"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              <span className="ml-auto text-xs">準備中</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
