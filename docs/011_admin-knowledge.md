# 011: 管理画面 — ナレッジデータ管理

## 概要

ナレッジデータの一覧・編集・インポート・Embedding再生成を行う管理画面を実装する。

## 対象（REQUIREMENTS.md §14.3, §17 Phase B-5）

## タスク

### 一覧画面
- [ ] `/admin/knowledge` ページ作成
- [ ] 自治体でのフィルタリング
- [ ] ページタイトル、カテゴリ、ステータス、最終スクレイピング日時の表示
- [ ] 「要更新」バッジ（content_hash変更検知）
- [ ] 一括インポートボタン（JSONファイル取り込み）
- [ ] Embedding一括生成ボタン

### 編集画面
- [ ] `/admin/knowledge/[id]` ページ作成
- [ ] 左カラム: メタデータフォーム（title, category, summary, keywords, department, phone）
- [ ] 左カラム: マークダウンエディタ（content）
- [ ] 右カラム: 元ページのプレビュー（リンク）
- [ ] PDFリンク一覧表示
- [ ] 保存時のEmbedding自動再生成

### 認証
- [ ] 管理画面のSupabase認証（簡易、Supabase Auth）
