## ステータス: 完了

# 016: 自治体一覧APIエンドポイント

## 概要

GET /api/ai/municipalities で対応自治体一覧を返すAPIを実装する。

## 対象（REQUIREMENTS.md §9.3）

## タスク

- [x] GET /api/ai/municipalities Route Handler作成
- [x] municipalitiesテーブルからis_active=trueの自治体を取得
- [x] レスポンス: { municipalities: [{ id, name, code }] }
- [ ] チャットUIの自治体セレクターとの連携（MVP飯田市固定のため将来対応）
