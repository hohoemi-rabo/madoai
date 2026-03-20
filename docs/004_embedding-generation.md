# 004: Embeddingの生成と保存

## 概要

投入済みナレッジデータに対してgemini-embedding-001でベクトルを生成し、DBに保存する。

## 対象（REQUIREMENTS.md §6.2, §17 Phase A-4）

## タスク

- [ ] Google Gemini API キーの取得・環境変数設定
- [ ] gemini-embedding-001 を使用した一括ベクトル化スクリプト作成
- [ ] taskType: `RETRIEVAL_DOCUMENT` で全ナレッジのEmbedding生成
- [ ] output_dimensionality: 768 で次元数を指定
- [ ] page_knowledge.embedding カラムへの保存
- [ ] ベクトル検索RPC（match_pages）の動作テスト
- [ ] 類似度スコアの確認・閾値調整
