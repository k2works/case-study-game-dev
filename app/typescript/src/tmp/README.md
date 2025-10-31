# Swagger UI 検証環境

Try it out ボタンの表示問題を検証するための最小限の環境です。

## 検証用サーバー

### 1. Swagger 2.0 形式
```bash
npm run test:swagger2
```
- ポート: 3001
- Swagger UI: http://localhost:3001/documentation
- 形式: Swagger 2.0 (swagger プロパティ)

### 2. OpenAPI 3.x 形式
```bash
npm run test:openapi
```
- ポート: 3002
- Swagger UI: http://localhost:3002/documentation
- 形式: OpenAPI 3.x (openapi プロパティ)

## 確認ポイント

1. **Try it out ボタンの表示**
   - 各エンドポイントに Try it out ボタンが表示されるか？

2. **実行可能性**
   - Try it out をクリックしてパラメータを入力できるか？
   - Execute をクリックして API を実行できるか？

3. **設定の違い**
   - 本番コード (src/api/app.ts) との違いは何か？
   - どの設定が Try it out の動作に影響しているか？

## テストエンドポイント

### GET /test
パラメータなし、シンプルな GET リクエスト

### POST /echo
リクエストボディに message を送信すると、それをエコーバック

## 本番コードとの比較

このディレクトリのコードと src/api/app.ts を比較して、何が違うかを確認してください。

重要な違い:
- [ ] swagger vs openapi 設定
- [ ] host/schemes vs servers 設定
- [ ] consumes/produces の有無
- [ ] staticCSP の設定
- [ ] uiConfig の内容
- [ ] routePrefix の違い
