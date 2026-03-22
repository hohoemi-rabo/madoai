import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { label, prompt, tag_type, order_num, is_active } = body;

  const updates: Record<string, unknown> = {};
  if (label !== undefined) updates.label = label;
  if (prompt !== undefined) updates.prompt = prompt;
  if (tag_type !== undefined) updates.tag_type = tag_type;
  if (order_num !== undefined) updates.order_num = order_num;
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabaseAdmin
    .from("ai_prompt_tags")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ tag: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from("ai_prompt_tags")
    .delete()
    .eq("id", id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}
