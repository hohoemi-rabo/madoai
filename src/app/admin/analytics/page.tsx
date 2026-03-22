"use client";

import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Calendar, Settings, Search } from "lucide-react";

type AnalyticsData = {
  today: { total_queries: number };
  this_month: { total_queries: number };
  top_queries: { query: string; count: number }[];
  limits: {
    daily_user: number;
    monthly_site: number;
    monthly_current: number;
  };
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [monthlyLimit, setMonthlyLimit] = useState(10000);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/admin/analytics");
    const json = await res.json();
    setData(json);
    setDailyLimit(json.limits.daily_user);
    setMonthlyLimit(json.limits.monthly_site);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveLimits = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/analytics/limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ daily_user: dailyLimit, monthly_site: monthlyLimit }),
      });
      if (res.ok) {
        setMessage("制限値を更新しました");
        fetchData();
      }
    } catch {
      setMessage("更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  if (!data) {
    return <div className="text-[var(--text-muted)]">読み込み中...</div>;
  }

  const monthlyUsagePercent = data.limits.monthly_site > 0
    ? Math.round((data.limits.monthly_current / data.limits.monthly_site) * 100)
    : 0;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-xl font-semibold text-white">AI Analytics</h1>

      {/* 数値カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-white/60">今日の質問数</span>
          </div>
          <p className="text-3xl font-semibold text-white">{data.today.total_queries}</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <span className="text-sm text-white/60">今月の質問数</span>
          </div>
          <p className="text-3xl font-semibold text-white">{data.this_month.total_queries}</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <span className="text-sm text-white/60">月次制限消費率</span>
          </div>
          <p className="text-3xl font-semibold text-white">{monthlyUsagePercent}%</p>
          <div className="mt-2 w-full bg-white/10 rounded-full h-2">
            <div
              className="bg-amber-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(monthlyUsagePercent, 100)}%` }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {data.limits.monthly_current} / {data.limits.monthly_site}
          </p>
        </div>
      </div>

      {/* よく聞かれる質問TOP10 */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2">
          <Search className="w-4 h-4 text-white/60" />
          <h2 className="text-sm font-medium text-white">よく聞かれる質問 TOP10</h2>
        </div>
        {data.top_queries.length > 0 ? (
          <table className="w-full text-sm">
            <tbody>
              {data.top_queries.map((q, i) => (
                <tr
                  key={i}
                  className="border-b border-[var(--border)] last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-[var(--text-muted)] w-10">{i + 1}</td>
                  <td className="px-4 py-2.5 text-white/90">{q.query}</td>
                  <td className="px-4 py-2.5 text-[var(--text-muted)] text-right w-20">{q.count}回</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-6 text-sm text-[var(--text-muted)] text-center">
            まだデータがありません
          </p>
        )}
      </div>

      {/* 制限値設定 */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5">
        <h2 className="text-sm font-medium text-white mb-4">制限値設定</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-1">ユーザー日次制限（回/日）</label>
            <input
              type="number"
              value={dailyLimit}
              onChange={(e) => setDailyLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1">サイト月次上限（回/月）</label>
            <input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius-md)] text-white text-sm outline-none focus:border-white/30"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveLimits}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-[var(--radius-md)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "保存中..." : "制限値を更新"}
          </button>
          {message && <span className="text-sm text-[var(--text-muted)]">{message}</span>}
        </div>
      </div>
    </div>
  );
}
