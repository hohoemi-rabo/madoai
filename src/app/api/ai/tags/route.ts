import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipalityId = searchParams.get("municipality_id");

  let query = supabaseAdmin
    .from("ai_prompt_tags")
    .select("id, label, prompt, tag_type")
    .eq("is_active", true)
    .order("order_num", { ascending: true });

  if (municipalityId) {
    query = query.eq("municipality_id", municipalityId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ tags: data });
}
