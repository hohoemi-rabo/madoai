"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

export function ImportButton() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      const records = JSON.parse(text);

      const res = await fetch("/api/admin/knowledge/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          records,
          municipality_id: "956e05cd-efae-4a7e-9278-8d4a7ec4e1e1",
        }),
      });

      const data = await res.json();
      setResult(`成功: ${data.success}件, 失敗: ${data.failed}件`);
    } catch {
      setResult("インポートに失敗しました");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-3">
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="w-4 h-4" />
        {loading ? "インポート中..." : "JSONインポート"}
      </button>
      {result && <span className="text-sm text-[var(--text-muted)]">{result}</span>}
    </div>
  );
}
