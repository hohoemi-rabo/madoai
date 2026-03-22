import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { name, name_kana, prefecture, website_url, scraping_config, is_active } = body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (name_kana !== undefined) updates.name_kana = name_kana;
  if (prefecture !== undefined) updates.prefecture = prefecture;
  if (website_url !== undefined) updates.website_url = website_url;
  if (scraping_config !== undefined) updates.scraping_config = scraping_config;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabaseAdmin
    .from("municipalities")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ municipality: data });
}
