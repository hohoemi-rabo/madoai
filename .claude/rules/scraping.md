---
description: Pythonスクレイピング・データ投入スクリプトのルール
globs: scripts/**/*.py
---

# スクレイピングルール

## ディレクトリ構成

```
scripts/
  scraper/
    config.py     # 対象URL定義、カテゴリマッピング、レート制限設定
    fetcher.py    # HTTP取得（レート制限、User-Agent、robots.txt確認）
    parser.py     # HTML解析（飯田市HP固有の構造に対応）
    importer.py   # JSONをSupabase REST APIでインポート
    main.py       # エントリーポイント（CSV→フィルタ→スクレイピング→JSON出力）
  requirements.txt
  output/         # JSON出力先（.gitignore対象）
```

## 実行方法

```bash
pip install -r scripts/requirements.txt
python -m scripts.scraper.main --dry-run    # 対象URL確認
python -m scripts.scraper.main              # スクレイピング実行
```

## 飯田市HP HTML構造

- `id="main_body"` — コンテンツ領域
- `id="main_header"` — ページタイトル（テキストノード）
- `id="section_footer"` — 問い合わせセクション（部署名・電話番号）
- `<main>` タグは存在しない
- ページタイトルは `<title>` タグから「- 飯田市ホームページ」を除去して取得

## URL管理

- `iida_slugs.csv`（プロジェクトルート）が全URLリスト（492件）
- `config.py` の `TARGET_PREFIXES` で対象をフィルタ
- 新カテゴリ追加時は TARGET_PREFIXES と CATEGORY_MAP に追加するだけ

## 配慮事項

- アクセス間隔: 最低2秒
- 平日9〜17時のアクセスを避ける
- 1回100ページ以下
- User-Agentに連絡先を含める
