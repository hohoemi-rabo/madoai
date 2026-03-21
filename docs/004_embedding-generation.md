## ステータス: 完了

# 004: Embeddingの生成と保存

## 概要

投入済みナレッジデータに対してgemini-embedding-001でベクトルを生成し、DBに保存する。

## 対象（REQUIREMENTS.md §6.2, §17 Phase A-4）

## 実行結果

- 全26件のEmbedding生成・保存成功
- 768次元ベクトル（gemini-embedding-001、taskType: RETRIEVAL_DOCUMENT）
- match_pages RPCによるベクトル検索の動作確認済み

## タスク

- [x] Google Gemini API キーの取得・環境変数設定（`.env.local`）
- [x] gemini-embedding-001 を使用した一括ベクトル化スクリプト作成（`scripts/scraper/embedder.py`）
- [x] taskType: `RETRIEVAL_DOCUMENT` で全ナレッジのEmbedding生成
- [x] output_dimensionality: 768 で次元数を指定
- [x] page_knowledge.embedding カラムへの保存
- [x] ベクトル検索RPC（match_pages）の動作テスト
- [x] 類似度スコアの確認・閾値調整

## 使い方

```bash
# dry-run
python -m scripts.scraper.embedder --dry-run

# 実行（.env.local に GEMINI_API_KEY が必要）
python -m scripts.scraper.embedder
```
