# ぷよぷよ Go/Ebiten版

## 概要

Go と Ebiten を使用したぷよぷよゲームの実装です。TDD（テスト駆動開発）手法に従って開発されています。

### 目的

- Go による構造化プログラミングの実践
- Ebiten を使用した 2D ゲーム開発
- TDD によるゲーム開発の学習

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Go           | 1.24.1以上 | Go コンパイラ |
| Task         | 最新版     | タスクランナー（オプション） |
| Ebiten       | 2.8.9      | 2D ゲームエンジン |

## 構成

- [Quick Start](#quick-start)
- [構築](#構築)
- [配置](#配置)
- [開発](#開発)
- [テスト](#テスト)

## 詳細

### Quick Start

```bash
# ゲームの起動
go run cmd/puyo/main.go

# または Task を使用
task run
```

### 構築

#### 初回セットアップ

```bash
# 依存関係のダウンロード
go mod download

# （オプション）Task のインストール
go install github.com/go-task/task/v3/cmd/task@latest
```

#### プロジェクト構造

```
app/go/
├── cmd/
│   └── puyo/
│       └── main.go           # エントリーポイント
├── internal/                  # 内部パッケージ
│   ├── board/                # ボードロジック
│   │   ├── board.go
│   │   └── board_test.go
│   ├── game/                 # ゲームロジック
│   │   ├── game.go
│   │   └── game_test.go
│   ├── pair/                 # ぷよペアロジック
│   │   ├── pair.go
│   │   └── pair_test.go
│   ├── puyo/                 # ぷよ定義
│   │   ├── puyo.go
│   │   └── puyo_test.go
│   └── score/                # スコア計算
│       ├── score.go
│       └── score_test.go
├── go.mod                     # Go モジュール定義
├── go.sum                     # 依存関係チェックサム
├── Taskfile.yml              # Task 設定
└── README.md                 # このファイル
```

**[⬆ back to top](#構成)**

### 配置

#### 開発環境

```bash
# 開発サーバーの起動
go run cmd/puyo/main.go

# または Task を使用
task run
```

ゲームウィンドウが起動します（480x720px）。

#### 本番ビルド

```bash
# バイナリのビルド
go build -o puyo-puyo-go cmd/puyo/main.go

# または Task を使用
task build

# ビルドしたバイナリの実行
./puyo-puyo-go
```

**[⬆ back to top](#構成)**

### 開発

#### 利用可能なコマンド

```bash
# ゲームの起動
go run cmd/puyo/main.go
task run

# ビルド
go build -o puyo-puyo-go cmd/puyo/main.go
task build

# テストの実行
go test -v ./...
task test

# テストカバレッジ
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
task test-cover

# コードフォーマット
gofmt -s -w .
goimports -w .
task fmt

# リント
golangci-lint run
task lint

# すべてのチェック（フォーマット + リント + テスト）
task check

# ビルド成果物の削除
task clean
```

#### ゲームの操作方法

- **←→キー**: ぷよペアを左右に移動
- **↑キー/Zキー**: ぷよペアを右回転
- **↓キー**: 高速落下
- **Rキー**: ゲームオーバー後にリスタート

#### 実装済み機能

- ✅ ステージの表示（6列×12行）
- ✅ ぷよペアの生成と操作
- ✅ ぷよの回転（壁キック対応）
- ✅ 自由落下と着地
- ✅ 重力処理
- ✅ ぷよの消去（4つ以上の同色つながり）
- ✅ 連鎖反応
- ✅ スコア計算（連鎖ボーナス）
- ✅ 全消しボーナス（5000点）
- ✅ ゲームオーバー判定
- ✅ リスタート機能

#### 開発の進め方

このプロジェクトは TDD（テスト駆動開発）で開発されています：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限の実装
3. **Refactor**: コードを改善

テストは testing パッケージと testify を使用しています。

**[⬆ back to top](#構成)**

### テスト

#### テストの実行

```bash
# すべてのテストを実行
go test -v ./...
task test

# カバレッジレポート生成
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html
task test-cover
```

#### テストカバレッジ

現在のテスト数：**58テスト**

- ボード機能：12テスト
- ゲーム機能：6テスト
- ぷよペア機能：27テスト
- ぷよ定義：5テスト
- スコア機能：8テスト

すべてのテストがパスしています ✅

**[⬆ back to top](#構成)**

## 技術スタック

### ゲームエンジン

- **Go 1.24.1**: プログラミング言語
- **Ebiten 2.8.9**: 2D ゲームライブラリ

### テスト

- **testing**: Go 標準テストパッケージ
- **testify 1.11.1**: アサーションライブラリ

### 開発ツール

- **Task**: タスクランナー（Taskfile.yml）
- **gofmt**: Go コードフォーマッター
- **goimports**: インポート文整理ツール
- **golangci-lint**: Go リンター

## 参照

- [Ebiten 公式ドキュメント](https://ebitengine.org/)
- [Go 公式サイト](https://go.dev/)
- [Task 公式ドキュメント](https://taskfile.dev/)
- [ぷよぷよ TDD 入門チュートリアル](../../docs/reference/case-5/)
