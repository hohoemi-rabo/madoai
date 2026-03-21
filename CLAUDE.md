# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MADOAI（まどあい）- AI-powered local government information retrieval assistant. MVP targets Iida City (飯田市) for garbage disposal & childcare information. Designed for business plan competition submission with planned multi-tenant support.

## Development Commands

```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build with Turbopack
npm run start      # Start production server
npm run lint       # Run ESLint
```

## Tech Stack

- **Next.js 15** (App Router) with **Turbopack**
- **React 19** / **TypeScript 5**
- **Tailwind CSS 3.4** (intentionally downgraded from v4)
- **ESLint v9** flat config (`next/core-web-vitals`, `next/typescript`)
- **Supabase** — DB / Auth / RPC
- **Google Gemini** — gemini-3.1-flash-lite-preview (chat), gemini-embedding-001 (search)
- **Lucide React** — アイコン（絵文字不使用）

## Architecture

- `src/app/` — App Router pages and layouts
- `src/app/api/ai/` — AI関連APIエンドポイント（chat, tags）
- `src/components/chat/` — チャットUIコンポーネント（Client Components）
- `src/lib/` — Supabaseクライアント、システムプロンプト
- `scripts/scraper/` — Python scraping & import scripts
- Path alias: `@/*` → `./src/*`

## Supabase

- **Project**: madoai (ID: `szuakyhpdczkftkdepiq`)
- **Region**: ap-northeast-1
- **Organization**: masa-portfolio (`xgayodyuiwtftioftjvb`)
- **game-scope** project is for another project — do NOT use it

## Key Conventions

- All output to the user must be in Japanese
- ダークテーマUI（背景 #131314）
- デザイントークンは globals.css の CSS custom properties を使用

## Rules（自動適用）

詳細なルールは `.claude/rules/` に分割管理。ファイルパターンに応じて自動で適用される。

| ルールファイル | 適用対象 | 内容 |
|---|---|---|
| `frontend.md` | `src/**/*.tsx, ts, css` | Next.js App Router / Tailwind CSS |
| `backend.md` | `src/app/api/**`, `src/lib/**` | Supabase / API設計 |
| `scraping.md` | `scripts/**/*.py` | スクレイピング・データ投入 |
| `docs.md` | `docs/**/*.md` | チケットTodo管理 |

※ルールファイルのfrontmatterは `paths` 属性（配列形式）を使用する。
