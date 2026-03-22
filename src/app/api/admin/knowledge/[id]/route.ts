import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/embedding";
import crypto from "crypto";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabaseAdmin
    .from("page_knowledge")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 404 });
  }

  return Response.json({ page: data });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { title, category, content, metadata, is_active } = body;

  const updates: Record<string, unknown> = {};
  if (title !== undefined) updates.title = title;
  if (category !== undefined) updates.category = category;
  if (is_active !== undefined) updates.is_active = is_active;
  if (metadata !== undefined) updates.metadata = metadata;

  if (content !== undefined) {
    updates.content = content;
    updates.content_hash = crypto
      .createHash("sha256")
      .update(content)
      .digest("hex");

    // Embedding再生成
    try {
      const embedding = await generateEmbedding(content);
      updates.embedding = JSON.stringify(embedding);
    } catch (err) {
      console.error("Embedding regeneration failed:", err);
    }
  }

  const { data, error } = await supabaseAdmin
    .from("page_knowledge")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ page: data });
}
