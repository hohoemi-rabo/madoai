## ステータス: 完了

# 002: スクレイピングスクリプトの作成（Python）

## 概要

飯田市HPの対象ページをスクレイピングし、構造化マークダウン＋メタデータのJSONを出力するPythonスクリプトを作成する。

## 対象（REQUIREMENTS.md §8, §17 Phase A-2）

## 実行結果

- 対象ページ数: 26ページ（ごみ・リサイクル: 13, 子育て: 13）
- 全ページ成功、失敗0件
- 出力: `scripts/output/scraped_YYYYMMDD_HHMMSS.json`

## タスク

- [x] Python環境セットアップ（requirements.txt作成）
- [x] CSVからMVP対象URL（ごみ・子育て）の抽出スクリプト
- [x] robots.txt確認・クロール可否検証処理
- [x] HTML取得処理（アクセス間隔2秒以上、User-Agent設定）
- [x] HTMLからテキスト抽出（§8.6の抽出/除外ルールに基づく）
- [x] テキスト→構造化マークダウン変換
- [x] メタデータ抽出（タイトル、更新日、担当部署、電話番号）
- [x] PDFリンクのURL抽出・記録
- [x] content_hash生成（更新検知用）
- [x] 構造化データのJSON出力
- [x] スクレイピング対象: `site/gomi/`配下（7ページ）
- [x] スクレイピング対象: `site/kosodate/`配下（6ページ）
- [x] スクレイピング対象: `soshiki/12/`, `soshiki/173/`, `soshiki/15/`, `soshiki/19/`関連ページ

## 使い方

```bash
# 依存インストール
pip install -r scripts/requirements.txt

# dry-run（対象URL確認のみ）
python -m scripts.scraper.main --dry-run

# 実行
python -m scripts.scraper.main

# オプション
python -m scripts.scraper.main --max-pages 5 --interval 3
```

## 配慮事項

- 平日9〜17時のアクセスを避ける
- 1回100ページ以下に制限
- アクセス間隔は最低2秒
