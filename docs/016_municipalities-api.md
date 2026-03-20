# 016: 自治体一覧APIエンドポイント

## 概要

GET /api/ai/municipalities で対応自治体一覧を返すAPIを実装する。

## 対象（REQUIREMENTS.md §9.3）

## タスク

- [ ] GET /api/ai/municipalities Route Handler作成
- [ ] municipalitiesテーブルからis_active=trueの自治体を取得
- [ ] レスポンス: { municipalities: [{ id, name, code }] }
- [ ] チャットUIの自治体セレクターとの連携
