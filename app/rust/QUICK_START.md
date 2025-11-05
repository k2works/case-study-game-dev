# Machine Learning API クイックスタートガイド

## サーバー起動（3ステップ）

### ステップ1: ディレクトリ移動

```bash
cd app/rust
```

### ステップ2: サーバー起動

#### 方法A: just コマンドを使用（最も簡単）

```bash
just serve
```

または短縮形:
```bash
just api
```

#### 方法B: 起動スクリプトを使用

**Windows の場合:**
```cmd
start_api_server.bat
```

**Linux/macOS の場合:**
```bash
chmod +x start_api_server.sh
./start_api_server.sh
```

#### 方法C: cargo コマンドを直接使用

```bash
# Windows (PowerShell)
$env:RUST_LOG="ml_tdd_rust=info,tower_http=debug"
cargo run --bin ml-api-server

# Linux/macOS
export RUST_LOG=ml_tdd_rust=info,tower_http=debug
cargo run --bin ml-api-server
```

### ステップ3: ブラウザで確認

サーバーが起動したら、以下の URL をブラウザで開いてください：

```
http://127.0.0.1:3000/swagger-ui
```

または、以下のいずれかでも OK です：
- `http://localhost:3000/swagger-ui`
- `http://127.0.0.1:3000/swagger-ui/`（末尾のスラッシュあり）

## Swagger UI の使い方

### 1. API の一覧を確認

Swagger UI のページで、以下のセクションが表示されます：

- **Health** - ヘルスチェック API
- **Prediction** - 機械学習予測 API（4つ）

### 2. API を試す

1. 試したい API をクリック（例: `POST /predict/iris`）
2. **Try it out** ボタンをクリック
3. リクエストパラメータを入力（または例をそのまま使用）
4. **Execute** ボタンをクリック
5. レスポンスが表示されます

### 3. サンプルリクエスト

#### Iris 分類

```json
{
  "sepal_length": 5.1,
  "sepal_width": 3.5,
  "petal_length": 1.4,
  "petal_width": 0.2
}
```

期待されるレスポンス:
```json
{
  "species": "setosa",
  "confidence": 0.95
}
```

#### Cinema 興行収入予測

```json
{
  "sns1": 50,
  "sns2": 30,
  "actor": 70,
  "original": 1
}
```

#### Survived 生存予測

```json
{
  "pclass": 1,
  "sex": "female",
  "age": 29.0,
  "sibsp": 0,
  "parch": 0,
  "fare": 211.3375
}
```

#### Boston 住宅価格予測

```json
{
  "rm": 6.575,
  "lstat": 4.98,
  "ptratio": 15.3,
  "crime": "low"
}
```

**crime の値**: `"very_low"`, `"low"`, `"high"` のいずれか

## curl での API テスト

コマンドラインから API をテストすることもできます：

```bash
# ヘルスチェック
curl http://127.0.0.1:3000/health

# Iris 分類
curl -X POST http://127.0.0.1:3000/predict/iris \
  -H "Content-Type: application/json" \
  -d '{"sepal_length":5.1,"sepal_width":3.5,"petal_length":1.4,"petal_width":0.2}'

# Boston 住宅価格予測
curl -X POST http://127.0.0.1:3000/predict/boston \
  -H "Content-Type: application/json" \
  -d '{"rm":6.575,"lstat":4.98,"ptratio":15.3,"crime":"low"}'
```

## サーバーの停止

サーバーを停止するには、サーバーを起動したターミナルで `Ctrl+C` を押してください。

## 便利なコマンド（just を使用）

### API テスト

```bash
# ヘルスチェック（別ターミナルで実行）
just api-health

# すべての API エンドポイントをテスト（別ターミナルで実行）
just api-test-all
```

### Swagger UI をブラウザで開く

```bash
# Windows
just api-docs-windows

# macOS
just api-docs-mac

# Linux
just api-docs-linux
```

### サンプルスクリプトを実行

```bash
# Iris 訓練
just example-iris-train

# Cinema 訓練
just example-cinema-train

# Survived 訓練
just example-survived-train

# Boston 訓練
just example-boston-train
```

### すべてのタスクを表示

```bash
just --list
```

または単に:
```bash
just
```

## トラブルシューティング

### ブラウザで開けない

1. **サーバーが起動しているか確認**

別のターミナル/コマンドプロンプトを開いて実行:
```bash
curl http://127.0.0.1:3000/health
```

正常なレスポンス:
```json
{"status":"OK","version":"0.1.0","models":["iris","cinema","survived","boston"]}
```

2. **正しい URL を使っているか確認**

- ✅ `http://127.0.0.1:3000/swagger-ui`
- ✅ `http://localhost:3000/swagger-ui`
- ❌ `https://127.0.0.1:3000/swagger-ui` (https ではなく http)

3. **ブラウザをリフレッシュ**

- `Ctrl+F5` (Windows) または `Cmd+Shift+R` (Mac) でキャッシュをクリア

### ログが表示されない

起動スクリプトを使用してください。環境変数 `RUST_LOG` が自動で設定されます。

または、手動で設定:

```bash
# Windows (PowerShell)
$env:RUST_LOG="ml_tdd_rust=info,tower_http=debug"
cargo run --bin ml-api-server

# Windows (CMD)
set RUST_LOG=ml_tdd_rust=info,tower_http=debug
cargo run --bin ml-api-server

# Linux/macOS
export RUST_LOG=ml_tdd_rust=info,tower_http=debug
cargo run --bin ml-api-server
```

### ポート 3000 が使用中

別のアプリケーションがポート 3000 を使用している可能性があります。

```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000
```

該当するプロセスを終了するか、別のポートを使用してください。

## 詳細なドキュメント

より詳しい情報は `README.md` を参照してください。
