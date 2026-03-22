import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("ai_prompt_tags")
    .select("*")
    .order("order_num", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ tags: data });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { municipality_id, label, prompt, tag_type, order_num } = body;

  if (!municipality_id || !label || !prompt || !tag_type) {
    return Response.json(
      { error: "municipality_id, label, prompt, tag_type は必須です" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("ai_prompt_tags")
    .insert({
      municipality_id,
      label,
      prompt,
      tag_type,
      order_num: order_num ?? 0,
    })
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ tag: data }, { status: 201 });
}
