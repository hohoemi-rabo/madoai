"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";

type Tag = {
  id?: string;
  label: string;
  prompt: string;
  tag_type: string;
  order_num: number;
};

type Props = {
  tag?: Tag;
  onClose: () => void;
  onSaved: () => void;
};

const TAG_TYPES = [
  { value: "purpose", label: "目的ベース" },
  { value: "category", label: "カテゴリベース" },
  { value: "scene", label: "シーンベース" },
];

const MUNICIPALITY_ID = "956e05cd-efae-4a7e-9278-8d4a7ec4e1e1";

export function TagForm({ tag, onClose, onSaved }: Props) {
  const isNew = !tag?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState(tag?.label || "");
  const [prompt, setPrompt] = useState(tag?.prompt || "");
  const [tagType, setTagType] = useState(tag?.tag_type || "purpose");
  const [orderNum, setOrderNum] = useState(tag?.order_num ?? 0);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const url = isNew ? "/api/admin/tags" : `/api/admin/tags/${tag.id}`;
      const method = isNew ? "POST" : "PATCH";

      const body = isNew
        ? { municipality_id: MUNICIPALITY_ID, label, prompt, tag_type: tagType, order_num: orderNum }
        : { label, prompt, tag_type: tagType, order_num: orderNum };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error || "保存に失敗しました");
      }
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium text-white">
          {isNew ? "タグを追加" : "タグを編集"}
        </h2>
        <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">ラベル</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="粗大ごみの出し方"
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">種別</label>
            <select
              value={tagType}
              onChange={(e) => setTagType(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            >
              {TAG_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">表示順</label>
            <input
              type="number"
              value={orderNum}
              onChange={(e) => setOrderNum(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">プロンプト（AIに送信する質問文）</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="粗大ごみの出し方を教えて"
          rows={2}
          className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30 resize-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !label || !prompt}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        {saving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}
