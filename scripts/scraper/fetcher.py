"""HTTP取得モジュール（レート制限・robots.txt確認）"""

import time
from urllib.parse import urlparse

import requests

from .config import BASE_URL, DISALLOWED_PATHS, REQUEST_INTERVAL_SEC, USER_AGENT

_last_request_time = 0.0


def create_session() -> requests.Session:
    """User-Agent設定済みのセッションを作成する"""
    session = requests.Session()
    session.headers.update({
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ja,en;q=0.5",
    })
    return session


def check_robots_txt(url: str) -> bool:
    """URLがrobots.txtで許可されているか確認する"""
    parsed = urlparse(url)
    path = parsed.path
    for disallowed in DISALLOWED_PATHS:
        if path.startswith(disallowed):
            return False
    return True


def fetch_page(url: str, session: requests.Session) -> str | None:
    """HTMLを取得する（レート制限付き、リトライ1回）"""
    global _last_request_time

    # レート制限
    elapsed = time.time() - _last_request_time
    if elapsed < REQUEST_INTERVAL_SEC:
        time.sleep(REQUEST_INTERVAL_SEC - elapsed)

    for attempt in range(2):
        try:
            _last_request_time = time.time()
            response = session.get(url, timeout=30)
            response.raise_for_status()

            # エンコーディング補正
            if response.encoding is None or response.encoding.lower() == "iso-8859-1":
                response.encoding = response.apparent_encoding

            return response.text

        except requests.RequestException as e:
            if attempt == 0:
                print(f"  リトライ中... ({e})")
                time.sleep(5)
            else:
                print(f"  取得失敗: {e}")
                return None

    return None
