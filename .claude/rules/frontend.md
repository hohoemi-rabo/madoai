---
description: Next.js App Router / React / Tailwind CSS のフロントエンドルール
paths:
  - src/**/*.tsx
  - src/**/*.ts
  - src/**/*.css
---

# フロントエンドルール

## Tailwind CSS

- Tailwind CSS v3 構文を使用（v4ではない — 意図的にダウングレード済み）
- テーマ: CSS custom properties（`--background`, `--foreground`）
- Fonts: Geist Sans/Mono（`next/font/google`、CSS変数で適用）

## Next.js App Router ファイル規約

| ファイル | 役割 |
|---|---|
| `page.tsx` | ルートのUI（このファイルがないとルートは公開されない） |
| `layout.tsx` | 複数ルートで共有されるUI（ネスト可能） |
| `loading.tsx` | React SuspenseベースのローディングUI |
| `error.tsx` | エラーバウンダリ（`'use client'`必須） |
| `not-found.tsx` | 404ページ |
| `route.ts` | APIエンドポイント（Route Handler） |

## Server Components vs Client Components

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

## データ取得パターン

Server Component内で直接`async/await`でデータ取得する。`getServerSideProps`/`getStaticProps`は不要。

```tsx
// 静的データ（デフォルト、キャッシュされる）
const data = await fetch('https://...', { cache: 'force-cache' })

// 動的データ（毎リクエスト取得）
const data = await fetch('https://...', { cache: 'no-store' })

// 時間ベース再検証（ISR相当）
const data = await fetch('https://...', { next: { revalidate: 60 } })
```

## Server Actions

- `'use server'`ディレクティブでサーバー側のミューテーション関数を定義
- フォーム送信やデータ更新に使用し、APIルートの代わりになる
- Client Componentにはprops経由でServer Actionを渡す

## メタデータ

- `metadata`オブジェクトまたは`generateMetadata`関数をServer Componentの`page.tsx`/`layout.tsx`でexportする
- Client Componentからはメタデータをexportできない

## ルーティング

- **Route Groups**: `(groupName)/`でURLに影響を与えずにルートを整理
- **Dynamic Routes**: `[param]/`で動的セグメント
- **Parallel Routes**: `@slot/`で同じレイアウト内に複数ページを並列表示
- **ネストレイアウト**: 各ルートセグメントに`layout.tsx`を配置して共有UIを定義
