import { supabaseAdmin } from "@/lib/supabase";
import { ImportButton } from "@/components/admin/ImportButton";
import { EmbeddingButton } from "@/components/admin/EmbeddingButton";
import Link from "next/link";

export default async function KnowledgeListPage() {
  const { data: pages } = await supabaseAdmin
    .from("page_knowledge")
    .select("id, title, category, is_active, scraped_at, source_url")
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">ナレッジデータ</h1>
        <div className="flex items-center gap-3">
          <ImportButton />
          <EmbeddingButton />
        </div>
      </div>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-4 py-3 text-white/60 font-medium">タイトル</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-32">カテゴリ</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-24">ステータス</th>
              <th className="text-left px-4 py-3 text-white/60 font-medium w-36">スクレイピング日</th>
            </tr>
          </thead>
          <tbody>
            {pages?.map((page) => (
              <tr
                key={page.id}
                className="border-b border-[var(--border)] last:border-b-0 hover:bg-white/5 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/knowledge/${page.id}`}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    {page.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)]">
                  {page.category}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-[var(--radius-sm)] text-xs ${
                      page.is_active
                        ? "bg-green-500/20 text-green-400"
                        : "bg-white/10 text-white/40"
                    }`}
                  >
                    {page.is_active ? "有効" : "無効"}
                  </span>
                </td>
                <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                  {page.scraped_at
                    ? new Date(page.scraped_at).toLocaleDateString("ja-JP")
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[var(--text-muted)]">
        {pages?.length ?? 0}件のナレッジデータ
      </p>
    </div>
  );
}
