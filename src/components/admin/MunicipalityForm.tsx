"use client";

import { Save, X } from "lucide-react";
import { useState } from "react";

type Municipality = {
  id?: string;
  code: string;
  name: string;
  name_kana: string;
  prefecture: string;
  website_url: string;
  is_active: boolean;
  scraping_config: {
    base_url?: string;
    robots_txt_url?: string;
    crawl_delay_ms?: number;
    excluded_paths?: string[];
  } | null;
};

type Props = {
  municipality?: Municipality;
  onClose: () => void;
  onSaved: () => void;
};

export function MunicipalityForm({ municipality, onClose, onSaved }: Props) {
  const isNew = !municipality?.id;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState(municipality?.code || "");
  const [name, setName] = useState(municipality?.name || "");
  const [nameKana, setNameKana] = useState(municipality?.name_kana || "");
  const [prefecture, setPrefecture] = useState(municipality?.prefecture || "");
  const [websiteUrl, setWebsiteUrl] = useState(municipality?.website_url || "");
  const [isActive, setIsActive] = useState(municipality?.is_active ?? true);
  const [baseUrl, setBaseUrl] = useState(municipality?.scraping_config?.base_url || "");
  const [crawlDelay, setCrawlDelay] = useState(
    municipality?.scraping_config?.crawl_delay_ms ?? 2000
  );

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const body = {
      code,
      name,
      name_kana: nameKana,
      prefecture,
      website_url: websiteUrl,
      is_active: isActive,
      scraping_config: {
        base_url: baseUrl || websiteUrl,
        robots_txt_url: `${baseUrl || websiteUrl}/robots.txt`,
        crawl_delay_ms: crawlDelay,
        excluded_paths: [],
      },
    };

    try {
      const url = isNew
        ? "/api/admin/municipalities"
        : `/api/admin/municipalities/${municipality.id}`;
      const method = isNew ? "POST" : "PATCH";

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
          {isNew ? "自治体を追加" : "自治体を編集"}
        </h2>
        <button onClick={onClose} className="text-white/40 hover:text-white cursor-pointer">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">自治体名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">ふりがな</label>
          <input
            value={nameKana}
            onChange={(e) => setNameKana(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">自治体コード</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={!isNew}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">都道府県</label>
          <input
            value={prefecture}
            onChange={(e) => setPrefecture(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1">公式HP URL</label>
        <input
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">スクレイピングベースURL</label>
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder={websiteUrl || "公式HP URLと同じ"}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30 placeholder-white/20"
          />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">クロール間隔（ms）</label>
          <input
            type="number"
            value={crawlDelay}
            onChange={(e) => setCrawlDelay(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-white/60">ステータス:</label>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-xs cursor-pointer ${
            isActive ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"
          }`}
        >
          {isActive ? "有効" : "無効"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving || !name || !code || !prefecture || !websiteUrl}
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Save className="w-4 h-4" />
        {saving ? "保存中..." : "保存"}
      </button>
    </div>
  );
}
