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
- **Supabase** via MCP integration (game-scope project is for another project — do not use it)

## Architecture

- `src/app/` — App Router pages and layouts
- Path alias: `@/*` → `./src/*`
- Theming via CSS custom properties (`--background`, `--foreground`) with dark mode support (`prefers-color-scheme`)
- Fonts: Geist Sans/Mono loaded via `next/font/google` with CSS variables

## Key Conventions

- All output to the user must be in Japanese
- Tailwind CSS v3 syntax (not v4) — project was intentionally downgraded
- Root layout sets `lang="en"` and applies Geist font variables + antialiased class

## チケット管理（docs/）

チケットファイルは `docs/` 配下に `{連番}_{slug}.md` 形式で管理する。

### Todo管理ルール

- 各チケット内のタスクは `- [ ]` で未完了を表す
- タスク完了時は `- [x]` に更新する
- チケット内の全タスクが完了したらファイル先頭に `## ステータス: 完了` を追記する

## Next.js App Router ベストプラクティス

### ファイル規約

| ファイル | 役割 |
|---|---|
| `page.tsx` | ルートのUI（このファイルがないとルートは公開されない） |
| `layout.tsx` | 複数ルートで共有されるUI（ネスト可能） |
| `loading.tsx` | React SuspenseベースのローディングUI |
| `error.tsx` | エラーバウンダリ（`'use client'`必須） |
| `not-found.tsx` | 404ページ |
| `route.ts` | APIエンドポイント（Route Handler） |

### Server Components vs Client Components

- `app/`配下のコンポーネントはデフォルトで**Server Component**
- `'use client'`ディレクティブをファイル先頭に書いた場合のみClient Component
- **Server Component優先**: データ取得、メタデータ、機密ロジックはServer Componentで処理
- **Client Componentは最小限に**: `useState`/`useEffect`/イベントハンドラ等のインタラクションが必要な場合のみ使用
- Client Componentは**コンポーネントツリーの末端（リーフ）に配置**し、Server Componentを親に保つ

```tsx
// Server Component (default) — データ取得はここで
import { ClientButton } from './client-button'

export default async function Page() {
  const data = await fetchData()
  return <ClientButton data={data} />
}
```

```tsx
// Client Component — インタラクションが必要な部分のみ
'use client'
export function ClientButton({ data }: { data: Data }) {
  return <button onClick={() => handleClick(data)}>Action</button>
}
```

### データ取得パターン

Server Component内で直接`async/await`でデータ取得する。`getServerSideProps`/`getStaticProps`は不要。

```tsx
// 静的データ（デフォルト、キャッシュされる）
const data = await fetch('https://...', { cache: 'force-cache' })

// 動的データ（毎リクエスト取得）
const data = await fetch('https://...', { cache: 'no-store' })

// 時間ベース再検証（ISR相当）
const data = await fetch('https://...', { next: { revalidate: 60 } })
```

### Server Actions

- `'use server'`ディレクティブでサーバー側のミューテーション関数を定義
- フォーム送信やデータ更新に使用し、APIルートの代わりになる
- Client Componentにはprops経由でServer Actionを渡す

```tsx
// app/actions.ts
'use server'
export async function createItem(formData: FormData) {
  // DB操作等
}
```

### メタデータ

- `metadata`オブジェクトまたは`generateMetadata`関数をServer Componentの`page.tsx`/`layout.tsx`でexportする
- Client Componentからはメタデータをexportできない

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ページタイトル',
  description: '説明文',
}
```

### ルーティング

- **Route Groups**: `(groupName)/`でURLに影響を与えずにルートを整理
- **Dynamic Routes**: `[param]/`で動的セグメント
- **Parallel Routes**: `@slot/`で同じレイアウト内に複数ページを並列表示
- **ネストレイアウト**: 各ルートセグメントに`layout.tsx`を配置して共有UIを定義
