## ステータス: 完了

# 001: データベーステーブルの作成

## 概要

Supabaseにプロジェクト専用のデータベースを作成し、全テーブル・インデックス・RLS・RPC関数をセットアップする。

## 対象（REQUIREMENTS.md §7, §17 Phase A-1）

## Supabaseプロジェクト情報

- **プロジェクト名**: madoai
- **プロジェクトID**: szuakyhpdczkftkdepiq
- **リージョン**: ap-northeast-1
- **組織**: masa-portfolio (xgayodyuiwtftioftjvb)

## タスク

- [x] Supabaseに新規プロジェクトを作成（リージョン: ap-northeast-1）
- [x] pgvector 拡張を有効化
- [x] `municipalities` テーブル作成（自治体マスタ）
- [x] `page_knowledge` テーブル作成（ページナレッジ、vector(768)カラム含む）
- [x] `ai_prompt_tags` テーブル作成
- [x] `ai_usage_logs` テーブル作成
- [x] `ai_usage_limits` テーブル作成
- [x] UNIQUE制約の設定（page_knowledge: municipality_id + source_url）
- [x] インデックス作成（§7.7に基づく全インデックス、ベクトルはHNSW採用）
- [x] RLSポリシー設定（§7.8に基づく全ポリシー）
- [x] RPC関数: `match_pages` 作成（ベクトル検索）
- [x] RPC関数: `check_usage_limit` 作成
- [x] RPC関数: `log_ai_usage` 作成
- [x] 飯田市の初期データ投入（municipalitiesテーブル）

## 参考

- テーブル定義: REQUIREMENTS.md §7.2〜§7.6
- インデックス: §7.7
- RLS: §7.8
- RPC: §7.9
