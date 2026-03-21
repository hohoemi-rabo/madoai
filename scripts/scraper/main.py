"""スクレイピングスクリプト エントリーポイント"""

import argparse
import csv
import json
import os
import sys
from datetime import datetime, timezone, timedelta

from .config import (
    CSV_PATH,
    MAX_PAGES_PER_RUN,
    OUTPUT_DIR,
    REQUEST_INTERVAL_SEC,
    get_category,
    is_target_slug,
)
from .fetcher import check_robots_txt, create_session, fetch_page
from .parser import parse_page

JST = timezone(timedelta(hours=9))


def load_target_urls(csv_path: str) -> list[dict]:
    """CSVからMVP対象URLを読み込む"""
    targets = []
    with open(csv_path, encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            slug = row["スラッグ"].strip()
            if is_target_slug(slug):
                targets.append({
                    "slug": slug,
                    "title": row["タイトル"].strip(),
                    "url": row["URL"].strip(),
                })
    return targets


def main():
    parser = argparse.ArgumentParser(description="飯田市HPスクレイピングスクリプト")
    parser.add_argument("--csv", default=CSV_PATH, help="CSVファイルパス")
    parser.add_argument("--output-dir", default=OUTPUT_DIR, help="出力ディレクトリ")
    parser.add_argument("--dry-run", action="store_true", help="フェッチせずに対象URL一覧を表示")
    parser.add_argument("--interval", type=float, default=REQUEST_INTERVAL_SEC, help="リクエスト間隔（秒）")
    parser.add_argument("--max-pages", type=int, default=MAX_PAGES_PER_RUN, help="最大ページ数")
    args = parser.parse_args()

    # CSV読み込み・フィルタリング
    targets = load_target_urls(args.csv)
    print(f"対象ページ数: {len(targets)}")

    if not targets:
        print("対象ページが見つかりません。")
        sys.exit(1)

    # ページ数制限
    if len(targets) > args.max_pages:
        print(f"上限({args.max_pages})を超えるため、先頭{args.max_pages}件のみ処理します。")
        targets = targets[:args.max_pages]

    # dry-run モード
    if args.dry_run:
        print("\n--- 対象URL一覧（dry-run）---")
        for i, t in enumerate(targets, 1):
            category = get_category(t["slug"])
            print(f"  [{i:3d}] [{category}] {t['slug']}")
            print(f"        {t['url']}")
        print(f"\n合計: {len(targets)} ページ")
        sys.exit(0)

    # robots.txt チェック
    blocked = [t for t in targets if not check_robots_txt(t["url"])]
    if blocked:
        print(f"\nrobots.txtで{len(blocked)}件ブロックされました:")
        for t in blocked:
            print(f"  - {t['url']}")
        targets = [t for t in targets if check_robots_txt(t["url"])]

    # スクレイピング実行
    session = create_session()
    results = []
    success = 0
    failed = 0
    skipped = 0

    print(f"\nスクレイピング開始（間隔: {args.interval}秒）")
    print("=" * 60)

    for i, target in enumerate(targets, 1):
        slug = target["slug"]
        url = target["url"]
        category = get_category(slug)

        print(f"[{i}/{len(targets)}] {slug} ...", end=" ", flush=True)

        # HTML取得
        html = fetch_page(url, session)
        if html is None:
            print("FAILED")
            failed += 1
            continue

        # HTML解析
        parsed = parse_page(html, slug, target["title"])
        if parsed is None:
            print("SKIP (解析失敗)")
            skipped += 1
            continue

        # 結果構築
        result = {
            "source_url": url,
            "slug": slug,
            "title": parsed["title"],
            "category": category,
            "metadata": parsed["metadata"],
            "content": parsed["content"],
            "content_hash": parsed["content_hash"],
            "has_pdf_links": parsed["has_pdf_links"],
            "pdf_urls": parsed["pdf_urls"],
            "scraped_at": datetime.now(JST).isoformat(),
        }
        results.append(result)
        success += 1

        content_len = len(parsed["content"])
        pdf_count = len(parsed["pdf_urls"])
        print(f"OK ({content_len}文字, PDF:{pdf_count}件)")

    # JSON出力
    print("=" * 60)
    print(f"\n結果: 成功={success}, 失敗={failed}, スキップ={skipped}")

    if results:
        os.makedirs(args.output_dir, exist_ok=True)
        timestamp = datetime.now(JST).strftime("%Y%m%d_%H%M%S")
        output_path = os.path.join(args.output_dir, f"scraped_{timestamp}.json")

        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"出力: {output_path} ({len(results)}件)")
    else:
        print("出力データがありません。")


if __name__ == "__main__":
    main()
