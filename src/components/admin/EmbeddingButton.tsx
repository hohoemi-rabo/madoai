"use client";

import { Cpu } from "lucide-react";
import { useState } from "react";

export function EmbeddingButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/admin/knowledge/embeddings", {
        method: "POST",
      });
      const data = await res.json();

      if (data.message) {
        setResult(data.message);
      } else {
        setResult(`成功: ${data.success}件, 失敗: ${data.failed}件`);
      }
    } catch {
      setResult("Embedding生成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Cpu className="w-4 h-4" />
        {loading ? "生成中..." : "Embedding一括生成"}
      </button>
      {result && <span className="text-sm text-[var(--text-muted)]">{result}</span>}
    </div>
  );
}
