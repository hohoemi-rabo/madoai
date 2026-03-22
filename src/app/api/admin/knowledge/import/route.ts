import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json();
  const { records, municipality_id } = body;

  if (!records || !Array.isArray(records) || !municipality_id) {
    return Response.json(
      { error: "records (array) と municipality_id は必須です" },
      { status: 400 }
    );
  }

  let success = 0;
  let failed = 0;

  for (const record of records) {
    const { error } = await supabaseAdmin.from("page_knowledge").upsert(
      {
        municipality_id,
        source_url: record.source_url,
        slug: record.slug,
        title: record.title,
        category: record.category,
        metadata: record.metadata,
        content: record.content,
        content_hash: record.content_hash,
        has_pdf_links: record.has_pdf_links,
        pdf_urls: record.pdf_urls,
        is_active: true,
        scraped_at: record.scraped_at,
      },
      { onConflict: "municipality_id,source_url" }
    );

    if (error) {
      console.error(`Import failed for ${record.slug}:`, error.message);
      failed++;
    } else {
      success++;
    }
  }

  return Response.json({ success, failed, total: records.length });
}
