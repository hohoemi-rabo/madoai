import { MessageCircle } from "lucide-react";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 py-3 bg-[var(--background)]/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white/80" />
          <span className="text-sm font-medium text-white/80">MADOAI</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className="text-xs text-white/50 hover:text-white/80 transition-colors"
          >
            このサービスについて
          </Link>
          <Link
            href="/admin/knowledge"
            className="text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            管理画面
          </Link>
        </div>
      </div>
    </header>
  );
}
