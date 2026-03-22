import { supabaseAdmin } from "@/lib/supabase";
import { KnowledgeEditForm } from "@/components/admin/KnowledgeEditForm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function KnowledgeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: page, error } = await supabaseAdmin
    .from("page_knowledge")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !page) {
    notFound();
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/admin/knowledge"
          className="text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-semibold text-white">{page.title}</h1>
      </div>

      <KnowledgeEditForm page={page} />
    </div>
  );
}
