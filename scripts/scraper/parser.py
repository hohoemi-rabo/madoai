"""HTML解析モジュール（コンテンツ抽出・メタデータ抽出・マークダウン変換）"""

import hashlib
import re
import warnings
from urllib.parse import urljoin

from bs4 import BeautifulSoup, NavigableString, Tag, XMLParsedAsHTMLWarning

warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

from .config import BASE_URL


def parse_page(html: str, slug: str, csv_title: str = "") -> dict | None:
    """HTMLを解析し、構造化データを返す"""
    soup = BeautifulSoup(html, "lxml")

    title = extract_title(soup, csv_title)
    if not title:
        return None

    content = extract_content(soup)
    if not content or len(content.strip()) < 10:
        print(f"  警告: コンテンツが短すぎます ({len(content.strip())}文字)")

    metadata = extract_metadata(soup)
    pdf_links = extract_pdf_links(soup)

    return {
        "title": title,
        "content": content,
        "content_hash": compute_content_hash(content),
        "metadata": metadata,
        "has_pdf_links": len(pdf_links) > 0,
        "pdf_urls": pdf_links,
    }


def extract_title(soup: BeautifulSoup, csv_title: str = "") -> str:
    """ページタイトルを抽出する"""
    # id="main_header" のテキストがページタイトル（飯田市HPの構造）
    main_header = soup.find(id="main_header")
    if main_header:
        title = main_header.get_text(strip=True)
        if title:
            return title

    # フォールバック: <title>タグからサフィックス除去
    title_tag = soup.find("title")
    if title_tag:
        title = re.sub(r"\s*-\s*飯田市.*$", "", title_tag.get_text(strip=True)).strip()
        if title:
            return title

    # フォールバック: CSVタイトルからサフィックス除去
    if csv_title:
        return re.sub(r"\s*-\s*飯田市.*$", "", csv_title).strip()

    return ""


def extract_content(soup: BeautifulSoup) -> str:
    """メインコンテンツをマークダウンに変換する"""
    # コンテンツ領域の特定: id="main_body" が飯田市HPの本文領域
    content_area = soup.find(id="main_body")
    if not content_area:
        # フォールバック: id="main"
        content_area = soup.find(id="main")
    if not content_area:
        content_area = soup.find("body")
    if not content_area:
        return ""

    # コンテンツのコピーを作って除外要素を削除
    content_area = _clone_tag(content_area)
    _remove_unwanted_elements(content_area)

    # 問い合わせセクションを除去（メタデータとして別途抽出する）
    _remove_contact_section(content_area)

    # マークダウンに変換
    lines = []
    _convert_to_markdown(content_area, lines)

    result = "\n".join(lines)
    # 連続空行を1つにまとめる
    result = re.sub(r"\n{3,}", "\n\n", result)
    return result.strip()


def extract_metadata(soup: BeautifulSoup) -> dict:
    """メタデータを抽出する"""
    text = soup.get_text()

    # 更新日 / 掲載日
    last_updated = ""
    date_match = re.search(r"(?:更新日|掲載日)[：:]\s*(\d{4}年\d{1,2}月\d{1,2}日)", text)
    if date_match:
        last_updated = date_match.group(1)

    # 担当部署
    department = ""
    # パターン1: 「お問い合わせ」セクション内の部署名リンク
    contact_section = _find_contact_section(soup)
    if contact_section:
        # 部署名は最初のリンクテキストまたは強調テキストに含まれる
        dept_link = contact_section.find("a")
        if dept_link and "soshiki" in (dept_link.get("href", "") or ""):
            department = dept_link.get_text(strip=True)
        if not department:
            strong = contact_section.find("strong")
            if strong:
                department = strong.get_text(strip=True)

    # 電話番号
    phone = ""
    phone_match = re.search(r"Tel[：:]\s*([\d-]+)", text)
    if phone_match:
        phone = phone_match.group(1)

    return {
        "department": department,
        "phone": phone,
        "last_updated": last_updated,
        "related_urls": [],
        "keywords": [],
        "summary": "",
    }


def extract_pdf_links(soup: BeautifulSoup) -> list[str]:
    """PDFリンクを収集する"""
    pdf_urls = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.endswith(".pdf") or "/uploaded/attachment/" in href:
            absolute_url = urljoin(BASE_URL + "/", href)
            if absolute_url not in pdf_urls:
                pdf_urls.append(absolute_url)
    return pdf_urls


def compute_content_hash(content: str) -> str:
    """コンテンツのSHA256ハッシュを計算する"""
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


# --- 内部ヘルパー関数 ---


def _clone_tag(tag: Tag) -> Tag:
    """BeautifulSoupタグのディープコピーを作成する"""
    from copy import copy
    import copy as copy_module
    return copy_module.copy(tag)


def _remove_unwanted_elements(soup: Tag) -> None:
    """除外対象の要素を削除する"""
    # パンくずリスト
    for el in soup.find_all(class_=re.compile(r"breadcrumb|topicpath|pan", re.I)):
        el.decompose()

    # ナビゲーション
    for el in soup.find_all(["nav", "header", "footer"]):
        el.decompose()

    # サイドバー
    for el in soup.find_all(class_=re.compile(r"sidebar|side-menu|tmp_side", re.I)):
        el.decompose()
    for el in soup.find_all(id=re.compile(r"sidebar|tmp_side", re.I)):
        el.decompose()

    # Adobe Reader案内
    for img in soup.find_all("img", src=re.compile(r"adobe|get_adobe", re.I)):
        parent = img.find_parent(["div", "p", "section"])
        if parent:
            parent.decompose()

    # アンケートリンク
    for a in soup.find_all("a", href=re.compile(r"questionnaire|enquete|ques/", re.I)):
        parent = a.find_parent(["div", "p", "li"])
        if parent:
            parent.decompose()

    # ページID・掲載日のテキスト（メタデータとして別途取得済み）
    for el in soup.find_all(class_=re.compile(r"tmp_update|page-id", re.I)):
        el.decompose()

    # SNSシェアボタン等
    for el in soup.find_all(class_=re.compile(r"share|sns|social", re.I)):
        el.decompose()

    # 飯田市HP固有: 問い合わせセクション（メタデータとして別途抽出済み）
    section_footer = soup.find(id="section_footer")
    if section_footer:
        section_footer.decompose()

    # 印刷リンク
    print_link = soup.find(id="print_mode_link")
    if print_link:
        print_link.decompose()


def _find_contact_section(soup: BeautifulSoup) -> Tag | None:
    """問い合わせセクションを見つける"""
    # 飯田市HPでは id="section_footer" が問い合わせセクション
    section_footer = soup.find(id="section_footer")
    if section_footer:
        return section_footer

    # フォールバック: テキスト検索
    for text in ["お問い合わせ", "問い合わせ先"]:
        el = soup.find(string=re.compile(text))
        if el:
            parent = el.find_parent(["div", "section", "table", "dl"])
            if parent:
                return parent
    return None


def _remove_contact_section(soup: Tag) -> None:
    """問い合わせセクションを本文から除去する"""
    contact = _find_contact_section(soup)
    if contact:
        contact.decompose()


def _convert_to_markdown(element: Tag, lines: list[str], depth: int = 0) -> None:
    """HTML要素をマークダウンに再帰的に変換する"""
    for child in element.children:
        if isinstance(child, NavigableString):
            text = child.strip()
            if text:
                lines.append(text)
            continue

        if not isinstance(child, Tag):
            continue

        tag_name = child.name

        # 見出し
        if tag_name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            level = int(tag_name[1])
            text = child.get_text(strip=True)
            if text:
                lines.append("")
                lines.append(f"{'#' * level} {text}")
                lines.append("")

        # 段落
        elif tag_name == "p":
            text = _inline_to_markdown(child)
            if text.strip():
                lines.append("")
                lines.append(text)

        # 順序なしリスト
        elif tag_name == "ul":
            lines.append("")
            for li in child.find_all("li", recursive=False):
                text = _inline_to_markdown(li)
                if text.strip():
                    lines.append(f"- {text}")
            lines.append("")

        # 順序付きリスト
        elif tag_name == "ol":
            lines.append("")
            for i, li in enumerate(child.find_all("li", recursive=False), 1):
                text = _inline_to_markdown(li)
                if text.strip():
                    lines.append(f"{i}. {text}")
            lines.append("")

        # テーブル
        elif tag_name == "table":
            _table_to_markdown(child, lines)

        # 定義リスト
        elif tag_name == "dl":
            lines.append("")
            for dt_dd in child.children:
                if isinstance(dt_dd, Tag):
                    if dt_dd.name == "dt":
                        text = dt_dd.get_text(strip=True)
                        if text:
                            lines.append(f"**{text}**")
                    elif dt_dd.name == "dd":
                        text = _inline_to_markdown(dt_dd)
                        if text.strip():
                            lines.append(f"  {text}")
            lines.append("")

        # div等のコンテナ要素は再帰的に処理
        elif tag_name in ("div", "section", "article", "main", "span", "blockquote"):
            _convert_to_markdown(child, lines, depth + 1)

        # その他のブロック要素
        elif tag_name in ("pre", "code"):
            text = child.get_text()
            if text.strip():
                lines.append(f"\n```\n{text}\n```\n")


def _inline_to_markdown(element: Tag) -> str:
    """インライン要素をマークダウンテキストに変換する"""
    parts = []
    for child in element.children:
        if isinstance(child, NavigableString):
            parts.append(str(child))
        elif isinstance(child, Tag):
            if child.name == "a" and child.get("href"):
                href = child["href"]
                if href.startswith("/") or href.startswith("http"):
                    absolute_url = urljoin(BASE_URL + "/", href)
                    text = child.get_text(strip=True)
                    if text:
                        parts.append(f"[{text}]({absolute_url})")
                else:
                    parts.append(child.get_text())
            elif child.name in ("strong", "b"):
                text = child.get_text(strip=True)
                if text:
                    parts.append(f"**{text}**")
            elif child.name in ("em", "i"):
                text = child.get_text(strip=True)
                if text:
                    parts.append(f"*{text}*")
            elif child.name == "br":
                parts.append("\n")
            elif child.name == "img":
                alt = child.get("alt", "")
                if alt:
                    parts.append(f"[画像: {alt}]")
            elif child.name in ("span", "font", "small"):
                parts.append(_inline_to_markdown(child))
            else:
                parts.append(child.get_text())

    return "".join(parts).strip()


def _table_to_markdown(table: Tag, lines: list[str]) -> None:
    """HTMLテーブルをマークダウンテーブルに変換する"""
    rows = table.find_all("tr")
    if not rows:
        return

    lines.append("")

    md_rows = []
    for row in rows:
        cells = row.find_all(["th", "td"])
        cell_texts = [c.get_text(strip=True).replace("|", "\\|") for c in cells]
        if any(cell_texts):
            md_rows.append("| " + " | ".join(cell_texts) + " |")

    if not md_rows:
        return

    # ヘッダー行（最初の行）
    lines.append(md_rows[0])

    # セパレーター
    first_row_cells = rows[0].find_all(["th", "td"])
    separator = "| " + " | ".join(["---"] * len(first_row_cells)) + " |"
    lines.append(separator)

    # データ行
    for row in md_rows[1:]:
        lines.append(row)

    lines.append("")
