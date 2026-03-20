# 001: データベーステーブルの作成

## 概要

Supabaseにプロジェクト専用のデータベースを作成し、全テーブル・インデックス・RLS・RPC関数をセットアップする。

## 対象（REQUIREMENTS.md §7, §17 Phase A-1）

## タスク

- [ ] Supabaseに新規プロジェクトを作成（リージョン: ap-northeast-1）
- [ ] pgvector 拡張を有効化
- [ ] `municipalities` テーブル作成（自治体マスタ）
- [ ] `page_knowledge` テーブル作成（ページナレッジ、vector(768)カラム含む）
- [ ] `ai_prompt_tags` テーブル作成
- [ ] `ai_usage_logs` テーブル作成
- [ ] `ai_usage_limits` テーブル作成
- [ ] UNIQUE制約の設定（page_knowledge: municipality_id + source_url）
- [ ] インデックス作成（§7.7に基づく全インデックス）
- [ ] RLSポリシー設定（§7.8に基づく全ポリシー）
- [ ] RPC関数: `match_pages` 作成（ベクトル検索）
- [ ] RPC関数: `check_usage_limit` 作成
- [ ] RPC関数: `log_ai_usage` 作成
- [ ] 飯田市の初期データ投入（municipalitiesテーブル）

## 参考

- テーブル定義: REQUIREMENTS.md §7.2〜§7.6
- インデックス: §7.7
- RLS: §7.8
- RPC: §7.9
