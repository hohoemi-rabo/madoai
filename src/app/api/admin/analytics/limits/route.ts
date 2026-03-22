import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(request: Request) {
  const body = await request.json();
  const { daily_user, monthly_site } = body;

  const results = [];

  if (daily_user !== undefined) {
    const { error } = await supabaseAdmin
      .from("ai_usage_limits")
      .update({ limit_value: daily_user })
      .eq("limit_type", "daily_user");
    if (error) results.push({ type: "daily_user", error: error.message });
  }

  if (monthly_site !== undefined) {
    const { error } = await supabaseAdmin
      .from("ai_usage_limits")
      .update({ limit_value: monthly_site })
      .eq("limit_type", "monthly_site");
    if (error) results.push({ type: "monthly_site", error: error.message });
  }

  const errors = results.filter((r) => r.error);
  if (errors.length > 0) {
    return Response.json({ error: errors }, { status: 500 });
  }

  return Response.json({ success: true });
}
