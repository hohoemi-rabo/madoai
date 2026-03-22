## ステータス: 完了

# 011: 管理画面 — ナレッジデータ管理

## 概要

ナレッジデータの一覧・編集・インポート・Embedding再生成を行う管理画面を実装する。

## 対象（REQUIREMENTS.md §14.3, §17 Phase B-5）

## タスク

### 一覧画面
- [x] `/admin/knowledge` ページ作成
- [x] ページタイトル、カテゴリ、ステータス、最終スクレイピング日時の表示
- [x] 一括インポートボタン（JSONファイル取り込み）
- [x] Embedding一括生成ボタン
- [ ] 自治体でのフィルタリング（API対応済み、UIは将来）
- [ ] 「要更新」バッジ（content_hash変更検知、将来対応）

### 編集画面
- [x] `/admin/knowledge/[id]` ページ作成
- [x] 左カラム: メタデータフォーム（title, category, summary, keywords, department, phone）
- [x] 左カラム: マークダウンエディタ（content、textarea）
- [x] 右カラム: 元ページのプレビュー（リンク）
- [x] PDFリンク一覧表示
- [x] 保存時のEmbedding自動再生成

### 認証
- [ ] 管理画面のSupabase認証（後日実装）

### 共通化
- [x] Embedding生成ロジックを `src/lib/embedding.ts` に切り出し
