"use client";

import { Trash2, Baby, Recycle, HelpCircle, MapPin, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type Tag = {
  id: string;
  label: string;
  prompt: string;
  tag_type: string;
};

type SuggestChipsProps = {
  tags: Tag[];
  onSelect: (text: string) => void;
  disabled?: boolean;
};

const TAG_ICONS: Record<string, LucideIcon> = {
  purpose: Sparkles,
  category: Recycle,
  scene: MapPin,
};

const LABEL_ICONS: Record<string, LucideIcon> = {
  "粗大ごみ": Trash2,
  "ごみ": Recycle,
  "子育て": Baby,
  "予防接種": HelpCircle,
  "引っ越し": MapPin,
  "赤ちゃん": Baby,
};

function getIcon(tag: Tag): LucideIcon {
  for (const [keyword, icon] of Object.entries(LABEL_ICONS)) {
    if (tag.label.includes(keyword)) return icon;
  }
  return TAG_ICONS[tag.tag_type] || Sparkles;
}

export function SuggestChips({ tags, onSelect, disabled }: SuggestChipsProps) {
  if (tags.length === 0) return null;

  return (
    <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-visible">
      {tags.map((tag) => {
        const Icon = getIcon(tag);
        return (
          <button
            key={tag.id}
            onClick={() => onSelect(tag.prompt)}
            disabled={disabled}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-xl)] text-sm text-white/80 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Icon className="w-4 h-4 text-[var(--text-muted)]" />
            <span>{tag.label}</span>
          </button>
        );
      })}
    </div>
  );
}
