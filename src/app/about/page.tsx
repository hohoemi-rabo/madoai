import { Header } from "@/components/chat/Header";
import { Shield, Info, FileText } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサービスについて — MADOAI",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className="max-w-2xl mx-auto px-4 pt-16 pb-12 space-y-10">
        {/* サービス概要 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-semibold text-white">このサービスについて</h1>
          </div>
          <div className="space-y-3 text-[15px] text-white/80 leading-7">
            <p>
              MADOAIは、飯田市の行政情報を自然言語で検索できるAIアシスタントです。
              飯田市ホームページに掲載されている情報をもとに、ごみの出し方や子育て支援制度などについてお答えします。
            </p>
            <p>
              AIは行政情報の代替ではなく、公式ページへの最短ルートを提供するナビゲーターです。
              すべての回答には元の公式ページへのリンクを含めています。
            </p>
          </div>
        </section>

        {/* 免責事項 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">免責事項</h2>
          </div>
          <ul className="space-y-3 text-[15px] text-white/80 leading-7">
            <li className="flex gap-3">
              <span className="text-amber-400 flex-shrink-0">1.</span>
              本サービスは飯田市の公式サービスではありません。
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 flex-shrink-0">2.</span>
              AIの回答は参考情報です。情報の正確性は保証しません。
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 flex-shrink-0">3.</span>
              手続きや制度の詳細は、必ず公式サイトまたは担当窓口でご確認ください。
            </li>
            <li className="flex gap-3">
              <span className="text-amber-400 flex-shrink-0">4.</span>
              回答に含まれるリンクは飯田市公式ホームページのものです。
            </li>
          </ul>
        </section>

        {/* 利用規約 */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-green-400" />
            <h2 className="text-xl font-semibold text-white">利用規約</h2>
          </div>
          <div className="space-y-3 text-[15px] text-white/80 leading-7">
            <p>
              本サービスを利用することにより、以下の条件に同意したものとみなします。
            </p>
            <ul className="space-y-2 pl-4">
              <li>本サービスの回答は参考情報であり、行政手続きの根拠とはなりません。</li>
              <li>利用者は自己の責任において本サービスの情報を利用するものとします。</li>
              <li>本サービスの利用により生じた損害について、運営者は一切の責任を負いません。</li>
              <li>サービスの内容は予告なく変更・停止する場合があります。</li>
              <li>1日あたりの利用回数に制限があります。</li>
            </ul>
          </div>
        </section>

        <div className="border-t border-[var(--border)] pt-6">
          <p className="text-sm text-[var(--text-muted)]">
            お問い合わせ先: 飯田市役所 0265-22-4511
          </p>
        </div>
      </div>
    </>
  );
}
