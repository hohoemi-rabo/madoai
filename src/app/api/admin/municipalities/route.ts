import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  // 自治体一覧 + ナレッジ件数
  const { data: municipalities, error } = await supabaseAdmin
    .from("municipalities")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // ナレッジ件数を取得
  const { data: counts } = await supabaseAdmin
    .from("page_knowledge")
    .select("municipality_id")
    .eq("is_active", true);

  const countMap: Record<string, number> = {};
  counts?.forEach((row) => {
    countMap[row.municipality_id] = (countMap[row.municipality_id] || 0) + 1;
  });

  const result = municipalities?.map((m) => ({
    ...m,
    knowledge_count: countMap[m.id] || 0,
  }));

  return Response.json({ municipalities: result });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { code, name, name_kana, prefecture, website_url, scraping_config } = body;

  if (!code || !name || !prefecture || !website_url) {
    return Response.json(
      { error: "code, name, prefecture, website_url は必須です" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("municipalities")
    .insert({ code, name, name_kana, prefecture, website_url, scraping_config })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ municipality: data }, { status: 201 });
}
