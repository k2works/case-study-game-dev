# Puyo Puyo Game (Go/Ebiten版)

## 概要

Go と Ebiten を使用して実装した、完全機能のぷよぷよゲーム。TDD (Test-Driven Development) アプローチで開発され、高品質なコードベースと包括的なテストカバレッジを備えています。

### 目的

- Go プログラミング言語の学習
- TDD (Test-Driven Development) の実践
- ゲーム開発の基礎習得
- Ebiten フレームワークの活用

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- |:----------| :--- |
| Go           | 1.21+     | 最新の安定版を推奨 |
| Task         | 3.0+      | タスクランナー |
| golangci-lint| 最新      | 静的解析ツール |
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

- **総テスト数**: 58個
- **テスト成功率**: 100%
- **Linter警告**: 0件
- **コード行数**: 745行（本体）+ 851行（テスト）
- **バイナリサイズ**: 8.2MB

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
# Goのインストール
# https://go.dev/dl/ からダウンロード

# Taskのインストール
go install github.com/go-task/task/v3/cmd/task@latest

# golangci-lintのインストール（オプション）
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

**ゲームの実行**:
```bash
# プロジェクトディレクトリに移動
cd app/go

# 依存関係のインストール
go mod download

# 実行
task run
# または
go run ./cmd/puyo
```

**[⬆ back to top](#構成)**

### ビルド

#### 開発ビルド

```bash
task build
# または
go build -o puyo-puyo-go ./cmd/puyo
```

#### リリースビルド

```bash
# シンプルなリリースビルド
task build-release

# Taskで完全なリリース（全チェック込み）
task release
```

リリースバイナリは `puyo-puyo-go.exe` (Windows) または `puyo-puyo-go` (Linux/Mac) に生成されます。

**バイナリサイズ**: 約 8.2MB

**[⬆ back to top](#構成)**

### テスト

#### すべてのテスト実行

```bash
# 標準のgoコマンド
go test -v ./...

# Task
task test
```

#### カバレッジ付きテスト

```bash
task test-cover
```

カバレッジレポートは `coverage.html` に生成されます。

#### テスト結果

- Board: 4個のテストケース（複数サブテスト含む）
- Game: 10個のテストケース
- PuyoPair: 4個のテストケース
- Puyo: 1個のテストケース
- Score: 3個のテストケース
- **合計**: 58個のサブテスト (100%成功)

**[⬆ back to top](#構成)**

### 開発

#### 開発用タスク

```bash
# コードフォーマット
task fmt

# go vet静的解析
task vet

# golangci-lint静的解析
task lint

# 全チェック（format + lint + test）
task check

# モジュール整理
task mod-tidy
```

#### コーディング規約

- Goの標準スタイルガイドに準拠
- `gofmt` でフォーマット
- `golangci-lint` で静的解析
- テストカバレッジの維持

#### TDDサイクル

このプロジェクトは TDD (Test-Driven Development) で開発されています：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを実装
3. **Refactor**: コードを改善

**[⬆ back to top](#構成)**

### リリース

#### リリースプロセス

```bash
# Taskを使用した完全なリリース
task release
```

このコマンドは以下を実行します：

1. `task clean` - ビルドアーティファクトのクリーン
2. `task fmt` - コードフォーマット
3. `task vet` - go vet静的解析
4. `task lint` - golangci-lint静的解析
5. `task test` - 全テスト実行
6. `task build-release` - 最適化リリースビルド

#### その他のタスク

```bash
# ベンチマーク実行
task bench

# CI/CD用の検証
task ci
```

**[⬆ back to top](#構成)**

### プロジェクト構造

```
app/go/
├── Taskfile.yml            # タスク定義
├── .golangci.yml           # golangci-lint設定
├── go.mod                  # モジュール定義
├── go.sum                  # 依存関係ロック
├── README.md               # このファイル
├── cmd/
│   └── puyo/
│       └── main.go         # アプリケーションエントリポイント
└── internal/
    ├── board/
    │   ├── board.go        # ボードロジック
    │   └── board_test.go   # ボードテスト
    ├── game/
    │   ├── game.go         # ゲーム状態管理
    │   └── game_test.go    # ゲームテスト
    ├── pair/
    │   ├── pair.go         # ぷよペアロジック
    │   └── pair_test.go    # ペアテスト
    ├── puyo/
    │   ├── puyo.go         # ぷよ定義
    │   └── puyo_test.go    # ぷよテスト
    └── score/
        ├── score.go        # スコア管理
        └── score_test.go   # スコアテスト
```

**[⬆ back to top](#構成)**

### 設計

#### アーキテクチャ

- **パッケージ分離**: Board、Game、PuyoPair、Score の明確な責務分離
- **状態管理**: GameMode によるステートマシン
- **テスト戦略**: テーブル駆動テスト + サブテスト

#### 主要パッケージ

**internal/board**:
- ボードの状態管理
- ぷよの配置と取得
- 消去判定（4つ以上の連結検出）
- 重力処理
- 全消し判定

**internal/game**:
- ゲーム全体の状態管理
- ゲームモードの制御（Start, Playing, Checking, Falling, GameOver）
- 入力処理
- 描画処理

**internal/pair**:
- ぷよペアの状態管理
- 移動・回転ロジック
- 壁キック処理
- 衝突判定

**internal/score**:
- スコア計算
- 連鎖カウント管理
- 全消しボーナス

#### デザインパターン

- **State Pattern**: GameMode による状態遷移
- **単一責任の原則**: 各パッケージが明確な責務を持つ
- **Test-Driven Development**: すべての機能がテストファースト
- **Table-Driven Tests**: Goの慣用的なテスト手法

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

- [ぷよぷよから始めるテスト駆動開発入門 Go版](../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_Go版.md)
- [テスト駆動開発から始めるGo入門2](../../docs/reference/case-5/テスト駆動開発から始めるGo入門2.md)

### 技術スタック

- **言語**: Go 1.21+
- **ゲームフレームワーク**: [Ebiten](https://ebiten.org/) v2.6
- **ビルドツール**: [Task](https://taskfile.dev/) v3
- **静的解析**: [golangci-lint](https://golangci-lint.run/)

### 学習リソース

- [A Tour of Go](https://go.dev/tour/)
- [Effective Go](https://go.dev/doc/effective_go)
- [Ebiten Documentation](https://ebiten.org/)
- [Test-Driven Development](https://en.wikipedia.org/wiki/Test-driven_development)

## ライセンス

このプロジェクトは学習目的で作成されています。

## 貢献

バグ報告や機能提案は Issue でお願いします。

---

**Simple made easy.**
