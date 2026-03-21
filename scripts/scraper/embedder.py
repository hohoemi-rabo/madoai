"""Embedding生成スクリプト — gemini-embedding-001でベクトル化しSupabaseに保存"""

import argparse
import json
import os
import sys
import time

import requests as http_requests
from dotenv import load_dotenv
from google import genai

# .envファイルから環境変数を読み込む
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))

EMBEDDING_MODEL = "gemini-embedding-001"
EMBEDDING_DIMENSIONS = 768
TASK_TYPE = "RETRIEVAL_DOCUMENT"
SUPABASE_PROJECT_ID = "szuakyhpdczkftkdepiq"


def get_supabase_service_key() -> str:
    """Supabase Management APIからservice_role_keyを取得する"""
    mcp_path = os.path.join(os.path.dirname(__file__), "..", "..", ".mcp.json")
    with open(mcp_path) as f:
        mcp_config = json.load(f)

    pat = mcp_config["mcpServers"]["supabase"]["env"]["SUPABASE_ACCESS_TOKEN"]

    resp = http_requests.get(
        f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_ID}/api-keys",
        headers={"Authorization": f"Bearer {pat}"},
        timeout=30,
    )
    resp.raise_for_status()

    for key in resp.json():
        if key.get("name") == "service_role":
            return key["api_key"]

    raise RuntimeError("service_role key not found")


def get_pages_without_embedding(supabase_url: str, service_key: str) -> list[dict]:
    """embeddingが未設定のpage_knowledgeレコードを取得する"""
    resp = http_requests.get(
        f"{supabase_url}/rest/v1/page_knowledge",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
        },
        params={
            "select": "id,slug,title,content",
            "embedding": "is.null",
            "is_active": "eq.true",
        },
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


def generate_embedding(client: genai.Client, text: str) -> list[float]:
    """テキストのEmbeddingを生成する"""
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config={
            "task_type": TASK_TYPE,
            "output_dimensionality": EMBEDDING_DIMENSIONS,
        },
    )
    return result.embeddings[0].values


def update_embedding(supabase_url: str, service_key: str, page_id: str, embedding: list[float]):
    """page_knowledgeのembeddingカラムを更新する"""
    # pgvectorはJSON配列形式の文字列で受け取る
    embedding_str = "[" + ",".join(str(v) for v in embedding) + "]"

    resp = http_requests.patch(
        f"{supabase_url}/rest/v1/page_knowledge",
        headers={
            "apikey": service_key,
            "Authorization": f"Bearer {service_key}",
            "Content-Type": "application/json",
        },
        params={"id": f"eq.{page_id}"},
        json={"embedding": embedding_str},
        timeout=30,
    )
    resp.raise_for_status()


def main():
    parser = argparse.ArgumentParser(description="ナレッジデータのEmbedding生成")
    parser.add_argument("--dry-run", action="store_true", help="Embedding生成せずに対象一覧を表示")
    args = parser.parse_args()

    # API キー確認
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        print("エラー: GEMINI_API_KEY を .env に設定してください")
        sys.exit(1)

    # Supabase接続情報
    supabase_url = f"https://{SUPABASE_PROJECT_ID}.supabase.co"
    service_key = get_supabase_service_key()

    # 対象レコード取得
    pages = get_pages_without_embedding(supabase_url, service_key)
    print(f"Embedding未設定: {len(pages)}件")

    if not pages:
        print("すべてのレコードにEmbeddingが設定済みです。")
        return

    if args.dry_run:
        for i, page in enumerate(pages, 1):
            print(f"  [{i}] {page['slug']} — {page['title']} ({len(page['content'])}文字)")
        return

    # Gemini クライアント初期化
    client = genai.Client(api_key=gemini_api_key)

    # Embedding生成・保存
    success = 0
    failed = 0

    for i, page in enumerate(pages, 1):
        slug = page["slug"]
        content = page["content"]
        print(f"  [{i}/{len(pages)}] {slug} ...", end=" ", flush=True)

        try:
            embedding = generate_embedding(client, content)
            update_embedding(supabase_url, service_key, page["id"], embedding)
            print(f"OK ({len(embedding)}次元)")
            success += 1
        except Exception as e:
            print(f"FAILED ({e})")
            failed += 1

        # レート制限（Gemini API: 1500 RPM for free tier）
        time.sleep(1)

    print(f"\n結果: 成功={success}, 失敗={failed}")


if __name__ == "__main__":
    main()
