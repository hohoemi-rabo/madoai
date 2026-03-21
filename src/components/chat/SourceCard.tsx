"use client";

import { ExternalLink, Phone } from "lucide-react";

type Source = {
  url: string;
  title: string;
  municipality_name: string;
};

type Spot = {
  department: string;
  phone: string;
};

type SourceCardProps = {
  sources: Source[];
  spots: Spot[];
};

export function SourceCard({ sources, spots }: SourceCardProps) {
  if (sources.length === 0 && spots.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {sources.length > 0 && (
        <div className="bg-white/5 border border-[var(--border)] rounded-[var(--radius-lg)] p-3">
          <p className="text-xs text-[var(--text-muted)] mb-2">参考ページ</p>
          <div className="space-y-1.5">
            {sources.map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{s.title}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {spots.length > 0 && (
        <div className="bg-white/5 border border-[var(--border)] rounded-[var(--radius-lg)] p-3">
          <p className="text-xs text-[var(--text-muted)] mb-2">お問い合わせ</p>
          <div className="space-y-1">
            {spots.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-white/80">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-[var(--text-muted)]" />
                <span>{s.department}: {s.phone}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
