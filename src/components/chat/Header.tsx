import { MessageCircle } from "lucide-react";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-5 py-3 bg-[var(--background)]/80 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-white/80" />
        <span className="text-sm font-medium text-white/80">MADOAI</span>
      </div>
    </header>
  );
}
