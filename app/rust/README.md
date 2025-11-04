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

- **Rust**: 1.70+
- **linfa**: 機械学習アルゴリズム（scikit-learn 相当）
- **ndarray**: 多次元配列（NumPy 相当）
- **polars**: DataFrame 処理（pandas 相当）
- **axum**: Web API フレームワーク
- **tokio**: 非同期ランタイム

## セットアップ

### 前提条件

- Rust 1.70 以上がインストールされていること

### インストール

```bash
# Rust のインストール（未インストールの場合）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# プロジェクトディレクトリに移動
cd app/rust

# 依存関係をダウンロード
cargo build

# テスト実行
cargo test
```

## 開発コマンド

```bash
# すべての品質チェックを実行
make all

# テスト実行
make test
cargo test

# リンター実行
make lint
cargo clippy

# コードフォーマット
make fmt
cargo fmt

# リリースビルド
make build
cargo build --release

# CI チェック（フォーマット、リンター、テスト）
make ci
```

## プロジェクト構造

```
app/rust/
├── Cargo.toml           # プロジェクト設定・依存関係
├── .cargo/
│   └── config.toml      # cargo 設定
├── rustfmt.toml         # フォーマッター設定
├── Makefile             # 開発タスク定義
├── src/
│   ├── lib.rs           # ライブラリルート
│   ├── main.rs          # API サーバーエントリポイント
│   ├── models/          # 機械学習モデル
│   ├── api/             # API 層（Chapter 8）
│   ├── utils/           # ユーティリティ
│   └── error.rs         # エラー型定義
├── tests/               # 統合テスト
├── data/                # データセット
└── README.md            # このファイル
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
