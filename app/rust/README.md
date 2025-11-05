# Rust Machine Learning with TDD

Rust で機械学習を学ぶプロジェクト。テスト駆動開発（TDD）アプローチで実装しています。

## 概要

このプロジェクトでは、以下を実現します：

- **分類問題（基礎）**: Decision Tree による Iris 分類（Chapter 4）
- **回帰問題（基礎）**: Linear Regression による Cinema 興行収入予測（Chapter 5）
- **分類問題（実践）**: Logistic Regression による Survived 生存予測（Chapter 6）
- **回帰問題（高度）**: Ridge Regression による Boston 住宅価格予測（Chapter 7）
- **REST API**: Axum による機械学習 API（Chapter 8）
- **TDD**: テスト駆動開発によるコード品質保証

## 技術スタック

- **Rust**: 1.88+
- **linfa**: 機械学習アルゴリズム（scikit-learn 相当）
- **ndarray**: 多次元配列（NumPy 相当）
- **csv**: CSV ファイル処理
- **axum**: Web API フレームワーク
- **tokio**: 非同期ランタイム
- **utoipa**: OpenAPI / Swagger UI ドキュメント自動生成

## セットアップ

### 前提条件

- Rust 1.88 以上がインストールされていること
- Python 3.11 以上がインストールされていること（Jupyter Notebook 用）
- just コマンド（オプション）: `cargo install just`

### インストール

#### Rust 環境

```bash
# Rust のインストール（未インストールの場合）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# just のインストール（オプション）
cargo install just

# プロジェクトディレクトリに移動
cd app/rust

# 依存関係をダウンロード
cargo build

# テスト実行
cargo test
```

#### Jupyter Notebook 環境

```bash
# Windows の場合
setup_jupyter.bat

# Linux/macOS の場合
chmod +x setup_jupyter.sh
./setup_jupyter.sh
```

または手動でセットアップ:

```bash
# Python 仮想環境を作成
python -m venv venv

# 仮想環境をアクティベート（Windows）
venv\Scripts\activate

# 仮想環境をアクティベート（Linux/macOS）
source venv/bin/activate

# パッケージをインストール
pip install notebook pandas matplotlib seaborn scikit-learn

# Jupyter カーネルを登録
python -m ipykernel install --user --name=ml-tdd-rust --display-name="ML TDD Rust"
```

## 開発コマンド

### just を使用（推奨）

#### 利用可能なタスク一覧を表示

```bash
# すべてのタスクを表示
just --list

# または単に
just
```

#### 品質チェック

```bash
# すべての品質チェックを実行（フォーマット、リンター、テスト）
just all

# テスト実行（ユニットテスト + 統合テスト）
just test

# API 統合テストのみ実行
just test-api

# リンター実行
just lint

# コードフォーマット
just fmt

# CI チェック（フォーマット、リンター、テスト）
just ci
```

#### API サーバー

```bash
# API サーバーを起動（ログ表示あり）
just serve

# または
just api

# リリースビルドで起動
just serve-release

# ヘルスチェック（別ターミナルで実行）
just api-health

# すべての API エンドポイントをテスト（別ターミナルで実行）
just api-test-all
```

**Swagger UI をブラウザで開く:**
```bash
# Windows
just api-docs-windows

# macOS
just api-docs-mac

# Linux
just api-docs-linux
```

#### サンプルスクリプト実行

```bash
# Iris 訓練
just example-iris-train

# Iris K-Fold 検証
just example-iris-validate

# Cinema 訓練
just example-cinema-train

# Survived 訓練
just example-survived-train

# Boston 訓練
just example-boston-train

# すべてのサンプルスクリプトを実行
just examples-all
```

#### その他

```bash
# リリースビルド
just build

# デバッグビルド
just build-debug

# クリーン
just clean

# ドキュメント生成
just doc
```

### cargo を直接使用

```bash
# テスト実行
cargo test --verbose

# リンター実行
cargo clippy -- -D warnings

# コードフォーマット
cargo fmt

# リリースビルド
cargo build --release
```

## プロジェクト構造

```
app/rust/
├── Cargo.toml           # プロジェクト設定・依存関係
├── .cargo/
│   └── config.toml      # cargo 設定
├── rustfmt.toml         # フォーマッター設定
├── justfile             # 開発タスク定義（just コマンド用）
├── src/
│   ├── lib.rs           # ライブラリルート
│   ├── main.rs          # API サーバーエントリポイント
│   ├── models/          # 機械学習モデル
│   │   ├── mod.rs       # モデルモジュール
│   │   └── iris.rs      # Iris 分類器
│   ├── api/             # API 層（Chapter 8）
│   ├── utils/           # ユーティリティ
│   └── error.rs         # エラー型定義
├── examples/            # サンプルスクリプト
│   ├── iris_train.rs    # Iris 訓練スクリプト
│   └── iris_validate.rs # Iris 検証スクリプト（K-Fold）
├── notebooks/           # Jupyter Notebook
│   └── iris_exploration.ipynb  # Iris データ探索
├── tests/               # 統合テスト
├── data/                # データセット
│   └── iris.csv         # Iris データセット
└── README.md            # このファイル
```

## 実行例

### Iris 分類モデルの訓練

```bash
# 訓練スクリプトを実行
cargo run --example iris_train
```

出力例:
```
=== Iris 分類モデルの訓練 ===

1. データ読み込み中...
   データ件数: 150 件
   特徴量数: 4 個
   訓練データ: 120 件
   検証データ: 30 件

2. モデル訓練中...
   訓練完了

3. モデル評価:
   訓練データ精度: 98.33%
   検証データ精度: 70.00%

4. サンプル予測:
   ✓ 実際: virginica    | 予測: virginica
   ✓ 実際: virginica    | 予測: virginica
   ...
```

### K-Fold 交差検証

```bash
# 交差検証スクリプトを実行
cargo run --example iris_validate
```

出力例:
```
=== Iris 分類モデルの K-Fold 交差検証 ===

1. データ読み込み中...
   データ件数: 150 件

2. 5-Fold 交差検証実行中...
   Fold 1: 精度 = 100.00% (訓練: 120 件, テスト: 30 件)
   Fold 2: 精度 = 93.33% (訓練: 120 件, テスト: 30 件)
   ...

3. 結果:
   平均精度: 88.67% (± 10.87%)
```

### Cinema 興行収入予測モデルの訓練

```bash
# 訓練スクリプトを実行
cargo run --example cinema_train
```

出力例:
```
=== Cinema 興行収入予測モデルの訓練 ===

1. データ読み込み中...
   データ件数: 100 件
   特徴量数: 4 個
   訓練データ: 80 件
   検証データ: 20 件

2. モデル訓練中...
   訓練完了

3. モデル評価:
   訓練データ:
     R² スコア: 0.7942
     MAE: 296.00
     RMSE: 368.98

   検証データ:
     R² スコア: 0.5443
     MAE: 385.55
     RMSE: 472.54

4. サンプル予測:
   ✓ サンプル 1: 実際 = 9964 万円 | 予測 = 9467 万円 | 誤差 = 497 万円
   ✓ サンプル 2: 実際 = 8575 万円 | 予測 = 9117 万円 | 誤差 = 542 万円
   ...
```

**評価指標の意味:**
- **R² スコア**: 決定係数（1.0 に近いほど良い、0.79 は約 80% の予測精度）
- **MAE**: 平均絶対誤差（約 296-386 万円の予測誤差）
- **RMSE**: 二乗平均平方根誤差（MAE より外れ値に敏感）

### Cinema K-Fold 交差検証

```bash
# 交差検証スクリプトを実行
cargo run --example cinema_validate
```

出力例:
```
=== Cinema 興行収入予測モデルの K-Fold 交差検証 ===

1. データ読み込み中...
   データ件数: 100 件

2. 5-Fold 交差検証実行中...
   Fold 1: R² = 0.8189, MAE = 342.92, RMSE = 427.60 (訓練: 80 件, テスト: 20 件)
   Fold 2: R² = 0.7410, MAE = 289.83, RMSE = 406.95 (訓練: 80 件, テスト: 20 件)
   Fold 3: R² = 0.5813, MAE = 338.66, RMSE = 421.53 (訓練: 80 件, テスト: 20 件)
   Fold 4: R² = 0.7931, MAE = 247.21, RMSE = 323.46 (訓練: 80 件, テスト: 20 件)
   Fold 5: R² = 0.5443, MAE = 385.55, RMSE = 472.54 (訓練: 80 件, テスト: 20 件)

3. 結果:

   R² スコア:
     平均: 0.6957 (± 0.1120)
     最高: 0.8189
     最低: 0.5443

   MAE (平均絶対誤差):
     平均: 320.83 万円 (± 47.70)
     最良: 247.21 万円
     最悪: 385.55 万円

   RMSE (二乗平均平方根誤差):
     平均: 410.42 万円 (± 48.69)
     最良: 323.46 万円
     最悪: 472.54 万円
```

**交差検証の利点:**
- 単一の train/test split より信頼性が高い評価
- モデルの安定性を測定（標準偏差で確認）
- データセット全体を有効活用
- 過学習の検出に有効

### データ探索（Jupyter Notebook）

```bash
# 仮想環境をアクティベート（Windows）
venv\Scripts\activate

# 仮想環境をアクティベート（Linux/macOS）
source venv/bin/activate

# Jupyter Notebook を起動
jupyter notebook notebooks/iris_exploration.ipynb

# または Jupyter Lab を使用
jupyter lab notebooks/
```

このノートブックには以下が含まれています：
- データの基本統計
- 特徴量の分布（ヒストグラム、箱ひげ図）
- ペアプロット
- 相関行列
- 品種ごとの特徴量分析

### Rust 実装チュートリアル（Jupyter Notebook）

```bash
# Jupyter Notebook を起動
jupyter notebook notebooks/iris_rust_tutorial.ipynb
```

このノートブックには以下が含まれています：
- Rust プロジェクト構造の説明
- エラーハンドリングの実装
- IrisClassifier の詳細解説
- Python からの Rust コード実行方法
- Rust vs Python の比較
- 型安全性とパフォーマンスの解説

**注意**:
- Windows 環境では evcxr_jupyter (Rust カーネル) のビルドに問題があるため、Python カーネルでコード解説を行います
- 実際の Rust コードは `cargo run --example` で実行してください
- Jupyter を使用する前に、Python 仮想環境をアクティベートする必要があります

### Cinema データ探索（Jupyter Notebook）

```bash
# Jupyter Notebook を起動
jupyter notebook notebooks/cinema_exploration.ipynb
```

このノートブックには以下が含まれています：
- データの基本統計と欠損値の確認
- 特徴量の分布（ヒストグラム）
- 相関行列と興行収入との関係性
- 散布図による可視化
- 原作有無による興行収入の比較
- 線形回帰モデルの予測性能の考察

**主な発見**:
- SNS1, SNS2 と興行収入に正の相関
- 原作ありの作品はやや高い興行収入の傾向
- 欠損値は3つの特徴量に存在（平均値で補完）
- 線形回帰で R² ≈ 0.79（訓練）、0.54（検証）

### Survived 生存予測モデルの訓練

```bash
# 訓練スクリプトを実行
cargo run --example survived_train
```

出力例:
```
=== Survived 生存予測モデルの訓練 ===

1. データ読み込み中...
   データ件数: 891 件
   特徴量数: 6 個
   訓練データ: 712 件
   検証データ: 179 件

2. モデル訓練中...
   訓練完了

3. モデル評価:
   訓練データ精度: 88.48%
   検証データ精度: 86.03%

4. サンプル予測:
   ✓ サンプル 1: 実際 = 生存  | 予測 = 生存
   ✓ サンプル 2: 実際 = 死亡  | 予測 = 死亡
   ...
```

**モデルの特徴**:
- **アルゴリズム**: Decision Tree（決定木）
- **特徴量**: Pclass（チケットクラス）、Sex（性別）、Age（年齢）、SibSp（兄弟姉妹・配偶者の数）、Parch（親子の数）、Fare（運賃）
- **前処理**: 欠損値の平均値補完、Sex のエンコーディング（male=1.0, female=0.0）
- **精度**: 訓練データ 88.48%、検証データ 86.03%

### Survived K-Fold 交差検証

```bash
# 交差検証スクリプトを実行
cargo run --example survived_validate
```

出力例:
```
=== Survived 生存予測モデルの K-Fold 交差検証 ===

1. データ読み込み中...
   データ件数: 891 件

2. 5-Fold 交差検証実行中...
   Fold 1: 精度 = 78.09% (訓練: 713 件, テスト: 178 件)
   Fold 2: 精度 = 81.46% (訓練: 713 件, テスト: 178 件)
   Fold 3: 精度 = 80.34% (訓練: 713 件, テスト: 178 件)
   Fold 4: 精度 = 75.28% (訓練: 713 件, テスト: 178 件)
   Fold 5: 精度 = 83.80% (訓練: 712 件, テスト: 179 件)

3. 結果:
   平均精度: 79.79% (± 2.91%)
   最高精度: 83.80%
   最低精度: 75.28%
```

**交差検証の利点**:
- 単一の train/test split より信頼性が高い評価
- モデルの安定性を測定（標準偏差で確認）
- データセット全体を有効活用
- 過学習の検出に有効

### Survived データ探索（Jupyter Notebook）

```bash
# Jupyter Notebook を起動
jupyter notebook notebooks/survived_exploration.ipynb
```

このノートブックには以下が含まれています：
- データの基本統計と欠損値の確認
- 生存率の分析（全体、性別別、客室クラス別）
- 年齢分布と生存の関係
- 運賃と生存の関係
- 家族サイズと生存の関係
- 相関行列による特徴量分析
- Decision Tree モデルの予測性能の考察

**主な発見**:
- 性別が最も強い予測因子（女性の生存率 74%、男性 19%）
- 客室クラスも生存率に大きく影響（1等 63%、3等 24%）
- 家族サイズ 2-4 人で生存率が高い
- 欠損値は Age 列に約 20% 存在
- Decision Tree で平均精度 約 80%

### Boston 住宅価格予測モデルの訓練

```bash
# 訓練スクリプトを実行
cargo run --example boston_train
```

出力例:
```
=== Boston 住宅価格予測モデルの訓練 ===

1. データ読み込み中...
   データ件数: 100 件
   特徴量数: 5 個
   訓練データ: 80 件
   検証データ: 20 件

2. モデル訓練中...
   訓練完了

3. モデル評価:
   訓練データ:
     R² スコア: 0.7668
     MAE: 2.97
     RMSE: 4.47

   検証データ:
     R² スコア: 0.7563
     MAE: 3.42
     RMSE: 5.17

4. サンプル予測:
   ✓ サンプル 1: 実際 = 23.2 千ドル | 予測 = 25.1 千ドル | 誤差 = 1.9 千ドル
   ✓ サンプル 2: 実際 = 21.4 千ドル | 予測 = 19.1 千ドル | 誤差 = 2.3 千ドル
   ...
```

**評価指標の意味:**
- **R² スコア**: 決定係数（1.0 に近いほど良い、0.76 は約 76% の予測精度）
- **MAE**: 平均絶対誤差（約 3 千ドルの予測誤差）
- **RMSE**: 二乗平均平方根誤差（MAE より外れ値に敏感）

### Boston K-Fold 交差検証

```bash
# 交差検証スクリプトを実行
cargo run --example boston_validate
```

出力例:
```
=== Boston 住宅価格予測モデルの K-Fold 交差検証 ===

1. データ読み込み中...
   データ件数: 100 件

2. 5-Fold 交差検証実行中...
   Fold 1: R² = 0.2260, MAE = 4.64, RMSE = 7.41 (訓練: 80 件, テスト: 20 件)
   Fold 2: R² = 0.8206, MAE = 3.18, RMSE = 4.18 (訓練: 80 件, テスト: 20 件)
   Fold 3: R² = 0.9119, MAE = 2.10, RMSE = 2.52 (訓練: 80 件, テスト: 20 件)
   Fold 4: R² = 0.4099, MAE = 4.35, RMSE = 7.73 (訓練: 80 件, テスト: 20 件)
   Fold 5: R² = 0.7563, MAE = 3.42, RMSE = 5.17 (訓練: 80 件, テスト: 20 件)

3. 結果:

   R² スコア:
     平均: 0.6249 (± 0.2620)
     最高: 0.9119
     最低: 0.2260

   MAE (平均絶対誤差):
     平均: 3.54 千ドル (± 0.90)
     最良: 2.10 千ドル
     最悪: 4.64 千ドル

   RMSE (二乗平均平方根誤差):
     平均: 5.40 千ドル (± 1.97)
     最良: 2.52 千ドル
     最悪: 7.73 千ドル
```

**交差検証の利点:**
- 単一の train/test split より信頼性が高い評価
- モデルの安定性を測定（標準偏差で確認）
- データセット全体を有効活用
- 過学習の検出に有効

**モデルの特徴**:
- **アルゴリズム**: Linear Regression（線形回帰）
- **特徴量**: RM（部屋数）、LSTAT（低所得者の割合）、PTRATIO（生徒-教師比率）、CRIME（犯罪率カテゴリ）
- **特徴量エンジニアリング**: 2乗項（RM²）、交互作用項（RM*LSTAT）
- **前処理**: 欠損値の平均値補完、CRIME のダミー変数化、標準化（Z-score normalization）
- **精度**: 訓練データ R² 0.77、検証データ R² 0.76

### Boston データ探索（Jupyter Notebook）

```bash
# Jupyter Notebook を起動
jupyter notebook notebooks/boston_exploration.ipynb
```

このノートブックには以下が含まれています：
- データの基本統計と欠損値の確認
- 価格分布の分析
- CRIME カテゴリごとの価格比較
- 各特徴量の分布（ヒストグラム）
- 相関行列と価格との関係性
- 散布図による可視化（価格 vs 各特徴量）
- 線形回帰モデルの予測性能の考察

**主な発見**:
- RM（部屋数）が最も強い正の予測因子
- LSTAT（低所得者割合）が強い負の予測因子
- 犯罪率が低いエリアほど住宅価格が高い
- 欠損値はなし
- 線形回帰で R² ≈ 0.76（訓練・検証とも）

## Web API サーバーの起動（Chapter 8）

### サーバー起動

#### 方法1: 起動スクリプトを使用（推奨）

```bash
# Windows の場合
start_api_server.bat

# Linux/macOS の場合
chmod +x start_api_server.sh
./start_api_server.sh
```

起動スクリプトは以下を自動で行います：
- 必要なデータファイルの存在確認
- ログレベルの設定（RUST_LOG 環境変数）
- API サーバーの起動

#### 方法2: cargo コマンドを直接使用

```bash
# ログを表示するために環境変数を設定
# Windows (PowerShell)
$env:RUST_LOG="ml_tdd_rust=info,tower_http=debug"

# Windows (CMD)
set RUST_LOG=ml_tdd_rust=info,tower_http=debug

# Linux/macOS
export RUST_LOG=ml_tdd_rust=info,tower_http=debug

# API サーバーをビルドして起動
cargo run --bin ml-api-server
```

サーバーが起動すると、以下のように表示されます：

```
Machine Learning API サーバー起動: http://127.0.0.1:3000
Swagger UI: http://127.0.0.1:3000/swagger-ui
OpenAPI Spec: http://127.0.0.1:3000/api-docs/openapi.json
ヘルスチェック: http://127.0.0.1:3000/health
Iris 分類: POST http://127.0.0.1:3000/predict/iris
Cinema 予測: POST http://127.0.0.1:3000/predict/cinema
Survived 予測: POST http://127.0.0.1:3000/predict/survived
Boston 予測: POST http://127.0.0.1:3000/predict/boston
```

サーバーが起動すると、以下のエンドポイントが `http://127.0.0.1:3000` で利用可能になります。

### Swagger UI でのドキュメント確認

サーバー起動後、ブラウザで以下の URL にアクセスすると、インタラクティブな API ドキュメントを確認できます：

```
http://127.0.0.1:3000/swagger-ui
```

Swagger UI では以下のことが可能です：
- すべての API エンドポイントの一覧表示
- 各エンドポイントの詳細（パラメータ、レスポンス）確認
- ブラウザから直接 API をテスト実行
- リクエスト/レスポンスのスキーマ確認
- curl コマンドの自動生成

**OpenAPI 仕様 JSON**:
- `http://127.0.0.1:3000/api-docs/openapi.json`

### API エンドポイント

#### ヘルスチェック

```bash
curl http://127.0.0.1:3000/health
```

レスポンス例:
```json
{
  "status": "OK",
  "version": "0.1.0",
  "models": ["iris", "cinema", "survived", "boston"]
}
```

#### Iris 分類予測

```bash
curl -X POST http://127.0.0.1:3000/predict/iris \
  -H "Content-Type: application/json" \
  -d '{
    "sepal_length": 5.1,
    "sepal_width": 3.5,
    "petal_length": 1.4,
    "petal_width": 0.2
  }'
```

レスポンス例:
```json
{
  "species": "setosa",
  "confidence": 0.95
}
```

#### Cinema 興行収入予測

```bash
curl -X POST http://127.0.0.1:3000/predict/cinema \
  -H "Content-Type: application/json" \
  -d '{
    "sns1": 50,
    "sns2": 30,
    "actor": 70,
    "original": 1
  }'
```

レスポンス例:
```json
{
  "revenue": 1234.56,
  "unit": "百万円"
}
```

#### Survived 生存予測

```bash
curl -X POST http://127.0.0.1:3000/predict/survived \
  -H "Content-Type: application/json" \
  -d '{
    "pclass": 1,
    "sex": "female",
    "age": 29.0,
    "sibsp": 0,
    "parch": 0,
    "fare": 211.3375
  }'
```

レスポンス例:
```json
{
  "survived": true,
  "probability": 0.75
}
```

#### Boston 住宅価格予測

```bash
curl -X POST http://127.0.0.1:3000/predict/boston \
  -H "Content-Type: application/json" \
  -d '{
    "rm": 6.575,
    "lstat": 4.98,
    "ptratio": 15.3,
    "crime": "low"
  }'
```

レスポンス例:
```json
{
  "price": 28.5,
  "unit": "千ドル"
}
```

**crime パラメータの値**:
- `"very_low"`: 犯罪率が非常に低い
- `"low"`: 犯罪率が低い
- `"high"`: 犯罪率が高い

### エラーレスポンス

バリデーションエラーの例:
```json
{
  "error": "ValidationError",
  "message": "sepal_length: Validation error: range [{\"min\": 0.0, \"max\": 10.0}]"
}
```

### API の特徴

- **フレームワーク**: Axum 0.7（高速・型安全な Web フレームワーク）
- **API ドキュメント**: OpenAPI 3.0 / Swagger UI による自動生成ドキュメント
- **バリデーション**: validator クレートによるリクエストバリデーション
- **CORS**: すべてのオリジンからのアクセスを許可（開発環境）
- **エラーハンドリング**: HTTP ステータスコードと JSON エラーレスポンス
- **ロギング**: tracing クレートによる構造化ログ
- **非同期**: Tokio ランタイムによる非同期処理

### 統合テスト

API の統合テストを実行:

```bash
# 統合テストのみ実行
cargo test --test api_test

# すべてのテスト（ユニットテスト + 統合テスト）を実行
cargo test
```

## トラブルシューティング

### サーバーが起動しない / ブラウザでアクセスできない

#### 1. ログが表示されない

**問題**: サーバーを起動しても何も表示されない

**解決方法**: 環境変数 `RUST_LOG` を設定してください

```bash
# Windows (PowerShell)
$env:RUST_LOG="ml_tdd_rust=info,tower_http=debug"
cargo run --bin ml-api-server

# Windows (CMD)
set RUST_LOG=ml_tdd_rust=info,tower_http=debug
cargo run --bin ml-api-server

# または起動スクリプトを使用
start_api_server.bat
```

#### 2. データファイルが見つからない

**問題**: `No such file or directory` エラーが出る

**解決方法**: カレントディレクトリを確認してください

```bash
# 正しいディレクトリにいることを確認
pwd  # または Windows では cd

# app/rust ディレクトリに移動
cd app/rust

# data ディレクトリの存在を確認
ls data/  # または Windows では dir data
```

#### 3. Swagger UI にアクセスできない

**問題**: ブラウザで http://127.0.0.1:3000/swagger-ui にアクセスできない

**解決方法**:

1. **サーバーが起動しているか確認**

```bash
# 別のターミナルで実行
curl http://127.0.0.1:3000/health

# 以下のレスポンスが返ってくれば OK
# {"status":"OK","version":"0.1.0","models":["iris","cinema","survived","boston"]}
```

2. **正しい URL にアクセスしているか確認**

- ✅ 正しい: `http://127.0.0.1:3000/swagger-ui`
- ✅ 正しい: `http://localhost:3000/swagger-ui`
- ❌ 間違い: `https://` (http を使用)
- ❌ 間違い: ポート番号なし

3. **ブラウザのキャッシュをクリア**

- ブラウザの再読み込み: `Ctrl+F5` (Windows) または `Cmd+Shift+R` (Mac)
- プライベートモード / シークレットモードで開く

4. **ファイアウォールの確認 (Windows)**

```powershell
# PowerShell を管理者権限で実行
# ファイアウォールルールを確認
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*ml-api-server*"}

# 必要に応じて例外を追加
New-NetFirewallRule -DisplayName "ML API Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
```

#### 4. ポート 3000 が既に使用されている

**問題**: `Address already in use` エラー

**解決方法**: ポートを使用しているプロセスを確認して終了

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <プロセスID> /F

# Linux/macOS
lsof -i :3000
kill <プロセスID>
```

または、別のポートを使用するように `src/main.rs` を編集:

```rust
// 3000 を別のポート（例: 8080）に変更
let addr = SocketAddr::from(([127, 0, 0, 1], 8080));
```

#### 5. API が応答しない

**問題**: Swagger UI は開けるが、API の実行がタイムアウトする

**考えられる原因**:
- データファイルが大きすぎる
- モデルの訓練に時間がかかっている（毎回訓練している簡易実装のため）

**解決方法**:
- ブラウザのコンソール（F12）でエラーメッセージを確認
- サーバーのログで詳細を確認
- タイムアウト設定を増やす

### デバッグ方法

詳細なログを表示するには:

```bash
# より詳細なログレベルに設定
export RUST_LOG=debug  # または Windows: set RUST_LOG=debug
cargo run --bin ml-api-server
```

特定のモジュールのみログを表示:

```bash
export RUST_LOG=ml_tdd_rust=trace,axum=debug,tower_http=debug
cargo run --bin ml-api-server
```

## 学習の進め方

各章を順番に進めることをおすすめします：

1. **Chapter 1**: 機械学習とは
2. **Chapter 2**: 開発環境のセットアップ（本章）
3. **Chapter 3**: CSV データの読み込み
4. **Chapter 4**: Iris 分類器の実装（基礎）
5. **Chapter 5**: Cinema 予測器の実装（基礎）
6. **Chapter 6**: Survived 予測器の実装（実践）
7. **Chapter 7**: Boston 予測器の実装（高度）
8. **Chapter 8**: Web API の構築

## ライセンス

このプロジェクトは学習目的で作成されています。
