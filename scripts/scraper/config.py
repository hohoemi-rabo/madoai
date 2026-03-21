"""スクレイピング設定・定数定義"""

import os

BASE_URL = "https://www.city.iida.lg.jp"
CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "iida_slugs.csv")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "output")

# レート制限
REQUEST_INTERVAL_SEC = 2.0
MAX_PAGES_PER_RUN = 100

# User-Agent
USER_AGENT = "MADOAI-Scraper/1.0 (+https://github.com/madoai; contact: masayuki)"

# robots.txt で禁止されているパス（飯田市HP事前確認結果）
DISALLOWED_PATHS = [
    "/cgi-bin/", "/gmap/", "/iidasypher/", "/kawamoto/",
    "/bunkakaikan/", "/waki/", "/sakurasaku/", "/toj/",
    "/puppet/", "/namiki/", "/jitu/", "/nbank/", "/rikaisen/",
]

# MVP対象スラッグプレフィックス
TARGET_PREFIXES = [
    "site/gomi",
    "site/kosodate/",
    "soshiki/12/",
    "soshiki/173/",
    "soshiki/15/kyuuzitsuyakan.html",
    "soshiki/19/",
    "life/2/12/64",
    "life/2/6/33",
    "life/2/6/35",
]

# スラッグ→カテゴリマッピング（プレフィックス順にマッチ）
CATEGORY_MAP = {
    "site/gomi": "ごみ・リサイクル",
    "soshiki/19": "ごみ・リサイクル",
    "life/2/12/64": "ごみ・リサイクル",
    "site/kosodate": "子育て",
    "soshiki/12": "子育て",
    "soshiki/173": "子育て",
    "soshiki/15": "子育て",
    "life/2/6/33": "子育て",
    "life/2/6/35": "子育て",
}

# 除外スラッグ（組織トップページは別ページなので混同防止）
EXCLUDE_SLUGS = [
    "soshiki/12.html",
    "soshiki/15.html",
    "soshiki/19.html",
]


def get_category(slug: str) -> str:
    """スラッグからカテゴリを判定する"""
    for prefix, category in CATEGORY_MAP.items():
        if slug.startswith(prefix):
            return category
    return "その他"


def is_target_slug(slug: str) -> bool:
    """スラッグがMVP対象かどうか判定する"""
    if slug in EXCLUDE_SLUGS:
        return False
    return any(slug.startswith(prefix) or slug == prefix.rstrip("/") for prefix in TARGET_PREFIXES)
