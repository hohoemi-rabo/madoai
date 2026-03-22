import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const municipalityId = searchParams.get("municipality_id");

  let query = supabaseAdmin
    .from("page_knowledge")
    .select("id, title, category, is_active, scraped_at, content_hash, source_url, slug")
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (municipalityId) {
    query = query.eq("municipality_id", municipalityId);
  }

  const { data, error } = await query;

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ pages: data });
}
