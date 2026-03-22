"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TagForm } from "@/components/admin/TagForm";

type Tag = {
  id: string;
  label: string;
  prompt: string;
  tag_type: string;
  order_num: number;
  is_active: boolean;
  municipality_id: string;
};

const TYPE_LABELS: Record<string, string> = {
  purpose: "目的",
  category: "カテゴリ",
  scene: "シーン",
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editing, setEditing] = useState<Tag | null>(null);
  const [adding, setAdding] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/tags");
    const data = await res.json();
    if (data.tags) setTags(data.tags);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaved = () => {
    setEditing(null);
    setAdding(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("このタグを削除しますか？")) return;

    await fetch(`/api/admin/tags/${id}`, { method: "DELETE" });
    fetchData();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">AIタグ管理</h1>
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
          <TagForm
            tag={editing || undefined}
            onClose={() => { setAdding(false); setEditing(null); }}
            onSaved={handleSaved}
          />
        </div>
      )}

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-white/60 font-medium w-16">順番</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium">ラベル</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium">プロンプト</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-24">種別</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-16"></th>
            </tr>
          </thead>
          <tbody>
            {tags.map((tag) => (
              <tr
                key={tag.id}
                className="border-b border-[var(--border)] last:border-b-0 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3 text-[var(--text-muted)]">{tag.order_num}</td>
                <td
                  className="px-4 py-3 text-white cursor-pointer hover:text-blue-400 transition-colors"
                  onClick={() => { setEditing(tag); setAdding(false); }}
                >
                  {tag.label}
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] truncate max-w-xs">
                  {tag.prompt}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-xs bg-white/10 text-white/70">
                    {TYPE_LABELS[tag.tag_type] || tag.tag_type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        {tags.length}件のタグ
      </p>
    </div>
  );
}
