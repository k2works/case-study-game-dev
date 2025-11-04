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

```bash
# すべての品質チェックを実行
just all

# テスト実行
just test

# リンター実行
just lint

# コードフォーマット
just fmt

# リリースビルド
just build

# CI チェック（フォーマット、リンター、テスト）
just ci

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
