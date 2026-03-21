"""スクレイピング結果JSONをSupabaseにインポートするスクリプト"""

import argparse
import json
import os
import sys

import requests as http_requests

from .config import OUTPUT_DIR


def import_to_supabase(json_path: str, supabase_url: str, service_role_key: str, municipality_id: str):
    """JSONファイルをSupabaseのpage_knowledgeテーブルにインポートする"""

    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    print(f"インポート対象: {len(data)}件")

    headers = {
        "apikey": service_role_key,
        "Authorization": f"Bearer {service_role_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
    }

    success = 0
    failed = 0

    for i, item in enumerate(data, 1):
        record = {
            "municipality_id": municipality_id,
            "source_url": item["source_url"],
            "slug": item["slug"],
            "title": item["title"],
            "category": item["category"],
            "metadata": item["metadata"],
            "content": item["content"],
            "content_hash": item["content_hash"],
            "has_pdf_links": item["has_pdf_links"],
            "pdf_urls": item["pdf_urls"],
            "is_active": True,
            "scraped_at": item["scraped_at"],
        }

        resp = http_requests.post(
            f"{supabase_url}/rest/v1/page_knowledge",
            headers=headers,
            json=record,
            timeout=30,
        )

        if resp.status_code in (200, 201):
            print(f"  [{i}/{len(data)}] {item['slug']} ... OK")
            success += 1
        else:
            print(f"  [{i}/{len(data)}] {item['slug']} ... FAILED ({resp.status_code}: {resp.text[:200]})")
            failed += 1

    print(f"\n結果: 成功={success}, 失敗={failed}")
    return failed == 0


def main():
    parser = argparse.ArgumentParser(description="スクレイピング結果をSupabaseにインポート")
    parser.add_argument("--json", required=True, help="インポートするJSONファイルパス")
    parser.add_argument("--municipality-id", required=True, help="自治体UUID")
    args = parser.parse_args()

    supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    service_role_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        print("エラー: NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を環境変数に設定してください")
        sys.exit(1)

    ok = import_to_supabase(args.json, supabase_url, service_role_key, args.municipality_id)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
