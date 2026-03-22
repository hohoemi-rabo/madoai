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
- チャットAPIは Node.js Runtime + SSE（Edge Runtimeはライブラリ互換性の問題で不使用）
- AIモデル: gemini-3.1-flash-lite-preview（チャット）
- Embedding: gemini-embedding-001（768次元、taskType指定必須）
- Embedding共通関数: `src/lib/embedding.ts`（RETRIEVAL_DOCUMENT / QUESTION_ANSWERING）
- SDKs: `@google/genai`（Gemini）、`@supabase/supabase-js`（Supabase）

## 実装済みAPIエンドポイント

### 公開API（`/api/ai/`）
- `POST /api/ai/chat` — SSEストリーミングチャット
- `GET /api/ai/tags` — プロンプトタグ一覧
- `GET /api/ai/municipalities` — 自治体一覧

### 管理API（`/api/admin/`）
- `GET|POST /api/admin/knowledge` — ナレッジ一覧・作成
- `GET|PATCH /api/admin/knowledge/[id]` — ナレッジ詳細・更新（Embedding自動再生成）
- `POST /api/admin/knowledge/import` — JSONインポート
- `POST /api/admin/knowledge/embeddings` — Embedding一括生成
- `GET|POST /api/admin/municipalities` — 自治体一覧・作成
- `PATCH /api/admin/municipalities/[id]` — 自治体更新
- `GET|POST /api/admin/tags` — タグ一覧・作成
- `PATCH|DELETE /api/admin/tags/[id]` — タグ更新・削除
- `GET /api/admin/analytics` — 利用状況
- `PATCH /api/admin/analytics/limits` — 制限値変更

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
