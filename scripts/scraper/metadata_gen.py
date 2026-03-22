"""メタデータ（summary, keywords）をGemini AIで一括生成するスクリプト"""

import json
import os
import sys
import time

import requests as http_requests
from dotenv import load_dotenv
from google import genai

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env.local"))

SUPABASE_PROJECT_ID = "szuakyhpdczkftkdepiq"
CHAT_MODEL = "gemini-3.1-flash-lite-preview"


def get_supabase_service_key() -> str:
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


def main():
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        print("エラー: GEMINI_API_KEY を .env.local に設定してください")
        sys.exit(1)

    supabase_url = f"https://{SUPABASE_PROJECT_ID}.supabase.co"
    service_key = get_supabase_service_key()
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }

    # summary が空のレコードを取得
    resp = http_requests.get(
        f"{supabase_url}/rest/v1/page_knowledge",
        headers=headers,
        params={
            "select": "id,slug,title,content,metadata",
            "is_active": "eq.true",
        },
        timeout=30,
    )
    resp.raise_for_status()
    pages = resp.json()

    # summary が空のものだけフィルタ
    targets = [p for p in pages if not p.get("metadata", {}).get("summary")]
    print(f"メタデータ生成対象: {len(targets)}件 / 全{len(pages)}件")

    if not targets:
        print("全てのレコードにsummaryが設定済みです。")
        return

    client = genai.Client(api_key=gemini_api_key)
    success = 0
    failed = 0

    for i, page in enumerate(targets, 1):
        slug = page["slug"]
        print(f"  [{i}/{len(targets)}] {slug} ...", end=" ", flush=True)

        try:
            prompt = f"""以下のページコンテンツを分析して、JSON形式で回答してください。

タイトル: {page['title']}

コンテンツ:
{page['content'][:3000]}

以下のJSON形式で回答してください（他のテキストは不要）:
{{
  "summary": "2〜3文でページの内容を要約（日本語）",
  "keywords": ["検索に使えるキーワードを5〜8個"]
}}"""

            response = client.models.generate_content(
                model=CHAT_MODEL,
                contents=prompt,
                config={"temperature": 0.2},
            )

            text = response.text.strip()
            # JSON部分を抽出
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()

            result = json.loads(text)
            summary = result.get("summary", "")
            keywords = result.get("keywords", [])

            # メタデータ更新
            metadata = page.get("metadata", {})
            metadata["summary"] = summary
            metadata["keywords"] = keywords

            update_resp = http_requests.patch(
                f"{supabase_url}/rest/v1/page_knowledge",
                headers=headers,
                params={"id": f"eq.{page['id']}"},
                json={"metadata": metadata},
                timeout=30,
            )
            update_resp.raise_for_status()

            print(f"OK (summary: {len(summary)}文字, keywords: {len(keywords)}個)")
            success += 1

        except Exception as e:
            print(f"FAILED ({e})")
            failed += 1

        time.sleep(1)

    print(f"\n結果: 成功={success}, 失敗={failed}")


if __name__ == "__main__":
    main()
