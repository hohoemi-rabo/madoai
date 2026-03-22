"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Globe } from "lucide-react";
import { MunicipalityForm } from "@/components/admin/MunicipalityForm";

type Municipality = {
  id: string;
  code: string;
  name: string;
  name_kana: string;
  prefecture: string;
  website_url: string;
  is_active: boolean;
  knowledge_count: number;
  scraping_config: {
    base_url?: string;
    robots_txt_url?: string;
    crawl_delay_ms?: number;
    excluded_paths?: string[];
  } | null;
};

export default function MunicipalitiesPage() {
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [editing, setEditing] = useState<Municipality | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/municipalities");
    const data = await res.json();
    if (data.municipalities) setMunicipalities(data.municipalities);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaved = () => {
    setEditing(null);
    setAdding(false);
    fetchData();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">自治体管理</h1>
        <button
          onClick={() => { setAdding(true); setEditing(null); }}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          追加
        </button>
      </div>

      {(adding || editing) && (
        <div className="mb-6">
          <MunicipalityForm
            municipality={editing || undefined}
            onClose={() => { setAdding(false); setEditing(null); }}
            onSaved={handleSaved}
          />
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-white/60 font-medium">自治体名</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-24">コード</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium">HP URL</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-24">ナレッジ</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-24">ステータス</th>
            </tr>
          </thead>
          <tbody>
            {municipalities.map((m) => (
              <tr
                key={m.id}
                onClick={() => { setEditing(m); setAdding(false); }}
                className="border-b border-[var(--border)] last:border-b-0 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3 text-white">
                  {m.name}
                  {m.name_kana && (
                    <span className="ml-2 text-xs text-[var(--text-muted)]">({m.name_kana})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{m.code}</td>
                <td className="px-4 py-3">
                  <a
                    href={m.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span className="truncate max-w-48">{m.website_url}</span>
                  </a>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">{m.knowledge_count}件</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-[var(--radius-sm)] text-xs ${
                      m.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {m.is_active ? "有効" : "無効"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        {municipalities.length}件の自治体
      </p>
    </div>
  );
}
