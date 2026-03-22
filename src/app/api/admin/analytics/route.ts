import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  // 今日の開始時刻（JST）
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffset);
  const todayStart = new Date(
    Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate()) - jstOffset
  ).toISOString();

  // 今月の開始時刻（JST）
  const monthStart = new Date(
    Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), 1) - jstOffset
  ).toISOString();

  // 今日の質問数
  const { count: todayCount } = await supabaseAdmin
    .from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", todayStart);

  // 今月の質問数
  const { count: monthCount } = await supabaseAdmin
    .from("ai_usage_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart);

  // よく聞かれる質問TOP10
  const { data: logs } = await supabaseAdmin
    .from("ai_usage_logs")
    .select("query")
    .gte("created_at", monthStart);

  const queryCounts: Record<string, number> = {};
  logs?.forEach((log) => {
    queryCounts[log.query] = (queryCounts[log.query] || 0) + 1;
  });
  const topQueries = Object.entries(queryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([query, count]) => ({ query, count }));

  // 制限値
  const { data: limits } = await supabaseAdmin
    .from("ai_usage_limits")
    .select("*");

  const dailyLimit = limits?.find((l) => l.limit_type === "daily_user");
  const monthlyLimit = limits?.find((l) => l.limit_type === "monthly_site");

  return Response.json({
    today: { total_queries: todayCount || 0 },
    this_month: { total_queries: monthCount || 0 },
    top_queries: topQueries,
    limits: {
      daily_user: dailyLimit?.limit_value ?? 30,
      monthly_site: monthlyLimit?.limit_value ?? 10000,
      monthly_current: monthlyLimit?.current_value ?? 0,
    },
  });
}
