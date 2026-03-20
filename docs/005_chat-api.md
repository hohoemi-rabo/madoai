# 005: AIチャットAPIエンドポイント

## 概要

POST /api/ai/chat のストリーミングAPIを実装する。ユーザーの質問をEmbedding化→ベクトル検索→Geminiで回答生成→SSEストリーミングの一連の処理。

## 対象（REQUIREMENTS.md §9.1, §10, §17 Phase A-5,6）

## タスク

- [ ] 環境変数の設定（GEMINI_API_KEY, GEMINI_MODEL, EMBEDDING_MODEL, Supabase関連）
- [ ] POST /api/ai/chat Route Handler作成（Edge Runtime）
- [ ] リクエストバリデーション（message, session_id必須）
- [ ] 利用制限チェック（check_usage_limit RPC呼び出し）
- [ ] ユーザー質問のEmbedding化（taskType: QUESTION_ANSWERING）
- [ ] ベクトル検索（match_pages RPC、2〜5件取得）
- [ ] システムプロンプト構築（§10.1〜§10.3に基づく）
- [ ] Gemini 3.1 Flash-Lite へのリクエスト送信
- [ ] SSEストリーミングレスポンス実装（text, sources, spots, suggestions, done, error）
- [ ] 会話履歴の受け取り・コンテキスト送信（直近10往復）
- [ ] 使用ログ記録（log_ai_usage RPC呼び出し）
- [ ] エラーハンドリング（API障害時のフォールバックメッセージ）

## APIレスポンス形式

`text/event-stream` (Server-Sent Events)

## ストリーミングイベント

| type | 説明 |
|------|------|
| text | AIの回答テキスト（逐次送信） |
| sources | 参照元ページ配列 |
| spots | 問い合わせ先情報配列 |
| suggestions | 関連タグのラベル配列 |
| done | ストリーミング完了 |
| error | エラーメッセージ |
