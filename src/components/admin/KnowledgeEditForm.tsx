"use client";

import { Save, ExternalLink, FileText } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type PageData = {
  id: string;
  title: string;
  category: string;
  content: string;
  source_url: string;
  is_active: boolean;
  scraped_at: string | null;
  content_hash: string | null;
  has_pdf_links: boolean;
  pdf_urls: string[] | null;
  metadata: {
    department?: string;
    phone?: string;
    summary?: string;
    keywords?: string[];
    last_updated?: string;
  };
};

export function KnowledgeEditForm({ page }: { page: PageData }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState(page.title);
  const [category, setCategory] = useState(page.category || "");
  const [content, setContent] = useState(page.content);
  const [isActive, setIsActive] = useState(page.is_active);
  const [department, setDepartment] = useState(page.metadata?.department || "");
  const [phone, setPhone] = useState(page.metadata?.phone || "");
  const [summary, setSummary] = useState(page.metadata?.summary || "");
  const [keywords, setKeywords] = useState(
    page.metadata?.keywords?.join(", ") || ""
  );

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/knowledge/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          content,
          is_active: isActive,
          metadata: {
            ...page.metadata,
            department,
            phone,
            summary,
            keywords: keywords
              .split(",")
              .map((k) => k.trim())
              .filter(Boolean),
          },
        }),
      });

      if (res.ok) {
        setMessage("保存しました（Embedding再生成済み）");
        router.refresh();
      } else {
        const data = await res.json();
        setMessage(`エラー: ${data.error}`);
      }
    } catch {
      setMessage("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 左カラム */}
      <div className="lg:col-span-2 space-y-4">
        <div>
          <label className="block text-sm text-white/60 mb-1">タイトル</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">カテゴリ</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">担当部署</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">電話番号</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">キーワード（カンマ区切り）</label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1">要約</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1">コンテンツ（マークダウン）</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="w-full px-3 py-2 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm font-mono outline-none focus:border-white/30 resize-y"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {saving ? "保存中..." : "保存"}
          </button>
          {message && (
            <span className="text-sm text-[var(--text-muted)]">{message}</span>
          )}
        </div>
      </div>

      {/* 右カラム */}
      <div className="space-y-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 space-y-3">
          <h3 className="text-sm font-medium text-white">情報</h3>

          <div className="flex items-center justify-between">
            <span className="text-xs text-white/60">ステータス</span>
            <button
              onClick={() => setIsActive(!isActive)}
              className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-xs cursor-pointer ${
                isActive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-white/10 text-white/40"
              }`}
            >
              {isActive ? "有効" : "無効"}
            </button>
          </div>

          <div>
            <span className="text-xs text-white/60 block">スクレイピング日</span>
            <span className="text-xs text-white/80">
              {page.scraped_at
                ? new Date(page.scraped_at).toLocaleString("ja-JP")
                : "—"}
            </span>
          </div>

          <div>
            <span className="text-xs text-white/60 block">更新日（元ページ）</span>
            <span className="text-xs text-white/80">
              {page.metadata?.last_updated || "—"}
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
          <h3 className="text-sm font-medium text-white mb-2">元ページ</h3>
          <a
            href={page.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="truncate">{page.source_url}</span>
          </a>
        </div>

        {page.has_pdf_links && page.pdf_urls && page.pdf_urls.length > 0 && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4">
            <h3 className="text-sm font-medium text-white mb-2">
              PDFリンク ({page.pdf_urls.length}件)
            </h3>
            <div className="space-y-1.5">
              {page.pdf_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{url.split("/").pop()}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
