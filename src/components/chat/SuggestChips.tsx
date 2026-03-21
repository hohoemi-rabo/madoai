"use client";

import { Trash2, Baby, Recycle, HelpCircle } from "lucide-react";

type SuggestChipsProps = {
  onSelect: (text: string) => void;
  disabled?: boolean;
};

const suggestions = [
  { icon: Trash2, label: "粗大ごみの出し方", prompt: "粗大ごみの出し方を教えて" },
  { icon: Recycle, label: "ごみの分別方法", prompt: "ごみの分別方法を教えて" },
  { icon: Baby, label: "子育て支援制度", prompt: "子育て支援制度を教えて" },
  { icon: HelpCircle, label: "予防接種について", prompt: "子どもの予防接種について教えて" },
];

export function SuggestChips({ onSelect, disabled }: SuggestChipsProps) {
  return (
    <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-visible">
      {suggestions.map((s) => (
        <button
          key={s.label}
          onClick={() => onSelect(s.prompt)}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
        >
          <s.icon className="w-4 h-4 text-[var(--text-muted)]" />
          <span>{s.label}</span>
        </button>
      ))}
    </div>
  );
}
