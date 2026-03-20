---
description: Supabase / API / データベース関連のバックエンドルール
globs: src/app/api/**/*.ts, src/lib/**/*.ts, supabase/**/*
---

# バックエンドルール

## Supabase

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
- `page_knowledge` — ページナレッジ（vector(768)カラム含む）
- `ai_prompt_tags` — プロンプトタグ
- `ai_usage_logs` — 利用ログ
- `ai_usage_limits` — 利用制限

## RPC関数

- `match_pages` — コサイン類似度ベクトル検索
- `check_usage_limit` — 日次/月次利用制限チェック
- `log_ai_usage` — 使用ログ記録
