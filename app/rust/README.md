# Puyo Puyo Game (Rust版)

## 概要

Rust と macroquad を使用して実装した、完全機能のぷよぷよゲーム。TDD (Test-Driven Development) アプローチで開発され、高品質なコードベースと包括的なテストカバレッジを備えています。

### 目的

- Rust プログラミング言語の学習
- TDD (Test-Driven Development) の実践
- ゲーム開発の基礎習得
- macroquad フレームワークの活用

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- |:----------| :--- |
| Rust         | 1.70+     | 最新の安定版を推奨 |
| Cargo        | 最新      | Rustに含まれる |
| cargo-make   | 0.37+     | タスクランナー（オプション） |
| Git          | 最新      | バージョン管理に必要 |

## 機能

### ゲーム機能

- ✅ ゲーム開始画面
- ✅ ぷよペアの生成と表示
- ✅ 左右移動（← → キー）
- ✅ 回転（↑ X Z キー、壁キック対応）
- ✅ 高速落下（↓ キー）
- ✅ 自動落下
- ✅ 着地判定
- ✅ ぷよ消去（4つ以上連結）
- ✅ 重力処理
- ✅ 連鎖システム
- ✅ スコア計算
- ✅ 連鎖ボーナス
- ✅ 全消しボーナス (5000点)
- ✅ ゲームオーバー判定
- ✅ リスタート機能（R キー）

### 品質指標

- **総テスト数**: 57個
  - ユニットテスト: 47個
  - 統合テスト: 10個
- **テスト成功率**: 100%
- **コンパイラ警告**: 0件
- **Clippy警告**: 0件
- **サイクロマティック複雑度**: 平均 4-5 (良好)
- **コード行数**: 1,430行

## 構成

- [Quick Start](#quick-start)
- [ビルド](#ビルド)
- [テスト](#テスト)
- [開発](#開発)
- [リリース](#リリース)
- [プロジェクト構造](#プロジェクト構造)
- [設計](#設計)

## 詳細

### Quick Start

**必要な環境**:
```bash
# Rustのインストール
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# cargo-makeのインストール（オプション）
cargo install cargo-make
```

**ゲームの実行**:
```bash
# プロジェクトディレクトリに移動
cd app/rust

# 実行
cargo run

# またはcargo-makeを使用
cargo make run
```

**[⬆ back to top](#構成)**

### ビルド

#### 開発ビルド

```bash
cargo build
```

#### リリースビルド

```bash
# シンプルなリリースビルド
cargo build --release

# cargo-makeで完全なリリース（全チェック込み）
cargo make release
```

リリースバイナリは `target/release/puyo_puyo_game.exe` (Windows) または `target/release/puyo_puyo_game` (Linux/Mac) に生成されます。

**バイナリサイズ**: 約 801KB

**[⬆ back to top](#構成)**

### テスト

#### すべてのテスト実行

```bash
# 標準のcargoコマンド
cargo test

# cargo-make
cargo make test
```

#### ユニットテストのみ

```bash
cargo test --lib
```

#### 統合テストのみ

```bash
cargo test --test integration_test
```

#### テスト結果

- ユニットテスト: 47個
  - Board: 17個
  - Game: 8個
  - PuyoPair: 22個
- 統合テスト: 10個
- **合計**: 57個 (100%成功)

**[⬆ back to top](#構成)**

### 開発

#### 開発用タスク

```bash
# コードフォーマット
cargo make format

# フォーマットチェック
cargo make format-check

# Clippy静的解析
cargo make lint

# 全チェック（format + lint + test）
cargo make check-all

# ファイル監視 + 自動テスト
cargo make watch
```

#### コーディング規約

- Rustの標準スタイルガイドに準拠
- `cargo fmt` でフォーマット
- `cargo clippy` で静的解析
- すべての警告をエラーとして扱う

#### TDDサイクル

このプロジェクトは TDD (Test-Driven Development) で開発されています：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを実装
3. **Refactor**: コードを改善

**[⬆ back to top](#構成)**

### リリース

#### リリースプロセス

```bash
# cargo-makeを使用した完全なリリース
cargo make release
```

このコマンドは以下を実行します：

1. `cargo clean` - ビルドキャッシュのクリーン
2. `cargo fmt -- --check` - フォーマットチェック
3. `cargo clippy -- -D warnings` - 静的解析
4. `cargo test` - 全テスト実行
5. `cargo build --release` - リリースビルド

#### その他のタスク

```bash
# ドキュメント生成
cargo make doc

# ベンチマーク実行
cargo make bench

# 依存関係の更新確認
cargo make outdated

# セキュリティ監査
cargo make audit

# CI/CD用の検証
cargo make ci
```

**[⬆ back to top](#構成)**

### プロジェクト構造

```
app/rust/
├── Cargo.toml              # プロジェクト設定と依存関係
├── Makefile.toml           # cargo-makeタスク定義
├── README.md               # このファイル
├── src/
│   ├── lib.rs              # ライブラリエントリポイント
│   ├── main.rs             # アプリケーションエントリポイント
│   ├── board.rs            # ボードロジック (424行)
│   ├── game.rs             # ゲーム状態管理 (508行)
│   ├── puyo_pair.rs        # ぷよペアロジック (454行)
│   └── puyo.rs             # ぷよ定義 (2行)
└── tests/
    └── integration_test.rs # 統合テスト (213行)
```

**[⬆ back to top](#構成)**

### 設計

#### アーキテクチャ

- **モジュール分離**: Board、Game、PuyoPair の明確な責務分離
- **状態管理**: State Pattern (GameMode enum)
- **テスト戦略**: ユニットテスト + 統合テスト

#### 主要モジュール

**Board** (`board.rs`):
- ボードの状態管理
- ぷよの配置と取得
- 消去判定（4つ以上の連結検出）
- 重力処理
- 全消し判定

**Game** (`game.rs`):
- ゲーム全体の状態管理
- ゲームモードの制御（Start, Playing, Checking, Falling, GameOver）
- スコア管理
- 連鎖カウント
- 入力処理

**PuyoPair** (`puyo_pair.rs`):
- ぷよペアの状態管理
- 移動・回転ロジック
- 壁キック処理
- 衝突判定

#### デザインパターン

- **State Pattern**: GameMode による状態遷移
- **単一責任の原則**: 各モジュールが明確な責務を持つ
- **Test-Driven Development**: すべての機能がテストファースト

**[⬆ back to top](#構成)**

## 操作方法

| キー | 動作 |
|------|------|
| Space | ゲーム開始 |
| ← | 左移動 |
| → | 右移動 |
| ↑ | 右回転 |
| ↓ | 高速落下 |
| Z | 左回転 |
| X | 右回転 |
| R | リスタート（ゲームオーバー時） |

## スコアシステム

- **基本スコア**: 消したぷよの数 × 10
- **連鎖ボーナス**: 2^(連鎖数-1)
- **全消しボーナス**: 5000点

### スコア計算式

```
スコア = 消したぷよの数 × 10 × 2^(連鎖数-1)
```

例：
- 1連鎖で4つ消去: 4 × 10 × 1 = 40点
- 2連鎖で4つ消去: 4 × 10 × 2 = 80点
- 3連鎖で5つ消去: 5 × 10 × 4 = 200点

## 参照

### ドキュメント

- [ぷよぷよから始めるテスト駆動開発入門 Rust版](../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_Rust版.md)

### 技術スタック

- **言語**: Rust 2021 Edition
- **ゲームフレームワーク**: [macroquad](https://github.com/not-fl3/macroquad) 0.4
- **乱数生成**: [rand](https://github.com/rust-random/rand) 0.9.2
- **ビルドツール**: [cargo-make](https://github.com/sagiegurari/cargo-make) 0.37+

### 学習リソース

- [The Rust Programming Language](https://doc.rust-lang.org/book/)
- [macroquad documentation](https://docs.rs/macroquad/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)

## ライセンス

このプロジェクトは学習目的で作成されています。

## 貢献

バグ報告や機能提案は Issue でお願いします。

---

**Simple made easy.**
