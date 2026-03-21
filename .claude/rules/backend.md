---
description: Supabase / API / データベース関連のバックエンドルール
paths:
  - src/app/api/**/*.ts
  - src/lib/**/*.ts
---

# バックエンドルール

## Supabase

- **Project ID**: `szuakyhpdczkftkdepiq`
- **飯田市 municipality_id**: `956e05cd-efae-4a7e-9278-8d4a7ec4e1e1`
- Supabaseの既存プロジェクト「game-scope」は別用途 — 絶対に使用しない
- madoai専用のSupabaseプロジェクトを使用する
- マルチテナント設計: 全主要テーブルに `municipality_id` カラム

## API設計

- Route Handlerは `src/app/api/` 配下に配置
- ストリーミングAPIは Edge Runtime + SSE（Server-Sent Events）
- AIモデル: Google Gemini 3.1 Flash-Lite Preview
- Embedding: gemini-embedding-001（768次元、taskType指定必須）

## データベーステーブル

- `municipalities` — 自治体マスタ
- `page_knowledge` — ページナレッジ（vector(768)、HNSWインデックス）
- `ai_prompt_tags` — プロンプトタグ
- `ai_usage_logs` — 利用ログ
- `ai_usage_limits` — 利用制限

## RPC関数

- `match_pages(query_embedding, match_threshold, match_count, p_municipality_id)` — コサイン類似度ベクトル検索
- `check_usage_limit(p_session_id)` — 日次/月次利用制限チェック（JST基準）
- `log_ai_usage(...)` — 使用ログ記録 + 月次カウンターインクリメント

## 環境変数

| 変数 | 説明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase管理者キー（サーバー側のみ） |
| `GEMINI_API_KEY` | Google Gemini APIキー |
