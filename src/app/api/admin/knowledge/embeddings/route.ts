import { supabaseAdmin } from "@/lib/supabase";
import { generateEmbedding } from "@/lib/embedding";

export async function POST() {
  const { data: pages, error } = await supabaseAdmin
    .from("page_knowledge")
    .select("id, slug, content")
    .is("embedding", null)
    .eq("is_active", true);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!pages || pages.length === 0) {
    return Response.json({ message: "全てのレコードにEmbeddingが設定済みです", success: 0, failed: 0 });
  }

  let success = 0;
  let failed = 0;

  for (const page of pages) {
    try {
      const embedding = await generateEmbedding(page.content);

      const { error: updateError } = await supabaseAdmin
        .from("page_knowledge")
        .update({ embedding: JSON.stringify(embedding) })
        .eq("id", page.id);

      if (updateError) throw updateError;
      success++;
    } catch (err) {
      console.error(`Embedding failed for ${page.slug}:`, err);
      failed++;
    }

    // レート制限
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return Response.json({ success, failed, total: pages.length });
}
