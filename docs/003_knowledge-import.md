## ステータス: 完了

# 003: ナレッジデータの投入

## 概要

スクレイピング結果のJSONをDBにインポートし、メタデータのレビュー・修正を行う。

## 対象（REQUIREMENTS.md §15.1, §17 Phase A-3）

## 投入結果

- 投入件数: 26件（ごみ・リサイクル: 14, 子育て: 12）
- 全件成功
- Supabase REST API（service_role_key）経由でupsert

## タスク

- [x] JSONインポートスクリプト or 管理画面インポート機能の作成
- [x] スクレイピング結果JSONのDB投入（page_knowledgeテーブル）
- [x] カテゴリの付与（ごみ・リサイクル / 子育て）
- [x] is_active フラグの設定
- [x] 投入データの確認・動作検証
- [x] メタデータのレビュー・修正（summary, keywords をGemini AIで一括生成）
