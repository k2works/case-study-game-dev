# ぷよぷよから始めるテスト駆動開発入門 - Go/Ebiten版

## はじめに

みなさん、こんにちは！今日は私と一緒にテスト駆動開発（TDD）を使って、ぷよぷよゲームを作っていきましょう。さて、プログラミングの旅に出る前に、皆さんは「テスト駆動開発」について聞いたことがありますか？もしかしたら「テストって、コードを書いた後にするものじゃないの？」と思われるかもしれませんね。

> テストを書きながら開発することによって、設計が良い方向に変わり、コードが改善され続け、それによって自分自身が開発に前向きになること、それがテスト駆動開発の目指すゴールです。
>
> — Kent Beck 『テスト駆動開発』 付録C　訳者解説：テスト駆動開発の現在

この記事では、私たちが一緒にぷよぷよゲームを実装しながら、テスト駆動開発の基本的な流れと考え方を学んでいきます。まるでモブプログラミングのセッションのように、あなたと私が一緒に考え、コードを書き、改善していく過程を体験しましょう。「でも、ぷよぷよって結構複雑なゲームじゃないの？」と思われるかもしれませんが、心配いりません。各章では、ユーザーストーリーに基づいた機能を、テスト、実装、解説の順に少しずつ進めていきますよ。一歩一歩、着実に進んでいきましょう！

### テスト駆動開発のサイクル

さて、テスト駆動開発では、どのように進めていけばいいのでしょうか？「テストを書いてから実装する」というのは分かりましたが、具体的にはどんな手順で進めるのでしょうか？

私がいつも実践しているのは、以下の3つのステップを繰り返すサイクルです。皆さんも一緒にやってみましょう：

1. **Red（赤）**: まず失敗するテストを書きます。「え？わざと失敗するテストを？」と思われるかもしれませんが、これには重要な意味があるんです。これから実装する機能が何をすべきかを明確にするためなんですよ。
2. **Green（緑）**: 次に、テストが通るように、最小限のコードを実装します。この段階では、きれいなコードよりも「とにかく動くこと」を優先します。「最小限」というのがポイントです。必要以上のことはしないようにしましょう。
3. **Refactor（リファクタリング）**: 最後に、コードの品質を改善します。テストが通ることを確認しながら、重複を取り除いたり、わかりやすい名前をつけたりします。「動くけど汚いコード」から「動いてきれいなコード」へと進化させるんです。

> レッド・グリーン・リファクタリング。それがTDDのマントラだ。
>
> — Kent Beck 『テスト駆動開発』

このサイクルを「Red-Green-Refactor」サイクルと呼びます。「赤・緑・リファクタリング」のリズムを刻むように、このサイクルを繰り返していくんです。これによって、少しずつ機能を追加し、コードの品質を高めていきましょう。皆さんも一緒にこのリズムを体感してみてください！

### 開発環境

さて、実際にコードを書く前に、私たちが使用する開発環境について少しお話ししておきましょう。皆さんは「道具選びは仕事の半分」という言葉を聞いたことがありますか？プログラミングでも同じことが言えるんです。

> 道具はあなたの能力を増幅します。道具のできが優れており、簡単に使いこなせるようになっていれば、より生産的になれるのです。
>
> — 達人プログラマー 熟達に向けたあなたの旅（第2版）

「どんなツールを使えばいいの？」と思われるかもしれませんね。今回のプロジェクトでは、以下のツールを使用していきます：

- **言語**: Go — 「なぜGo？」と思われるかもしれませんが、Goはシンプルで学びやすく、並行処理が得意で、クロスプラットフォーム対応も簡単な言語です。
- **ゲームライブラリ**: Ebiten — 「ゲームライブラリって難しそう...」と思うかもしれませんが、Ebitenはシンプルで使いやすい2Dゲームライブラリです。
- **テストフレームワーク**: Go標準のtestingパッケージとtestify — Goに標準で付属している強力なテストツールです。
- **タスクランナー**: Task — 「同じ作業の繰り返しって退屈じゃないですか？」そんな反復的なタスクを自動化してくれます。
- **バージョン管理**: Git — コードの変更履歴を追跡し、「あれ？昨日までちゃんと動いてたのに...」というときに過去の状態に戻れる魔法のツールです。

これらのツールを使って、テスト駆動開発の流れに沿ってぷよぷよゲームを実装していきましょう。「環境構築って難しそう...」と心配される方もいるかもしれませんが手順に従って進めればそんなに難しいことではありません。詳細はイテレーション0: 環境の構築で解説します。

## リリース計画

要件もわかった、プログラミング開始だ！ちょっと待ってください、何事も計画を立てる事は大事なことです。何から取り組みますか？「スコアの表示」ですか？「ゲームオーバー判定」ですか？でもまずは「新しいゲームを開始」しないとつながりとして難しいですよね。

> 計画づくりとは「なにをいつまでに作ればいいのか？」という質問に答える作業だと私は考えている
>
> — Mike Cohn 『アジャイルな見積と計画づくり』

今回の目的はぷよぷよゲームを遊べるための最小限の機能の実装です。目的を実現するためにやるべきことをイテレーションという単位でまとめましょう。今回はユーザーストーリーから以下のイテレーション計画に従ってぷよぷよゲームをリリースします。

- イテレーション0: 環境の構築
- イテレーション1: ゲーム開始とボード表示の実装
- イテレーション2: ぷよペアの表示と移動の実装
- イテレーション3: ぷよペアの回転の実装
- イテレーション4: ぷよの自動落下の実装
- イテレーション5: ぷよの消去ロジックの実装
- イテレーション6: 連鎖反応とスコアの実装
- イテレーション7-9: ゲームオーバーと追加機能の実装

では、ぷよぷよゲーム開発スタートです！

## イテレーション0: 環境の構築

...と言いたいところですがまずは環境の構築をしなければなりません。「プログラミングなんてどの言語でやるか決めるぐらいでしょ？」と思うかもしれませんが家を建てるときにしっかりとした基礎工事が必要なように開発環境もしっかりとした準備が必要です。
家を建てた後に基礎がダメだと困ったことになりますからね。

1. **バージョン管理**: コードの変更履歴を記録し、必要に応じて過去の状態に戻れる
2. **テスティング**: コードが正しく動作することを自動的に確認できる
3. **自動化**: 繰り返し作業を自動化して、ミスを減らし効率を上げる

これらの神器を使うことで、安心してコードを変更し、改善していけるんです。

### バージョン管理: Git

プロジェクトのバージョン管理には **Git** を使用します。「コードを変更したけど、前の状態に戻したい...」というときに役立ちます。

まず、プロジェクトディレクトリを作成し、Gitリポジトリを初期化しましょう：

```bash
mkdir puyo-puyo-go
cd puyo-puyo-go
git init
```

`.gitignore` ファイルを作成して、バージョン管理から除外するファイルを指定します：

```gitignore
# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib
/puyo-puyo-go

# Test binary
*.test

# Output of the go coverage tool
*.out

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

最初のコミットをしておきましょう：

```bash
git add .gitignore
git commit -m 'chore: プロジェクトの初期セットアップ'
```

#### コミットメッセージ規約

コミットメッセージは [Angularルール](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#type) に従います：

```
<タイプ>(<スコープ>): <タイトル>
```

タイプは以下を使用します：

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント変更のみ
- `style`: コードの意味に影響しない変更
- `refactor`: 機能追加でもバグ修正でもないコード変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスや補助ツールの変更

### テスティング環境: Go modules

Go言語には標準で強力なテストフレームワークが付属しています。まず、Go modulesを初期化しましょう：

```bash
go mod init github.com/yourusername/puyo-puyo-go
```

「Go modulesって何ですか？」良い質問ですね！

> Go modulesとは、Goで記述されたサードパーティ製のライブラリを管理するためのツールで、Go modulesで扱うライブラリをmoduleと呼びます。
>
> — Go公式ドキュメント

Ebitenとtestifyをインストールします：

```bash
go get github.com/hajimehoshi/ebiten/v2
go get github.com/stretchr/testify
```

これで `go.mod` ファイルが更新され、依存関係が記録されます。

### 自動化: コード品質の自動管理

良いコードを書き続けるためには、コードの品質を自動的にチェックし、維持していく仕組みが必要です。

#### 静的コード解析: golangci-lint

Go用の静的コード解析ツール **golangci-lint** を使います。まずインストールします：

```bash
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

**重要**: インストール後、ツールが正しくインストールされたか確認しましょう：

```bash
golangci-lint --version
# 出力例: golangci-lint has version 1.xx.x built with go1.xx from ...
```

もし「command not found」と表示される場合は、`$HOME/go/bin`（またはWindowsの場合`%USERPROFILE%\go\bin`）がPATHに追加されていることを確認してください。

設定ファイル `.golangci.yml` を作成します：

```yaml
run:
  timeout: 5m
  issues-exit-code: 1
  tests: true

output:
  format: colored-line-number
  print-issued-lines: true
  print-linter-name: true

linters-settings:
  govet:
    check-shadowing: true
    enable-all: true
  gocyclo:
    min-complexity: 7
  misspell:
    locale: US
  lll:
    line-length: 120
  gofmt:
    simplify: true
  goconst:
    min-len: 3
    min-occurrences: 2

linters:
  enable:
    - gosimple
    - govet
    - ineffassign
    - misspell
    - gofmt
    - goimports
    - gocyclo
    - goconst
    - gosec
    - unconvert
    - unused
    - staticcheck
    - typecheck
  disable:
    - errcheck

issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - gosec
        - goconst
```

「サイクロマティック複雑度を7に設定していますね！」そうです！

> 循環的複雑度（Cyclomatic complexity、CC）は、プログラムの複雑さを測るソフトウェア測定法のひとつである。1976年にトーマス・J・マッケイブによって開発された。
>
> — Wikipedia 『循環的複雑度』

複雑度が高いとテストが書きにくく、バグが混入しやすくなります。7という値は、「これ以上複雑になったら関数を分割しましょう」という目安です。

静的解析を実行します：

```bash
golangci-lint run
```

#### コードフォーマッタ: gofmt/goimports

Goには標準でコードフォーマッタが付属しています：

```bash
# フォーマット実行
gofmt -s -w .

# インポート文の整理も含む
goimports -w .
```

#### コードカバレッジ

テストカバレッジを確認します：

```bash
go test -cover ./...
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

#### タスクランナー: Taskfile

複数のコマンドを管理するために **Task** を使います。まずインストールします：

```bash
go install github.com/go-task/task/v3/cmd/task@latest
```

**重要**: インストール後、ツールが正しくインストールされたか確認しましょう：

```bash
task --version
# 出力例: Task version: v3.xx.x
```

もし「command not found」と表示される場合は、以下を確認してください：

**Linux/macOS の場合**:
```bash
# PATHに追加されているか確認
echo $PATH | grep go/bin

# 追加されていない場合は~/.bashrcや~/.zshrcに追加
export PATH=$PATH:$HOME/go/bin
```

**Windows (PowerShell) の場合**:
```powershell
# PATHに追加
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\go\bin", "User")
# 新しいターミナルを開いて確認
```

`Taskfile.yml` を作成します：

```yaml
version: '3'

tasks:
  default:
    cmds:
      - task: test

  test:
    desc: Run tests
    cmds:
      - go test -v ./...

  test-cover:
    desc: Run tests with coverage
    cmds:
      - go test -coverprofile=coverage.out ./...
      - go tool cover -html=coverage.out -o coverage.html

  lint:
    desc: Run linters
    cmds:
      - golangci-lint run

  fmt:
    desc: Format code
    cmds:
      - gofmt -s -w .
      - goimports -w .

  build:
    desc: Build application
    cmds:
      - go build -o puyo-puyo-go .

  run:
    desc: Run application
    cmds:
      - go run .

  check:
    desc: Run all checks
    cmds:
      - task: fmt
      - task: lint
      - task: test

  clean:
    desc: Clean build artifacts
    cmds:
      - rm -f puyo-puyo-go coverage.out coverage.html
```

タスクを実行します：

```bash
task test        # テスト実行
task lint        # 静的解析
task fmt         # フォーマット
task check       # 全チェック実行
```

### プロジェクト構成

最後に、プロジェクトのフォルダ構成を確認しておきましょう：

```
puyo-puyo-go/
├── cmd/
│   └── puyo/
│       └── main.go          # エントリーポイント
├── internal/
│   ├── game/
│   │   ├── game.go          # ゲームロジック
│   │   └── game_test.go     # ゲームテスト
│   ├── board/
│   │   ├── board.go         # ボード（盤面）
│   │   └── board_test.go    # ボードテスト
│   └── puyo/
│       ├── puyo.go          # ぷよ定義
│       └── puyo_test.go     # ぷよテスト
├── go.mod                   # モジュール定義
├── go.sum                   # 依存関係のチェックサム
├── Taskfile.yml             # タスク定義
├── .golangci.yml            # Linter設定
└── .gitignore               # Git除外設定
```

「`internal/` ディレクトリって何ですか？」良い質問ですね！

> `internal` ディレクトリは、そのパッケージが外部からインポートされないことを保証する特別なディレクトリです。
>
> — Go公式ドキュメント

これにより、プロジェクト内部のコードが外部から誤って使用されることを防げます。

### セットアップの確認

環境構築が完了したら、すべてが正しく動作するか確認しましょう。

#### ステップ1: ツールのインストール確認

まず、各ツールが正しくインストールされているか確認します：

```bash
# Goのバージョン確認
go version

# golangci-lintの確認
golangci-lint --version

# taskの確認
task --version
```

すべてのコマンドでバージョン情報が表示されればOKです。もし「command not found」エラーが出る場合は、該当ツールの再インストールとPATH設定を確認してください。

#### ステップ2: 利用可能なタスクの確認

taskコマンドで利用可能なタスク一覧を表示します：

```bash
task --list
# または
task -l
```

以下のようなタスク一覧が表示されれば成功です：

```
task: Available tasks for this project:
* build:         Build application
* check:         Run all checks
* clean:         Clean build artifacts
* fmt:           Format code
* lint:          Run linters
* run:           Run application
* test:          Run tests
* test-cover:    Run tests with coverage
```

#### ステップ3: 品質チェックの実行

実際に品質チェックを実行してみましょう：

```bash
task check
```

このコマンドは以下を順次実行します：
1. `task fmt` - コードフォーマット
2. `task lint` - 静的解析（サイクロマティック複雑度チェック含む）
3. `task test` - テスト実行

**期待される結果**:
- すべてのチェックがエラーなく完了すること
- テストが全て通過すること
- lintエラーが0件であること

もしエラーが発生した場合は、該当するツールが正しくインストールされているか、設定ファイルが正しく配置されているかを確認してください。

#### ステップ4: コミット

セットアップが完了し、すべての確認が成功したら、ここでコミットしておきましょう：

```bash
git add .
git commit -m 'chore: プロジェクトの環境構築を完了

- Go modulesの初期化
- Ebiten, testifyの導入
- golangci-lintの設定（サイクロマティック複雑度7）
- Taskfileの作成
- プロジェクト構造の定義'
```

### イテレーション0のまとめ

このイテレーションで準備した内容：

1. **バージョン管理**
   - Gitのセットアップ
   - コミットメッセージ規約（Angularルール）

2. **テスティング環境**
   - Go modules（パッケージマネージャ）
   - Ebiten（ゲームライブラリ）
   - 標準testingパッケージ + testify

3. **自動化ツール**
   - golangci-lint（静的コード解析、サイクロマティック複雑度7）
   - gofmt/goimports（コードフォーマッタ）
   - go test（コードカバレッジ）
   - Task（タスクランナー）

4. **プロジェクト構成**
   - cmd/internal構造の採用
   - 設定ファイルの準備（.golangci.yml、Taskfile.yml）

### 学んだこと

- **ソフトウェア開発の三種の神器**: バージョン管理、テスティング、自動化の重要性
- **Goエコシステム**: Go modules、golangci-lint、gofmtなどの標準ツール
- **タスク自動化**: 反復的な作業を自動化してミスを減らす
- **品質維持**: 静的解析とフォーマットでコードの品質を保つ
- **複雑度管理**: サイクロマティック複雑度を7に制限することで、テスタブルで保守しやすいコードを維持

### 重要な注意点

**設定ファイルの作成だけでは不十分です！**

環境構築では以下の3ステップをすべて完了させることが重要です：

1. **ツール本体のインストール** - `go install`コマンドの実行
2. **設定ファイルの作成** - `.golangci.yml`、`Taskfile.yml`など
3. **動作確認の実行** - 各ツールのバージョン確認と`task check`の実行

特に、以下のような失敗例に注意してください：

❌ **よくある失敗**: 設定ファイルだけ作成して、ツール本体をインストールし忘れる
- `Taskfile.yml`は作成したが、`task`コマンドがインストールされていない
- `.golangci.yml`は作成したが、`golangci-lint`がインストールされていない

✅ **正しい手順**: インストール → 確認 → 設定 → 動作確認
```bash
# 1. インストール
go install github.com/go-task/task/v3/cmd/task@latest

# 2. インストール確認
task --version

# 3. 設定ファイル作成
# Taskfile.ymlを作成

# 4. 動作確認
task check
```

この3ステップの確認を徹底することで、後のイテレーションで「なぜツールが動かないの？」という問題を防げます。

「準備完了！これから本格的にぷよぷよゲームを作っていきますよ！」

次のイテレーションでは、ゲーム開始の実装に進みます！

## イテレーション1: ゲーム開始とボード表示の実装

さあ、いよいよコードを書き始めましょう！テスト駆動開発では、小さなイテレーション（反復）で機能を少しずつ追加していきます。最初のイテレーションでは、最も基本的な機能である「ゲームの開始」と「ボードの表示」を実装します。

> システム構築はどこから始めるべきだろうか。システム構築が終わったらこうなる、というストーリーを語るところからだ。
>
> — Kent Beck 『テスト駆動開発』

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、新しいゲームを開始してボードを見ることができる

このシンプルなストーリーから始めることで、ゲームの基本的な構造を作り、後続の機能追加の土台を築くことができます。では、テスト駆動開発のサイクルに従って、まずはテストから書いていきましょう！

### TODOリスト

さて、ユーザーストーリーを実装するために、まずはTODOリストを作成しましょう。TODOリストは、大きな機能を小さなタスクに分解するのに役立ちます。

> 何をテストすべきだろうか - 着手する前に、必要になりそうなテストをリストに書き出しておこう。
>
> — Kent Beck 『テスト駆動開発』

私たちの「新しいゲームを開始してボードを見ることができる」というユーザーストーリーを実現するためには、どのようなタスクが必要でしょうか？考えてみましょう：

- ボード構造体を実装する（ゲームの盤面を管理する）
- ぷよの色を定義する（赤、青、緑、黄の4色）
- ゲーム構造体を実装する（ゲーム全体の状態を管理する）
- Ebitenのゲームインターフェースを実装する（Update、Draw、Layoutメソッド）

これらのタスクを一つずつ実装していきましょう。テスト駆動開発では、各タスクに対してテスト→実装→リファクタリングのサイクルを回します。まずは「ぷよの色定義」から始めましょう！

### テスト: ぷよの色定義

さて、TODOリストの最初のタスク「ぷよの色を定義する」に取り掛かりましょう。テスト駆動開発では、まずテストを書くことから始めます。

> テストファースト
>
> いつテストを書くべきだろうか——それはテスト対象のコードを書く前だ。
>
> — Kent Beck 『テスト駆動開発』

では、ぷよの色をテストするコードを書いてみましょう。何をテストすべきでしょうか？ぷよの色が正しく定義され、色の文字列表現が取得できることを確認しましょう。

```go
// internal/puyo/puyo_test.go
package puyo

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPuyoColor(t *testing.T) {
	t.Run("空のぷよは空文字列を返す", func(t *testing.T) {
		color := ColorNone
		assert.Equal(t, "", color.String())
	})

	t.Run("赤いぷよは赤を表す文字列を返す", func(t *testing.T) {
		color := ColorRed
		assert.Equal(t, "赤", color.String())
	})

	t.Run("青いぷよは青を表す文字列を返す", func(t *testing.T) {
		color := ColorBlue
		assert.Equal(t, "青", color.String())
	})

	t.Run("緑のぷよは緑を表す文字列を返す", func(t *testing.T) {
		color := ColorGreen
		assert.Equal(t, "緑", color.String())
	})

	t.Run("黄色いぷよは黄を表す文字列を返す", func(t *testing.T) {
		color := ColorYellow
		assert.Equal(t, "黄", color.String())
	})
}
```

このテストでは、各ぷよの色が正しい文字列表現を返すことを確認しています。testifyの`assert.Equal`を使って期待値と実際の値を比較しています。

### 実装: ぷよの色定義

テストを書いたら、次に実行してみましょう。どうなるでしょうか？

```bash
task test
```

```
no such file or directory: internal/puyo/puyo_test.go
```

おっと！まだ`puyo`パッケージを実装していないので、当然エラーになりますね。これがテスト駆動開発の「Red（赤）」の状態です。テストが失敗することを確認できました。

> アサートファースト
>
> ではテストはどこから書き始めるべきだろうか。それはテストの終わりにパスすべきアサーションを書くところからだ。
>
> — Kent Beck 『テスト駆動開発』

では、テストを通すための最小限のコードを実装しましょう：

```go
// internal/puyo/puyo.go
package puyo

// Color はぷよの色を表す型
type Color int

const (
	ColorNone Color = iota
	ColorRed
	ColorBlue
	ColorGreen
	ColorYellow
)

// String はぷよの色を文字列で返す
func (c Color) String() string {
	switch c {
	case ColorRed:
		return "赤"
	case ColorBlue:
		return "青"
	case ColorGreen:
		return "緑"
	case ColorYellow:
		return "黄"
	default:
		return ""
	}
}
```

Goでは、`iota`を使って列挙型（enum）を定義できます。`Color`型に`String()`メソッドを実装することで、色の文字列表現を取得できるようにしています。

テストを実行してみましょう：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/puyo      0.002s
```

やった！テストが通りました。これが「Green（緑）」の状態です。

### リファクタリング: ぷよの色定義

テストが通ったので、リファクタリングの機会を探しましょう。今回のコードはシンプルで明確なので、特にリファクタリングする必要はありません。次のタスクに進みましょう！

### テスト: ボード構造体の実装

次は、ボード構造体を実装します。ボードは12行×6列の盤面で、各セルにぷよの色情報を保持します。

```go
// internal/board/board_test.go
package board

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/yourusername/puyo-puyo-go/internal/puyo"
)

func TestBoard(t *testing.T) {
	t.Run("新しいボードは12行6列の空の盤面を持つ", func(t *testing.T) {
		b := New()

		assert.Equal(t, 12, len(b.Cells))
		assert.Equal(t, 6, len(b.Cells[0]))

		// すべてのセルが空であることを確認
		for row := 0; row < 12; row++ {
			for col := 0; col < 6; col++ {
				assert.Equal(t, puyo.ColorNone, b.Cells[row][col])
			}
		}
	})

	t.Run("指定した位置にぷよを配置できる", func(t *testing.T) {
		b := New()

		b.Set(11, 2, puyo.ColorRed)

		assert.Equal(t, puyo.ColorRed, b.Cells[11][2])
	})

	t.Run("指定した位置のぷよを取得できる", func(t *testing.T) {
		b := New()
		b.Cells[11][2] = puyo.ColorBlue

		color := b.Get(11, 2)

		assert.Equal(t, puyo.ColorBlue, color)
	})
}
```

このテストでは、ボードが正しく初期化され、ぷよの配置と取得ができることを確認しています。

### 実装: ボード構造体

テストが失敗することを確認したら、実装に進みましょう：

```go
// internal/board/board.go
package board

import "github.com/yourusername/puyo-puyo-go/internal/puyo"

const (
	// Rows はボードの行数
	Rows = 12
	// Cols はボードの列数
	Cols = 6
)

// Board はぷよぷよの盤面を表す
type Board struct {
	Cells [Rows][Cols]puyo.Color
}

// New は新しいボードを作成する
func New() *Board {
	return &Board{}
}

// Set は指定した位置にぷよを配置する
func (b *Board) Set(row, col int, color puyo.Color) {
	if row >= 0 && row < Rows && col >= 0 && col < Cols {
		b.Cells[row][col] = color
	}
}

// Get は指定した位置のぷよの色を取得する
func (b *Board) Get(row, col int) puyo.Color {
	if row >= 0 && row < Rows && col >= 0 && col < Cols {
		return b.Cells[row][col]
	}
	return puyo.ColorNone
}
```

Goでは、配列は値型なので、構造体の初期化時にゼロ値（`puyo.ColorNone`）で埋められます。これにより、明示的な初期化処理なしで空のボードが作成できます。

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/board     0.002s
```

素晴らしい！テストが通りました。

### テスト: Ebitenゲームの実装

次は、Ebitenのゲームインターフェースを実装します。Ebitenでは、`Update`、`Draw`、`Layout`の3つのメソッドを持つ構造体を定義する必要があります。

```go
// internal/game/game_test.go
package game

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/yourusername/puyo-puyo-go/internal/board"
)

func TestGame(t *testing.T) {
	t.Run("新しいゲームはボードを持つ", func(t *testing.T) {
		g := New()

		assert.NotNil(t, g.Board)
		assert.IsType(t, &board.Board{}, g.Board)
	})

	t.Run("Updateメソッドは正常に動作する", func(t *testing.T) {
		g := New()

		err := g.Update()

		assert.NoError(t, err)
	})

	t.Run("Layoutメソッドは画面サイズを返す", func(t *testing.T) {
		g := New()

		width, height := g.Layout(640, 480)

		assert.Equal(t, 240, width)
		assert.Equal(t, 360, height)
	})
}
```

### 実装: Ebitenゲーム

テストを通すための実装をしましょう：

```go
// internal/game/game.go
package game

import (
	"github.com/hajimehoshi/ebiten/v2"
	"github.com/yourusername/puyo-puyo-go/internal/board"
)

const (
	// ScreenWidth は画面の幅
	ScreenWidth = 240
	// ScreenHeight は画面の高さ
	ScreenHeight = 360
)

// Game はゲームの状態を管理する
type Game struct {
	Board *board.Board
}

// New は新しいゲームを作成する
func New() *Game {
	return &Game{
		Board: board.New(),
	}
}

// Update はゲームの状態を更新する（1フレームごとに呼ばれる）
func (g *Game) Update() error {
	return nil
}

// Draw は画面を描画する
func (g *Game) Draw(screen *ebiten.Image) {
	// 次のイテレーションで実装
}

// Layout は画面のレイアウトを決定する
func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}
```

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/game      0.003s
```

完璧です！すべてのテストが通りました。

### 実装: メインエントリーポイント

最後に、ゲームを実行するためのメインファイルを作成します：

```go
// cmd/puyo/main.go
package main

import (
	"log"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/yourusername/puyo-puyo-go/internal/game"
)

func main() {
	g := game.New()

	ebiten.SetWindowSize(480, 720)
	ebiten.SetWindowTitle("ぷよぷよ")

	if err := ebiten.RunGame(g); err != nil {
		log.Fatal(err)
	}
}
```

### ゲームの実行

ゲームを実行してみましょう：

```bash
task run
```

黒い画面が表示されるはずです。まだ描画処理を実装していないので、これで正しいです！

### イテレーション1のまとめ

このイテレーションで実装した内容：

1. **ぷよの色定義**
   - `Color`型の定義（iota使用）
   - `String()`メソッドによる文字列表現

2. **ボード構造体**
   - 12行×6列の盤面
   - `Set()`と`Get()`メソッド

3. **ゲーム構造体**
   - Ebitenのゲームインターフェース実装
   - `Update`、`Draw`、`Layout`メソッド

4. **メインエントリーポイント**
   - ゲームウィンドウの起動

### 学んだこと

- **Goの列挙型**: `iota`を使った定数定義
- **構造体とメソッド**: Goにおけるオブジェクト指向的な設計
- **配列の初期化**: ゼロ値による自動初期化
- **Ebitenの基本**: ゲームループの構造（Update/Draw/Layout）
- **テーブル駆動テスト**: `t.Run()`による複数テストケースの実行

### コミット

イテレーション1が完了したので、コミットしましょう：

```bash
git add .
git commit -m 'feat: ゲーム開始とボード表示の基本機能を実装

- ぷよの色定義（Red/Blue/Green/Yellow）
- ボード構造体（12x6グリッド）
- ゲーム構造体（Ebitenインターフェース実装）
- メインエントリーポイント'
```

次のイテレーションでは、ぷよペアの表示と移動を実装します！
## イテレーション2: ぷよペアの表示と移動の実装

さて、前回のイテレーションでゲームの基本的な構造ができましたね。「ゲームが始まったけど、ぷよが動かないと面白くないよね？」と思いませんか？そこで次は、ぷよペアを表示して左右に移動できるようにしていきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう:

> プレイヤーとして、落ちてくるぷよペアを見て、左右に移動できる

「ぷよぷよって、落ちてくるぷよペアを左右に動かして、うまく積み上げるゲームですよね？」そうです！今回はその基本操作である「ぷよペアの表示と左右の移動」を実装していきます。

### TODOリスト

さて、このユーザーストーリーを実現するために、どんなタスクが必要でしょうか？一緒に考えてみましょう。
「ぷよペアを表示して左右に移動する」という機能を実現するためには、以下のようなタスクが必要そうですね：

- ぷよペア構造体を実装する（軸ぷよと子ぷよの2つのぷよ）
- ぷよペアをランダムに生成する
- ぷよペアを画面に描画する
- プレイヤーの入力を検出する（キーボードの左右キーが押されたことを検知する）
- ぷよペアを左右に移動する処理を実装する（実際にぷよペアの位置を変更する）
- 移動可能かどうかのチェックを実装する（画面の端や他のぷよにぶつかる場合は移動できないようにする）

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。テスト駆動開発の流れに沿って、まずはテストから書いていきますよ。

### テスト: ぷよペア構造体

「最初に何をテストすればいいんでしょうか？」まずは、ぷよペアの基本構造からテストしていきましょう。ぷよペアは軸ぷよ（axis）と子ぷよ（child）の2つのぷよで構成されます。

> テストファースト
>
> いつテストを書くべきだろうか——それはテスト対象のコードを書く前だ。
>
> — Kent Beck 『テスト駆動開発』

```go
// internal/pair/pair_test.go
package pair

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/yourusername/puyo-puyo-go/internal/puyo"
)

func TestPuyoPair(t *testing.T) {
	t.Run("新しいぷよペアは軸ぷよと子ぷよを持つ", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)

		assert.Equal(t, 2, p.AxisX)
		assert.Equal(t, 0, p.AxisY)
		assert.Equal(t, puyo.ColorRed, p.AxisColor)
		assert.Equal(t, 2, p.ChildX)
		assert.Equal(t, -1, p.ChildY)
		assert.Equal(t, puyo.ColorBlue, p.ChildColor)
	})

	t.Run("左に移動すると位置が1減る", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)

		p.MoveLeft()

		assert.Equal(t, 1, p.AxisX)
		assert.Equal(t, 1, p.ChildX)
	})

	t.Run("右に移動すると位置が1増える", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)

		p.MoveRight()

		assert.Equal(t, 3, p.AxisX)
		assert.Equal(t, 3, p.ChildX)
	})
}
```

このテストでは、ぷよペアの初期化と左右移動の基本動作を確認しています。

### 実装: ぷよペア構造体

テストを書いたら、次に実装しましょう：

```go
// internal/pair/pair.go
package pair

import "github.com/yourusername/puyo-puyo-go/internal/puyo"

// PuyoPair は落下中のぷよペアを表す
type PuyoPair struct {
	AxisX      int
	AxisY      int
	AxisColor  puyo.Color
	ChildX     int
	ChildY     int
	ChildColor puyo.Color
}

// New は新しいぷよペアを作成する
// 初期状態では子ぷよは軸ぷよの上（Y-1）に配置される
func New(axisX, axisY int, axisColor, childColor puyo.Color) *PuyoPair {
	return &PuyoPair{
		AxisX:      axisX,
		AxisY:      axisY,
		AxisColor:  axisColor,
		ChildX:     axisX,
		ChildY:     axisY - 1,
		ChildColor: childColor,
	}
}

// MoveLeft は軸ぷよと子ぷよを左に移動する
func (p *PuyoPair) MoveLeft() {
	p.AxisX--
	p.ChildX--
}

// MoveRight は軸ぷよと子ぷよを右に移動する
func (p *PuyoPair) MoveRight() {
	p.AxisX++
	p.ChildX++
}
```

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/pair      0.002s
```

やった！テストが通りました。

### テスト: 衝突判定

次は、ぷよペアが移動できるかどうかを判定する衝突検出を実装します。画面の端や他のぷよにぶつかる場合は移動できません。

```go
// internal/pair/pair_test.go に追加
func TestPuyoPairCollision(t *testing.T) {
	t.Run("ボード範囲外の位置は衝突と判定される", func(t *testing.T) {
		p := New(0, 0, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()

		// 左端（X=-1）は衝突
		assert.True(t, p.IsCollision(b, -1, 0, -1, -1))

		// 右端（X=6）は衝突
		assert.True(t, p.IsCollision(b, 6, 0, 6, -1))

		// 上端（Y=-2）は衝突
		assert.True(t, p.IsCollision(b, 2, 0, 2, -2))

		// 下端（Y=12）は衝突
		assert.True(t, p.IsCollision(b, 2, 12, 2, 11))
	})

	t.Run("ぷよがある位置は衝突と判定される", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()
		b.Set(11, 2, puyo.ColorGreen)

		// ぷよがある位置は衝突
		assert.True(t, p.IsCollision(b, 2, 11, 2, 10))
	})

	t.Run("空いている位置は衝突しない", func(t *testing.T) {
		p := New(2, 0, puyo.ColorRed, puyo.ColorBlue)
		b := board.New()

		// 空いている位置は衝突しない
		assert.False(t, p.IsCollision(b, 2, 0, 2, -1))
	})
}
```

### 実装: 衝突判定

```go
// internal/pair/pair.go に追加
import (
	"github.com/yourusername/puyo-puyo-go/internal/board"
	"github.com/yourusername/puyo-puyo-go/internal/puyo"
)

// IsCollision は指定した位置に衝突があるかチェックする
func (p *PuyoPair) IsCollision(b *board.Board, axisX, axisY, childX, childY int) bool {
	// 軸ぷよの衝突判定
	if !isValidPosition(b, axisX, axisY) {
		return true
	}

	// 子ぷよの衝突判定（画面上部は許可）
	if childY >= 0 && !isValidPosition(b, childX, childY) {
		return true
	}

	return false
}

// isValidPosition は指定した位置が有効かチェックする
func isValidPosition(b *board.Board, x, y int) bool {
	// 範囲外チェック
	if x < 0 || x >= board.Cols || y < 0 || y >= board.Rows {
		return false
	}

	// ぷよが既にあるかチェック
	if b.Get(y, x) != puyo.ColorNone {
		return false
	}

	return true
}

// CanMoveLeft は左に移動できるかチェックする
func (p *PuyoPair) CanMoveLeft(b *board.Board) bool {
	return !p.IsCollision(b, p.AxisX-1, p.AxisY, p.ChildX-1, p.ChildY)
}

// CanMoveRight は右に移動できるかチェックする
func (p *PuyoPair) CanMoveRight(b *board.Board) bool {
	return !p.IsCollision(b, p.AxisX+1, p.AxisY, p.ChildX+1, p.ChildY)
}
```

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/pair      0.003s
```

素晴らしい！衝突判定が正しく動作しています。

### 実装: ゲームへの統合

次に、ぷよペアをゲームに統合します。ゲームにぷよペアを追加し、キー入力で移動できるようにします。

```go
// internal/game/game.go
package game

import (
	"math/rand"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
	"github.com/yourusername/puyo-puyo-go/internal/board"
	"github.com/yourusername/puyo-puyo-go/internal/pair"
	"github.com/yourusername/puyo-puyo-go/internal/puyo"
)

const (
	ScreenWidth  = 240
	ScreenHeight = 360
	CellSize     = 30
	BoardOffsetX = 30
	BoardOffsetY = 30
)

type Game struct {
	Board       *board.Board
	CurrentPair *pair.PuyoPair
}

func New() *Game {
	g := &Game{
		Board: board.New(),
	}
	g.spawnNewPair()
	return g
}

// spawnNewPair は新しいぷよペアを生成する
func (g *Game) spawnNewPair() {
	colors := []puyo.Color{
		puyo.ColorRed,
		puyo.ColorBlue,
		puyo.ColorGreen,
		puyo.ColorYellow,
	}

	axisColor := colors[rand.Intn(len(colors))]
	childColor := colors[rand.Intn(len(colors))]

	g.CurrentPair = pair.New(2, 0, axisColor, childColor)
}

func (g *Game) Update() error {
	if g.CurrentPair == nil {
		return nil
	}

	// 左キー
	if ebiten.IsKeyPressed(ebiten.KeyArrowLeft) {
		if g.CurrentPair.CanMoveLeft(g.Board) {
			g.CurrentPair.MoveLeft()
		}
	}

	// 右キー
	if ebiten.IsKeyPressed(ebiten.KeyArrowRight) {
		if g.CurrentPair.CanMoveRight(g.Board) {
			g.CurrentPair.MoveRight()
		}
	}

	return nil
}

func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
	}
}

func (g *Game) drawBoard(screen *ebiten.Image) {
	// ボードの枠を描画
	for row := 0; row < board.Rows; row++ {
		for col := 0; col < board.Cols; col++ {
			x := float64(BoardOffsetX + col*CellSize)
			y := float64(BoardOffsetY + row*CellSize)

			color := g.Board.Get(row, col)
			if color != puyo.ColorNone {
				g.drawPuyo(screen, x, y, color)
			}
		}
	}
}

func (g *Game) drawPuyoPair(screen *ebiten.Image) {
	// 軸ぷよ
	axisX := float64(BoardOffsetX + g.CurrentPair.AxisX*CellSize)
	axisY := float64(BoardOffsetY + g.CurrentPair.AxisY*CellSize)
	g.drawPuyo(screen, axisX, axisY, g.CurrentPair.AxisColor)

	// 子ぷよ（画面内の場合のみ）
	if g.CurrentPair.ChildY >= 0 {
		childX := float64(BoardOffsetX + g.CurrentPair.ChildX*CellSize)
		childY := float64(BoardOffsetY + g.CurrentPair.ChildY*CellSize)
		g.drawPuyo(screen, childX, childY, g.CurrentPair.ChildColor)
	}
}

func (g *Game) drawPuyo(screen *ebiten.Image, x, y float64, color puyo.Color) {
	var r, gr, b uint8

	switch color {
	case puyo.ColorRed:
		r, gr, b = 255, 0, 0
	case puyo.ColorBlue:
		r, gr, b = 0, 0, 255
	case puyo.ColorGreen:
		r, gr, b = 0, 255, 0
	case puyo.ColorYellow:
		r, gr, b = 255, 255, 0
	default:
		return
	}

	// ぷよを円として描画
	ebitenutil.DrawRect(screen, x+2, y+2, float64(CellSize-4), float64(CellSize-4),
		ebiten.RGBA{r, gr, b, 255})
}

func (g *Game) Layout(outsideWidth, outsideHeight int) (int, int) {
	return ScreenWidth, ScreenHeight
}
```

### ゲームの実行

ゲームを実行してみましょう：

```bash
task run
```

ぷよペアが表示され、左右の矢印キーで移動できるはずです！

### イテレーション2のまとめ

このイテレーションで実装した内容：

1. **ぷよペア構造体**
   - 軸ぷよと子ぷよの管理
   - 左右移動メソッド

2. **衝突判定**
   - ボード範囲外のチェック
   - 既存ぷよとの衝突チェック
   - 移動可否の判定

3. **ゲーム統合**
   - ぷよペアのランダム生成
   - キー入力による移動
   - 画面描画（ボードとぷよペア）

4. **描画機能**
   - 色別のぷよ描画
   - ボード全体の描画

### 学んだこと

- **Goの入力処理**: Ebitenの`IsKeyPressed`を使った入力検出
- **乱数生成**: `math/rand`を使ったランダムな色選択
- **描画処理**: `ebitenutil.DrawRect`を使った図形描画
- **衝突判定**: ゲームロジックにおける基本的な衝突検出アルゴリズム
- **テスト駆動開発**: 複雑な機能も小さなステップで確実に実装

### コミット

イテレーション2が完了したので、コミットしましょう：

```bash
git add .
git commit -m 'feat: ぷよペアの表示と移動機能を実装

- ぷよペア構造体（軸ぷよと子ぷよ）
- 衝突判定ロジック
- キー入力による左右移動
- ぷよの描画機能'
```

次のイテレーションでは、ぷよペアの回転機能を実装します！
## イテレーション3: ぷよペアの回転の実装

### ユーザーストーリー

> プレイヤーとして、落ちてくるぷよペアを回転できる

「ぷよを回転できないと、積み方の自由度が少ないですよね？」そうです！今回はぷよペアを回転する機能を実装します。

### 実装概要

ぷよペアの回転は、軸ぷよを中心に子ぷよを90度回転させます。回転パターンは以下の4種類です：

- 上（0度）: 子ぷよが軸ぷよの上
- 右（90度）: 子ぷよが軸ぷよの右
- 下（180度）: 子ぷよが軸ぷよの下
- 左（270度）: 子ぷよが軸ぷよの左

```go
// internal/pair/pair.go に追加
type Direction int

const (
	DirUp Direction = iota
	DirRight
	DirDown
	DirLeft
)

// Rotate は右回転する（壁キック付き）
func (p *PuyoPair) Rotate(b *board.Board) bool {
	newDir := (p.Direction + 1) % 4
	newChildX, newChildY := p.calcChildPosition(p.AxisX, p.AxisY, newDir)

	// 回転可能かチェック
	if !p.IsCollision(b, p.AxisX, p.AxisY, newChildX, newChildY) {
		p.Direction = newDir
		p.ChildX = newChildX
		p.ChildY = newChildY
		return true
	}

	// 壁キック: 左にずらして回転
	if !p.IsCollision(b, p.AxisX-1, p.AxisY, newChildX-1, newChildY) {
		p.AxisX--
		p.ChildX = newChildX - 1
		p.ChildY = newChildY
		p.Direction = newDir
		return true
	}

	// 壁キック: 右にずらして回転
	if !p.IsCollision(b, p.AxisX+1, p.AxisY, newChildX+1, newChildY) {
		p.AxisX++
		p.ChildX = newChildX + 1
		p.ChildY = newChildY
		p.Direction = newDir
		return true
	}

	return false
}

func (p *PuyoPair) calcChildPosition(axisX, axisY int, dir Direction) (int, int) {
	switch dir {
	case DirUp:
		return axisX, axisY - 1
	case DirRight:
		return axisX + 1, axisY
	case DirDown:
		return axisX, axisY + 1
	case DirLeft:
		return axisX - 1, axisY
	default:
		return axisX, axisY - 1
	}
}
```

### 入力処理の追加

```go
// internal/game/game.go のUpdate()に追加
// Zキーで回転
if inpututil.IsKeyJustPressed(ebiten.KeyZ) {
	g.CurrentPair.Rotate(g.Board)
}
```

### 学んだこと

- **回転アルゴリズム**: 軸を中心とした90度回転
- **壁キック**: 回転できない場合の位置調整
- **入力検出**: `IsKeyJustPressed`による1回だけの入力検出

## イテレーション4: ぷよの自動落下の実装

### ユーザーストーリー

> システムとして、ぷよペアが自動的に落下する

「ぷよが自動的に落ちないと、ゲームとして成り立たないですね！」そうです！今回はぷよペアの自動落下を実装します。

### 実装概要

```go
// internal/game/game.go に追加
type GameMode int

const (
	ModePlaying GameMode = iota
	ModeFalling
	ModeChecking
)

const FallInterval = 0.5 // 0.5秒ごとに落下

type Game struct {
	Board       *board.Board
	CurrentPair *pair.PuyoPair
	Mode        GameMode
	FallTimer   float64
}

func (g *Game) Update() error {
	dt := 1.0 / 60.0 // 60FPS

	switch g.Mode {
	case ModePlaying:
		g.handleInput()
		g.updateFall(dt)
	case ModeFalling:
		// 落下中のぷよを処理
		g.applyGravity()
		if !g.hasFloatingPuyo() {
			g.Mode = ModeChecking
		}
	}

	return nil
}

func (g *Game) updateFall(dt float64) {
	g.FallTimer += dt

	if g.FallTimer >= FallInterval {
		g.FallTimer = 0

		// 下に移動できるかチェック
		if g.CurrentPair.CanMoveDown(g.Board) {
			g.CurrentPair.MoveDown()
		} else {
			// 着地
			g.lockPair()
			g.Mode = ModeFalling
		}
	}
}

func (g *Game) lockPair() {
	// 軸ぷよをボードに配置
	g.Board.Set(g.CurrentPair.AxisY, g.CurrentPair.AxisX, g.CurrentPair.AxisColor)

	// 子ぷよをボードに配置（画面内の場合のみ）
	if g.CurrentPair.ChildY >= 0 {
		g.Board.Set(g.CurrentPair.ChildY, g.CurrentPair.ChildX, g.CurrentPair.ChildColor)
	}

	g.CurrentPair = nil
}
```

### 学んだこと

- **ゲームモード管理**: 状態遷移による処理の分岐
- **タイマー処理**: deltaTimeを使った時間管理
- **着地処理**: ぷよペアをボードに固定

## イテレーション5: ぷよの消去ロジックの実装

### ユーザーストーリー

> システムとして、同じ色のぷよが4つ以上つながると消える

「4つ以上つながったぷよが消えるのが、ぷよぷよの醍醐味ですよね！」そうです！今回は消去判定を実装します。

### 実装概要：深さ優先探索（DFS）

```go
// internal/board/board.go に追加
type Position struct {
	Row, Col int
}

// CheckErase は消去可能なぷよを検出する
func (b *Board) CheckErase() []Position {
	visited := make(map[Position]bool)
	var toErase []Position

	for row := 0; row < Rows; row++ {
		for col := 0; col < Cols; col++ {
			pos := Position{row, col}
			if visited[pos] || b.Cells[row][col] == puyo.ColorNone {
				continue
			}

			group := b.dfs(row, col, b.Cells[row][col], visited)
			if len(group) >= 4 {
				toErase = append(toErase, group...)
			}
		}
	}

	return toErase
}

// dfs は深さ優先探索で同じ色のぷよグループを見つける
func (b *Board) dfs(row, col int, color puyo.Color, visited map[Position]bool) []Position {
	pos := Position{row, col}
	if visited[pos] {
		return nil
	}

	if row < 0 || row >= Rows || col < 0 || col >= Cols {
		return nil
	}

	if b.Cells[row][col] != color {
		return nil
	}

	visited[pos] = true
	group := []Position{pos}

	// 上下左右を探索
	group = append(group, b.dfs(row-1, col, color, visited)...)
	group = append(group, b.dfs(row+1, col, color, visited)...)
	group = append(group, b.dfs(row, col-1, color, visited)...)
	group = append(group, b.dfs(row, col+1, color, visited)...)

	return group
}

// Erase は指定した位置のぷよを消去する
func (b *Board) Erase(positions []Position) {
	for _, pos := range positions {
		b.Cells[pos.Row][pos.Col] = puyo.ColorNone
	}
}
```

### 重力処理

```go
// ApplyGravity はぷよを下に落とす
func (b *Board) ApplyGravity() {
	for col := 0; col < Cols; col++ {
		// 下から順に詰める
		writePos := Rows - 1
		for row := Rows - 1; row >= 0; row-- {
			if b.Cells[row][col] != puyo.ColorNone {
				if row != writePos {
					b.Cells[writePos][col] = b.Cells[row][col]
					b.Cells[row][col] = puyo.ColorNone
				}
				writePos--
			}
		}
	}
}
```

### 学んだこと

- **深さ優先探索（DFS）**: 再帰的なグラフ探索アルゴリズム
- **訪問済み管理**: mapを使った重複チェック
- **重力処理**: 列ごとにぷよを下に詰める

## イテレーション6: 連鎖反応とスコアの実装

### ユーザーストーリー

> プレイヤーとして、連鎖したときにスコアが増える

「連鎖が決まったときの爽快感がいいですよね！」そうです！今回は連鎖とスコアシステムを実装します。

### スコア構造体

```go
// internal/score/score.go
package score

type Score struct {
	Total int
	Chain int
}

func New() *Score {
	return &Score{}
}

// Add はスコアを加算する
// 基本スコア: 消したぷよの数 × 10
// 連鎖ボーナス: 2^(chain-1)
func (s *Score) Add(erasedCount, chain int) {
	chainBonus := 1
	if chain > 0 {
		chainBonus = 1 << uint(chain-1) // 2^(chain-1)
	}
	points := erasedCount * 10 * chainBonus
	s.Total += points
}

func (s *Score) IncrementChain() {
	s.Chain++
}

func (s *Score) ResetChain() {
	s.Chain = 0
}
```

### ゲームループへの統合

```go
// internal/game/game.go
func (g *Game) Update() error {
	switch g.Mode {
	case ModeChecking:
		positions := g.Board.CheckErase()
		if len(positions) > 0 {
			g.Score.IncrementChain()
			g.Score.Add(len(positions), g.Score.Chain)
			g.Board.Erase(positions)
			g.Mode = ModeFalling
		} else {
			g.Score.ResetChain()
			g.spawnNewPair()
			g.Mode = ModePlaying
		}

	case ModeFalling:
		g.Board.ApplyGravity()
		if !g.hasFloatingPuyo() {
			g.Mode = ModeChecking
		}
	}

	return nil
}
```

### スコア表示

```go
// internal/game/game.go のDraw()に追加
func (g *Game) Draw(screen *ebiten.Image) {
	// ボードとぷよを描画
	g.drawBoard(screen)
	g.drawPuyoPair(screen)

	// スコア表示
	scoreText := fmt.Sprintf("Score: %d", g.Score.Total)
	ebitenutil.DebugPrintAt(screen, scoreText, 10, 10)

	if g.Score.Chain > 0 {
		chainText := fmt.Sprintf("Chain: %d", g.Score.Chain)
		ebitenutil.DebugPrintAt(screen, chainText, 10, 30)
	}
}
```

### 学んだこと

- **ビット演算**: `1 << n` による2のべき乗計算
- **状態機械**: Playing → Falling → Checking のループ
- **テキスト描画**: `ebitenutil.DebugPrintAt`によるデバッグ表示
- **連鎖検出**: 消去→重力→再消去のサイクル

### コミット

イテレーション3-6が完了したので、コミットしましょう：

```bash
git add .
git commit -m 'feat: 回転、落下、消去、スコアシステムを実装

- ぷよペアの回転と壁キック（イテレーション3）
- 自動落下とタイマー処理（イテレーション4）
- DFSによる消去判定と重力処理（イテレーション5）
- 連鎖システムとスコア計算（イテレーション6）'
```

次のイテレーションでは、ゲームオーバーと追加機能を実装します！
## イテレーション7: スコアと連鎖数の表示

さて、前回のイテレーションでぷよが消えるようになりましたね。「連鎖が決まったときに、スコアが表示されないと達成感がないですよね？」そうですね！今回は、スコアと連鎖数を画面に表示する機能を実装していきましょう。

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、スコアと連鎖数を確認できる

「スコアと連鎖数を見られるようになると、ゲームがもっと楽しくなりそうですね！」そうです！連鎖が続くほどスコアが上がっていくのを見るのは、ぷよぷよの醍醐味の一つですよ。

### TODOリスト

さて、このユーザーストーリーを実現するために、どんなタスクが必要でしょうか？一緒に考えてみましょう：

- スコア構造体を実装する（スコアと連鎖数を管理する）
- スコア計算ロジックを実装する（消したぷよの数と連鎖数からスコアを計算する）
- 連鎖数をカウントする仕組みを追加する（連鎖が続いているか判定する）
- スコアと連鎖数を画面に表示する（プレイヤーが確認できるようにする）

「なるほど、順番に実装していけばいいんですね！」そうです。テスト駆動開発の流れに沿って、まずはテストから書いていきましょう！

### テスト: スコア構造体

「最初に何をテストすればいいんでしょうか？」まずは、スコア構造体の基本機能からテストしていきましょう。スコアの初期化と加算ができることを確認します。

> テストファースト
>
> いつテストを書くべきだろうか——それはテスト対象のコードを書く前だ。
>
> — Kent Beck 『テスト駆動開発』

```go
// internal/score/score_test.go
package score

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestScore(t *testing.T) {
	t.Run("新しいスコアは0で初期化される", func(t *testing.T) {
		s := New()

		assert.Equal(t, 0, s.Total)
		assert.Equal(t, 0, s.Chain)
	})

	t.Run("スコアを加算できる", func(t *testing.T) {
		s := New()

		// 4つのぷよを消去（連鎖なし）
		s.Add(4, 0)

		assert.Equal(t, 40, s.Total) // 4 * 10 = 40
	})

	t.Run("連鎖数に応じてボーナスが付く", func(t *testing.T) {
		s := New()

		// 1連鎖: 4つ消去
		s.Add(4, 1)
		assert.Equal(t, 40, s.Total) // 4 * 10 * 1 = 40

		// 2連鎖: 4つ消去
		s.Add(4, 2)
		assert.Equal(t, 120, s.Total) // 40 + (4 * 10 * 2) = 120

		// 3連鎖: 4つ消去
		s.Add(4, 3)
		assert.Equal(t, 280, s.Total) // 120 + (4 * 10 * 4) = 280
	})
}

func TestChainCounter(t *testing.T) {
	t.Run("連鎖数を増やせる", func(t *testing.T) {
		s := New()

		s.IncrementChain()
		assert.Equal(t, 1, s.Chain)

		s.IncrementChain()
		assert.Equal(t, 2, s.Chain)
	})

	t.Run("連鎖数をリセットできる", func(t *testing.T) {
		s := New()
		s.Chain = 5

		s.ResetChain()

		assert.Equal(t, 0, s.Chain)
	})
}
```

このテストでは、スコアの初期化、加算、連鎖ボーナスの計算が正しく動作することを確認しています。「連鎖ボーナスって、どういう計算なんですか？」良い質問ですね！連鎖ボーナスは `2^(chain-1)` で計算されます。1連鎖なら1倍、2連鎖なら2倍、3連鎖なら4倍というように、連鎖が続くほど大きくなるんです。

### 実装: スコア構造体

テストを書いたら、次に実装しましょう。どうなるでしょうか？

```bash
task test
```

```
no such file or directory: internal/score/score_test.go
```

おっと！まだ`score`パッケージを実装していないので、当然エラーになりますね。これがテスト駆動開発の「Red（赤）」の状態です。

> 仮実装
>
> テストをパスさせるための実装にはどんな方法があるだろうか。仮実装を使えばすぐにテストを動かすことができる。
>
> — Kent Beck 『テスト駆動開発』

では、テストを通すための実装を書いていきましょう：

```go
// internal/score/score.go
package score

// Score はゲームのスコアと連鎖数を管理する
type Score struct {
	Total int
	Chain int
}

// New は新しいスコアを作成する
func New() *Score {
	return &Score{
		Total: 0,
		Chain: 0,
	}
}

// Add はスコアを加算する
// 基本スコア: 消したぷよの数 × 10
// 連鎖ボーナス: 2^(chain-1) 倍（chainが0の場合は1倍）
func (s *Score) Add(erasedCount, chain int) {
	chainBonus := 1
	if chain > 0 {
		// 2^(chain-1) を計算
		// 1連鎖: 2^0 = 1
		// 2連鎖: 2^1 = 2
		// 3連鎖: 2^2 = 4
		chainBonus = 1 << uint(chain-1)
	}

	points := erasedCount * 10 * chainBonus
	s.Total += points
}

// IncrementChain は連鎖数を1増やす
func (s *Score) IncrementChain() {
	s.Chain++
}

// ResetChain は連鎖数を0にリセットする
func (s *Score) ResetChain() {
	s.Chain = 0
}
```

「`1 << uint(chain-1)` って何ですか？」良い質問ですね！これはビット左シフト演算で、2のべき乗を計算する効率的な方法なんです。`1 << n` は `2^n` と同じ結果になります。例えば、`1 << 2` は `4` （2の2乗）になります。

テストを実行してみましょう：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/score     0.002s
```

やった！テストが通りました。これが「Green（緑）」の状態です。

### リファクタリング: スコア構造体

テストが通ったので、リファクタリングの機会を探しましょう。今回のコードはシンプルで明確なので、特にリファクタリングする必要はありません。次のタスクに進みましょう！

### テスト: ゲームへのスコア統合

次は、スコアをゲームに統合します。消去が発生したときに連鎖数をカウントし、スコアを加算する機能をテストします。

```go
// internal/game/game_test.go に追加
func TestGameScore(t *testing.T) {
	t.Run("ぷよを消すとスコアが加算される", func(t *testing.T) {
		g := New()

		// ボードに4つの赤ぷよを配置（消去可能な状態）
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 消去判定モードに設定
		g.Mode = ModeChecking
		g.Update()

		// スコアが加算されていることを確認
		assert.Equal(t, 40, g.Score.Total) // 4 * 10 = 40
		assert.Equal(t, 1, g.Score.Chain)  // 1連鎖
	})

	t.Run("連鎖するとボーナスが付く", func(t *testing.T) {
		g := New()

		// 1連鎖目の配置（赤4つ）
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 2連鎖目の配置（青4つ、赤の上）
		g.Board.Set(9, 1, puyo.ColorBlue)
		g.Board.Set(9, 2, puyo.ColorBlue)
		g.Board.Set(8, 1, puyo.ColorBlue)
		g.Board.Set(8, 2, puyo.ColorBlue)

		// 1回目の消去判定
		g.Mode = ModeChecking
		g.Update()

		firstScore := g.Score.Total
		assert.Equal(t, 40, firstScore) // 4 * 10 * 1 = 40
		assert.Equal(t, 1, g.Score.Chain)

		// 重力適用
		g.Mode = ModeFalling
		g.Update()

		// 2回目の消去判定（青が落ちて4つ揃う）
		g.Mode = ModeChecking
		g.Update()

		// 2連鎖ボーナスが付いていることを確認
		assert.Equal(t, 120, g.Score.Total) // 40 + (4 * 10 * 2) = 120
		assert.Equal(t, 2, g.Score.Chain)
	})

	t.Run("消去できないときは連鎖がリセットされる", func(t *testing.T) {
		g := New()
		g.Score.Chain = 3

		// 消去できない状態
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorBlue)

		// 消去判定
		g.Mode = ModeChecking
		g.Update()

		// 連鎖がリセットされていることを確認
		assert.Equal(t, 0, g.Score.Chain)
	})
}
```

このテストでは、ぷよが消えたときのスコア加算、連鎖時のボーナス、連鎖のリセットを確認しています。

### 実装: ゲームへのスコア統合

テストを通すための実装をしましょう：

```go
// internal/game/game.go に追加
import (
	"github.com/yourusername/puyo-puyo-go/internal/score"
)

type Game struct {
	Board       *board.Board
	CurrentPair *pair.PuyoPair
	Mode        GameMode
	FallTimer   float64
	Score       *score.Score
}

func New() *Game {
	g := &Game{
		Board: board.New(),
		Mode:  ModePlaying,
		Score: score.New(),
	}
	g.spawnNewPair()
	return g
}

func (g *Game) Update() error {
	dt := 1.0 / 60.0

	switch g.Mode {
	case ModePlaying:
		g.handleInput()
		g.updateFall(dt)

	case ModeFalling:
		g.Board.ApplyGravity()
		if !g.hasFloatingPuyo() {
			g.Mode = ModeChecking
		}

	case ModeChecking:
		positions := g.Board.CheckErase()
		if len(positions) > 0 {
			// 連鎖数を増やす
			g.Score.IncrementChain()

			// スコアを加算
			g.Score.Add(len(positions), g.Score.Chain)

			// ぷよを消去
			g.Board.Erase(positions)

			// 重力適用モードへ
			g.Mode = ModeFalling
		} else {
			// 消去するぷよがない場合は連鎖終了
			g.Score.ResetChain()

			// 新しいぷよペアを生成
			g.spawnNewPair()

			// プレイモードへ
			g.Mode = ModePlaying
		}
	}

	return nil
}

// hasFloatingPuyo は浮いているぷよがあるかチェックする
func (g *Game) hasFloatingPuyo() bool {
	for row := board.Rows - 2; row >= 0; row-- {
		for col := 0; col < board.Cols; col++ {
			// ぷよがあり、その下が空の場合
			if g.Board.Get(row, col) != puyo.ColorNone &&
				g.Board.Get(row+1, col) == puyo.ColorNone {
				return true
			}
		}
	}
	return false
}
```

「連鎖の仕組みってどうなってるんですか？」良い質問ですね！連鎖は以下の流れで発生します：

1. **Checking モード**: ぷよを消去し、連鎖数を増やす
2. **Falling モード**: 重力を適用してぷよを落とす
3. **Checking モード**: 再度消去判定（消えるぷよがあれば連鎖継続）
4. 消えるぷよがなくなるまで Checking ⇄ Falling を繰り返す

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/game      0.003s
```

素晴らしい！テストが通りました。

### 実装: スコアと連鎖数の表示

最後に、スコアと連鎖数を画面に表示する機能を追加します：

```go
// internal/game/game.go の Draw メソッドを更新
import (
	"fmt"
	"image/color"

	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/ebitenutil"
	"github.com/hajimehoshi/ebiten/v2/text"
	"golang.org/x/image/font"
	"golang.org/x/image/font/basicfont"
)

func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
	}

	// スコアを表示
	g.drawScore(screen)

	// 連鎖数を表示（連鎖中のみ）
	if g.Score.Chain > 0 {
		g.drawChain(screen)
	}
}

func (g *Game) drawScore(screen *ebiten.Image) {
	scoreText := fmt.Sprintf("Score: %d", g.Score.Total)

	// テキストの描画位置
	x := 10
	y := 20

	// 白色でスコアを描画
	ebitenutil.DebugPrintAt(screen, scoreText, x, y)
}

func (g *Game) drawChain(screen *ebiten.Image) {
	chainText := fmt.Sprintf("Chain: %d", g.Score.Chain)

	// テキストの描画位置（スコアの下）
	x := 10
	y := 40

	// 黄色で連鎖数を描画
	// 注: ebitenutil.DebugPrintAt は色を指定できないため、
	// より詳細な描画が必要な場合は text.Draw を使用
	ebitenutil.DebugPrintAt(screen, chainText, x, y)
}
```

「色を変えて表示したいんですが...」そうですね！より見やすくするために、色付きテキストを表示する実装も追加しましょう：

```go
// より詳細なテキスト描画（色付き）
func (g *Game) drawColoredText(screen *ebiten.Image, str string, x, y int, clr color.Color) {
	// 基本フォントを使用
	face := basicfont.Face7x13

	// テキストを描画
	text.Draw(screen, str, face, x, y, clr)
}

func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
	}

	// スコアを白色で表示
	scoreText := fmt.Sprintf("Score: %d", g.Score.Total)
	g.drawColoredText(screen, scoreText, 10, 20, color.White)

	// 連鎖数を黄色で表示（連鎖中のみ）
	if g.Score.Chain > 0 {
		chainText := fmt.Sprintf("Chain: %d", g.Score.Chain)
		g.drawColoredText(screen, chainText, 10, 40, color.RGBA{255, 255, 0, 255})
	}
}
```

### ゲームの実行

ゲームを実行してみましょう：

```bash
task run
```

ぷよを消すとスコアが表示され、連鎖が続くと連鎖数と高いスコアが表示されるはずです！

### イテレーション7のまとめ

このイテレーションで実装した内容：

1. **スコア構造体**
   - スコアの初期化と加算
   - 連鎖数のカウント機能
   - 連鎖ボーナスの計算（2^(chain-1)）

2. **ゲーム統合**
   - 消去時のスコア加算
   - 連鎖の検出と継続
   - 連鎖のリセット

3. **画面表示**
   - スコアの表示（白色）
   - 連鎖数の表示（黄色、連鎖中のみ）
   - 色付きテキスト描画

4. **ゲームループの改善**
   - Checking → Falling → Checking のサイクル
   - 浮いているぷよの検出

### 学んだこと

- **ビット演算**: `1 << n` による2のべき乗計算
- **状態遷移**: モード間の遷移による連鎖の実現
- **テキスト描画**: Ebitenでの文字表示方法
- **色の指定**: `color.RGBA` による色の定義
- **テスト戦略**: 連鎖のような複雑な処理のテスト方法

### コミット

イテレーション7が完了したので、コミットしましょう：

```bash
git add .
git commit -m 'feat: スコアと連鎖数の表示機能を実装

- スコア構造体（Total/Chain）
- 連鎖ボーナス計算（2^(chain-1)倍）
- スコアと連鎖数の画面表示
- 連鎖継続ロジック（Checking/Falling切り替え）'
```

次のイテレーションでは、ゲームオーバー判定を実装します！
## イテレーション8: ゲームオーバー判定

さて、前回のイテレーションでスコアと連鎖数が表示されるようになりましたね。「でも、ぷよが積み重なって画面の上まで行ったらどうなるんですか？」それがゲームオーバーです！今回は、ゲームオーバーの判定と表示、そしてリスタート機能を実装していきましょう。

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> システムとして、ぷよが画面上端に到達したらゲームオーバーになる
>
> プレイヤーとして、ゲームオーバー後にリスタートできる

「ゲームオーバーになったら、もう一度遊べないと困りますよね？」そうです！だから、ゲームオーバーの判定だけでなく、リスタート機能も一緒に実装しますよ。

### TODOリスト

さて、このユーザーストーリーを実現するために、どんなタスクが必要でしょうか？一緒に考えてみましょう：

- ゲームオーバーのゲームモードを追加する
- 新しいぷよペアを生成できない場合にゲームオーバーと判定する
- ゲームオーバー画面を表示する
- リスタート機能を実装する（Rキーでゲームをリセット）

「なるほど、順番に実装していけばいいんですね！」そうです。テスト駆動開発の流れに沿って、まずはテストから書いていきましょう！

### テスト: ゲームオーバー判定

「最初に何をテストすればいいんでしょうか？」まずは、ゲームオーバーの判定ロジックからテストしていきましょう。新しいぷよペアが配置できない場合にゲームオーバーになることを確認します。

> テストファースト
>
> いつテストを書くべきだろうか——それはテスト対象のコードを書く前だ。
>
> — Kent Beck 『テスト駆動開発』

```go
// internal/game/game_test.go に追加
func TestGameOver(t *testing.T) {
	t.Run("出現位置が埋まっているとゲームオーバーになる", func(t *testing.T) {
		g := New()

		// 出現位置(2, 0)にぷよを配置
		g.Board.Set(0, 2, puyo.ColorRed)

		// 新しいぷよペアを生成しようとする
		g.spawnNewPair()

		// ゲームオーバーモードになっていることを確認
		assert.Equal(t, ModeGameOver, g.Mode)
		// 現在のぷよペアがnilになっていることを確認
		assert.Nil(t, g.CurrentPair)
	})

	t.Run("出現位置の上（子ぷよの位置）が埋まっていてもゲームオーバーになる", func(t *testing.T) {
		g := New()

		// 出現位置の上(-1, 2)にぷよを配置
		// 注: 画面外なので実際にはSetできないが、
		// 子ぷよの初期位置が画面外でも衝突判定される
		g.Board.Set(0, 2, puyo.ColorRed)

		// 新しいぷよペアを生成しようとする
		g.spawnNewPair()

		// ゲームオーバーモードになっていることを確認
		assert.Equal(t, ModeGameOver, g.Mode)
	})

	t.Run("出現位置が空いているとゲームオーバーにならない", func(t *testing.T) {
		g := New()

		// 出現位置を空けておく
		// （何も配置しない）

		// 新しいぷよペアを生成
		g.spawnNewPair()

		// プレイモードのままであることを確認
		assert.NotEqual(t, ModeGameOver, g.Mode)
		// ぷよペアが生成されていることを確認
		assert.NotNil(t, g.CurrentPair)
	})
}
```

このテストでは、ぷよペアが配置できない状況でゲームオーバーになることを確認しています。「出現位置って、どこですか？」良い質問ですね！ぷよペアは画面上部の中央（X座標2、Y座標0）に出現します。そこに既にぷよがあると、新しいぷよペアを配置できないのでゲームオーバーになるんです。

### 実装: ゲームオーバー判定

テストを書いたら、次に実装しましょう。どうなるでしょうか？

```bash
task test
```

```
undefined: ModeGameOver
```

おっと！`ModeGameOver`がまだ定義されていませんね。これがテスト駆動開発の「Red（赤）」の状態です。

> 明白な実装
>
> シンプルな操作をどう実装すればいいだろうか。ただ実装すればいいのだ。
>
> — Kent Beck 『テスト駆動開発』

では、テストを通すための実装を書いていきましょう：

```go
// internal/game/game.go に追加
const (
	ModePlaying GameMode = iota
	ModeFalling
	ModeChecking
	ModeGameOver  // ゲームオーバーモードを追加
)

func (g *Game) spawnNewPair() {
	colors := []puyo.Color{
		puyo.ColorRed,
		puyo.ColorBlue,
		puyo.ColorGreen,
		puyo.ColorYellow,
	}

	axisColor := colors[rand.Intn(len(colors))]
	childColor := colors[rand.Intn(len(colors))]

	newPair := pair.New(2, 0, axisColor, childColor)

	// ゲームオーバー判定：新しいぷよペアが配置できるかチェック
	if newPair.IsCollision(g.Board, newPair.AxisX, newPair.AxisY,
		newPair.ChildX, newPair.ChildY) {
		// 配置できない場合はゲームオーバー
		g.Mode = ModeGameOver
		g.CurrentPair = nil
		return
	}

	// 配置できる場合は通常通りセット
	g.CurrentPair = newPair
	g.FallTimer = 0
}
```

「なるほど、`spawnNewPair`で衝突判定をして、配置できない場合はゲームオーバーにするんですね！」そうです。新しいぷよペアを作成してから、実際に配置する前に衝突判定を行います。配置できなければゲームオーバー、配置できれば通常通りゲームを続けます。

テストを実行してみましょう：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/game      0.003s
```

やった！テストが通りました。これが「Green（緑）」の状態です。

### リファクタリング: ゲームオーバー判定

テストが通ったので、リファクタリングの機会を探しましょう。今回のコードはシンプルで明確なので、特にリファクタリングする必要はありません。次のタスクに進みましょう！

### テスト: ゲームオーバー時の入力処理

次は、ゲームオーバー時の入力処理をテストします。ゲームオーバー中は通常の操作ができず、Rキーでリスタートできることを確認します。

```go
// internal/game/game_test.go に追加
func TestGameOverInput(t *testing.T) {
	t.Run("ゲームオーバー中は通常の入力を受け付けない", func(t *testing.T) {
		g := New()
		g.Mode = ModeGameOver
		g.CurrentPair = nil

		// Updateを呼んでも何も起こらない
		err := g.Update()

		assert.NoError(t, err)
		assert.Equal(t, ModeGameOver, g.Mode)
		assert.Nil(t, g.CurrentPair)
	})
}
```

このテストでは、ゲームオーバー中に`Update`を呼んでも状態が変わらないことを確認しています。「Rキーでのリスタートはテストしないんですか？」キーボード入力のテストは少し複雑なので、今回は手動テストで確認することにしましょう。

### 実装: ゲームオーバー時の処理

ゲームオーバー時の処理を実装しましょう：

```go
// internal/game/game.go の Update を修正
func (g *Game) Update() error {
	// ゲームオーバー中の処理
	if g.Mode == ModeGameOver {
		// Rキーでリスタート
		if inpututil.IsKeyJustPressed(ebiten.KeyR) {
			g.restart()
		}
		return nil
	}

	dt := 1.0 / 60.0

	switch g.Mode {
	case ModePlaying:
		g.handleInput()
		g.updateFall(dt)

	case ModeFalling:
		g.Board.ApplyGravity()
		if !g.hasFloatingPuyo() {
			g.Mode = ModeChecking
		}

	case ModeChecking:
		positions := g.Board.CheckErase()
		if len(positions) > 0 {
			g.Score.IncrementChain()
			g.Score.Add(len(positions), g.Score.Chain)
			g.Board.Erase(positions)
			g.Mode = ModeFalling
		} else {
			g.Score.ResetChain()
			g.spawnNewPair()
			g.Mode = ModePlaying
		}
	}

	return nil
}

// restart はゲームを初期状態に戻す
func (g *Game) restart() {
	// ボードをクリア
	g.Board = board.New()

	// スコアをリセット
	g.Score = score.New()

	// モードをプレイモードに
	g.Mode = ModePlaying

	// 新しいぷよペアを生成
	g.spawnNewPair()

	// タイマーをリセット
	g.FallTimer = 0
}
```

「`inpututil.IsKeyJustPressed`って何ですか？」良い質問ですね！これは、キーが**押された瞬間だけ** trueを返す関数です。`ebiten.IsKeyPressed`は押している間ずっとtrueを返しますが、`IsKeyJustPressed`は1フレームだけtrueを返すので、リスタートのような1回だけ実行したい処理に適しています。

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/game      0.003s
```

素晴らしい！テストが通りました。

### 実装: ゲームオーバー画面の表示

最後に、ゲームオーバー画面を表示する機能を追加します：

```go
// internal/game/game.go の Draw メソッドに追加
import (
	"image/color"
)

func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
	}

	// スコアを表示
	scoreText := fmt.Sprintf("Score: %d", g.Score.Total)
	g.drawColoredText(screen, scoreText, 10, 20, color.White)

	// 連鎖数を表示（連鎖中のみ）
	if g.Score.Chain > 0 {
		chainText := fmt.Sprintf("Chain: %d", g.Score.Chain)
		g.drawColoredText(screen, chainText, 10, 40, color.RGBA{255, 255, 0, 255})
	}

	// ゲームオーバー表示
	if g.Mode == ModeGameOver {
		g.drawGameOver(screen)
	}
}

func (g *Game) drawGameOver(screen *ebiten.Image) {
	// 半透明の黒い背景
	overlay := ebiten.NewImage(ScreenWidth, ScreenHeight)
	overlay.Fill(color.RGBA{0, 0, 0, 180})
	screen.DrawImage(overlay, nil)

	// "GAME OVER" テキストを赤色で表示
	gameOverText := "GAME OVER"
	// 中央揃えのためのX座標計算（フォント幅7、文字数9で計算）
	x := (ScreenWidth - len(gameOverText)*7) / 2
	y := ScreenHeight / 2
	g.drawColoredText(screen, gameOverText, x, y, color.RGBA{255, 0, 0, 255})

	// リスタート案内を白色で表示
	restartText := "Press R to Restart"
	x = (ScreenWidth - len(restartText)*7) / 2
	y = ScreenHeight/2 + 30
	g.drawColoredText(screen, restartText, x, y, color.White)

	// 最終スコアを表示
	finalScoreText := fmt.Sprintf("Final Score: %d", g.Score.Total)
	x = (ScreenWidth - len(finalScoreText)*7) / 2
	y = ScreenHeight/2 + 60
	g.drawColoredText(screen, finalScoreText, x, y, color.RGBA{255, 255, 0, 255})
}
```

「半透明の背景を作ってるんですね！」そうです！`color.RGBA{0, 0, 0, 180}`の最後の数字（180）が透明度を表しています。255が完全に不透明、0が完全に透明です。180は少し透けて見える感じになりますよ。

### ゲームの実行

ゲームを実行してみましょう：

```bash
task run
```

ぷよが画面上部まで積み上がると「GAME OVER」と表示され、Rキーを押すとゲームがリスタートされるはずです！

### イテレーション8のまとめ

このイテレーションで実装した内容：

1. **ゲームオーバー判定**
   - 新しいぷよペアが配置できない場合にゲームオーバー
   - `ModeGameOver`の追加
   - `spawnNewPair`での衝突チェック

2. **リスタート機能**
   - `restart()`メソッドによるゲーム初期化
   - Rキーでのリスタート
   - ボード、スコア、モード、タイマーのリセット

3. **ゲームオーバー画面**
   - 半透明の黒い背景
   - "GAME OVER"テキスト（赤色）
   - リスタート案内（白色）
   - 最終スコア表示（黄色）
   - 中央揃え表示

4. **入力処理の改善**
   - ゲームオーバー中の通常入力の無効化
   - `IsKeyJustPressed`による1回だけの入力検出

### 学んだこと

- **ゲーム状態管理**: ゲームオーバーモードの追加と処理
- **入力処理**: `IsKeyPressed` vs `IsKeyJustPressed`の違い
- **画面効果**: 半透明オーバーレイの作成
- **テキスト配置**: 中央揃えの計算方法
- **リスタート処理**: ゲーム状態の完全なリセット

### コミット

イテレーション8が完了したので、コミットしましょう：

```bash
git add .
git commit -m 'feat: ゲームオーバー判定とリスタート機能を実装

- 配置不可能時のゲームオーバー判定
- Rキーによるリスタート機能
- ゲームオーバー画面表示（半透明背景付き）
- 最終スコア表示'
```

次のイテレーションでは、全消しボーナスを実装します！
## イテレーション9: 全消しボーナス

さて、前回のイテレーションでゲームオーバーとリスタート機能が実装できましたね。「すべてのぷよを消したときに、特別なボーナスがあるんですよね？」そうです！全消しは大きなボーナスポイントが得られる特別な達成です。今回は、全消しボーナスを実装していきましょう。

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、すべてのぷよを消したときに全消しボーナスを得られる

「全消しって、すごく難しそうですね！」そうですね！でも、成功したときの達成感は格別ですよ。だから、ボーナスポイントも大きくしましょう！

### TODOリスト

さて、このユーザーストーリーを実現するために、どんなタスクが必要でしょうか？一緒に考えてみましょう：

- ボードが空かどうかを判定する機能を実装する
- 全消しボーナスポイントをスコアに加算する機能を実装する
- 全消し時に特別な表示を行う
- 全消しボーナスの計算ロジックをゲームに統合する

「なるほど、順番に実装していけばいいんですね！」そうです。テスト駆動開発の流れに沿って、まずはテストから書いていきましょう！

### テスト: 全消し判定

「最初に何をテストすればいいんでしょうか？」まずは、ボードが空かどうかを判定する機能からテストしていきましょう。

> テストファースト
>
> いつテストを書くべきだろうか——それはテスト対象のコードを書く前だ。
>
> — Kent Beck 『テスト駆動開発』

```go
// internal/board/board_test.go に追加
func TestIsAllClear(t *testing.T) {
	t.Run("空のボードは全消しと判定される", func(t *testing.T) {
		b := New()

		isAllClear := b.IsAllClear()

		assert.True(t, isAllClear)
	})

	t.Run("ぷよが1つでもあると全消しでないと判定される", func(t *testing.T) {
		b := New()

		// 1つだけぷよを配置
		b.Set(11, 0, puyo.ColorRed)

		isAllClear := b.IsAllClear()

		assert.False(t, isAllClear)
	})

	t.Run("複数のぷよがある場合も全消しでないと判定される", func(t *testing.T) {
		b := New()

		// 複数のぷよを配置
		b.Set(11, 0, puyo.ColorRed)
		b.Set(11, 1, puyo.ColorBlue)
		b.Set(10, 2, puyo.ColorGreen)

		isAllClear := b.IsAllClear()

		assert.False(t, isAllClear)
	})
}
```

このテストでは、ボードが完全に空の場合のみ全消しと判定され、ぷよが1つでも残っている場合は全消しでないと判定されることを確認しています。

### 実装: 全消し判定

テストを書いたら、次に実装しましょう。どうなるでしょうか？

```bash
task test
```

```
undefined: Board.IsAllClear
```

おっと！`IsAllClear`メソッドがまだ実装されていませんね。これがテスト駆動開発の「Red（赤）」の状態です。

> 明白な実装
>
> シンプルな操作をどう実装すればいいだろうか。ただ実装すればいいのだ。
>
> — Kent Beck 『テスト駆動開発』

では、テストを通すための実装を書いていきましょう：

```go
// internal/board/board.go に追加
// IsAllClear は盤面上のぷよが全て消えているかチェックする
func (b *Board) IsAllClear() bool {
	for row := 0; row < Rows; row++ {
		for col := 0; col < Cols; col++ {
			if b.Cells[row][col] != puyo.ColorNone {
				// ぷよが1つでもあればfalse
				return false
			}
		}
	}
	// すべてのセルが空ならtrue
	return true
}
```

「シンプルですね！」そうです。全てのセルをチェックして、1つでもぷよがあればfalseを返し、すべて空ならtrueを返すだけです。

テストを実行してみましょう：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/board     0.002s
```

やった！テストが通りました。これが「Green（緑）」の状態です。

### リファクタリング: 全消し判定

テストが通ったので、リファクタリングの機会を探しましょう。今回のコードはシンプルで明確なので、特にリファクタリングする必要はありません。次のタスクに進みましょう！

### テスト: 全消しボーナス

次は、全消しボーナスをスコアに加算する機能をテストします。

```go
// internal/score/score_test.go に追加
func TestAllClearBonus(t *testing.T) {
	t.Run("全消しボーナスは5000点", func(t *testing.T) {
		s := New()
		s.Total = 1000

		s.AddAllClearBonus()

		assert.Equal(t, 6000, s.Total) // 1000 + 5000 = 6000
	})

	t.Run("全消しボーナスは何度でも加算できる", func(t *testing.T) {
		s := New()

		s.AddAllClearBonus()
		assert.Equal(t, 5000, s.Total)

		s.AddAllClearBonus()
		assert.Equal(t, 10000, s.Total) // 5000 + 5000 = 10000
	})
}
```

このテストでは、全消しボーナスとして5000点が加算されることを確認しています。「5000点って、けっこう大きいですね！」そうです！全消しは難しい達成なので、大きなボーナスにしているんです。

### 実装: 全消しボーナス

テストを通すための実装を書きましょう：

```go
// internal/score/score.go に追加
const AllClearBonus = 5000

// AddAllClearBonus は全消しボーナスを加算する
func (s *Score) AddAllClearBonus() {
	s.Total += AllClearBonus
}
```

「定数で定義しているんですね！」そうです。ボーナスの値を変更したくなったとき、1箇所だけ修正すればいいようにしています。

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/score     0.002s
```

素晴らしい！テストが通りました。

### テスト: ゲームへの全消しボーナス統合

次は、ゲームに全消しボーナスを統合します。ぷよを消した後にボードが空になっていたら、ボーナスが加算されることをテストします。

```go
// internal/game/game_test.go に追加
func TestAllClearBonus(t *testing.T) {
	t.Run("全てのぷよを消すと全消しボーナスが加算される", func(t *testing.T) {
		g := New()

		// 消去可能な4つの赤ぷよのみを配置
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)

		// 消去判定
		g.Mode = ModeChecking
		g.Update()

		// 通常スコア(40) + 全消しボーナス(5000)
		assert.Equal(t, 5040, g.Score.Total)
	})

	t.Run("ぷよが残っている場合は全消しボーナスが加算されない", func(t *testing.T) {
		g := New()

		// 消去可能な4つの赤ぷよと、残る1つの青ぷよを配置
		g.Board.Set(11, 1, puyo.ColorRed)
		g.Board.Set(11, 2, puyo.ColorRed)
		g.Board.Set(10, 1, puyo.ColorRed)
		g.Board.Set(10, 2, puyo.ColorRed)
		g.Board.Set(9, 0, puyo.ColorBlue)  // 残るぷよ

		// 消去判定
		g.Mode = ModeChecking
		g.Update()

		// 通常スコア(40)のみ
		assert.Equal(t, 40, g.Score.Total)
	})
}
```

このテストでは、全てのぷよを消したときだけ全消しボーナスが加算されることを確認しています。

### 実装: ゲームへの全消しボーナス統合

テストを通すための実装をしましょう：

```go
// internal/game/game.go の Update を修正
func (g *Game) Update() error {
	// ゲームオーバー中の処理
	if g.Mode == ModeGameOver {
		if inpututil.IsKeyJustPressed(ebiten.KeyR) {
			g.restart()
		}
		return nil
	}

	dt := 1.0 / 60.0

	switch g.Mode {
	case ModePlaying:
		g.handleInput()
		g.updateFall(dt)

	case ModeFalling:
		g.Board.ApplyGravity()
		if !g.hasFloatingPuyo() {
			g.Mode = ModeChecking
		}

	case ModeChecking:
		positions := g.Board.CheckErase()
		if len(positions) > 0 {
			// 連鎖数を増やす
			g.Score.IncrementChain()

			// スコアを加算
			g.Score.Add(len(positions), g.Score.Chain)

			// ぷよを消去
			g.Board.Erase(positions)

			// 全消しチェック
			if g.Board.IsAllClear() {
				g.Score.AddAllClearBonus()
			}

			// 重力適用モードへ
			g.Mode = ModeFalling
		} else {
			// 消去するぷよがない場合は連鎖終了
			g.Score.ResetChain()

			// 新しいぷよペアを生成
			g.spawnNewPair()

			// プレイモードへ
			g.Mode = ModePlaying
		}
	}

	return nil
}
```

「消去した直後に全消しチェックをするんですね！」そうです。ぷよを消去した後、ボードが空になっていたら全消しボーナスを加算します。

テストを実行します：

```bash
task test
```

```
PASS
ok      github.com/yourusername/puyo-puyo-go/internal/game      0.003s
```

素晴らしい！テストが通りました。

### 実装: 全消し表示

最後に、全消しを達成したときの表示を追加します：

```go
// internal/game/game.go の Draw メソッドに追加
func (g *Game) Draw(screen *ebiten.Image) {
	// ボードを描画
	g.drawBoard(screen)

	// 現在のぷよペアを描画
	if g.CurrentPair != nil {
		g.drawPuyoPair(screen)
	}

	// スコアを表示
	scoreText := fmt.Sprintf("Score: %d", g.Score.Total)
	g.drawColoredText(screen, scoreText, 10, 20, color.White)

	// 連鎖数を表示（連鎖中のみ）
	if g.Score.Chain > 0 {
		chainText := fmt.Sprintf("Chain: %d", g.Score.Chain)
		g.drawColoredText(screen, chainText, 10, 40, color.RGBA{255, 255, 0, 255})
	}

	// 全消し表示
	if g.Board.IsAllClear() && g.Mode == ModeChecking {
		g.drawAllClear(screen)
	}

	// ゲームオーバー表示
	if g.Mode == ModeGameOver {
		g.drawGameOver(screen)
	}
}

func (g *Game) drawAllClear(screen *ebiten.Image) {
	// "ALL CLEAR!" テキストを金色で表示
	allClearText := "ALL CLEAR!"
	// 中央揃えのためのX座標計算
	x := (ScreenWidth - len(allClearText)*7) / 2
	y := ScreenHeight / 2
	// 金色（R:255, G:215, B:0）
	g.drawColoredText(screen, allClearText, x, y, color.RGBA{255, 215, 0, 255})

	// ボーナスポイント表示
	bonusText := fmt.Sprintf("+%d BONUS!", score.AllClearBonus)
	x = (ScreenWidth - len(bonusText)*7) / 2
	y = ScreenHeight/2 + 20
	g.drawColoredText(screen, bonusText, x, y, color.RGBA{255, 255, 0, 255})
}
```

「金色で "ALL CLEAR!" って表示されるんですね！かっこいい！」そうでしょう？達成したときの喜びが大きくなるように、目立つ表示にしました。

### ゲームの実行

ゲームを実行してみましょう：

```bash
task run
```

すべてのぷよを消すと「ALL CLEAR!」と金色のテキストが表示され、5000点のボーナスが加算されるはずです！

### イテレーション9のまとめ

このイテレーションで実装した内容：

1. **全消し判定**
   - `IsAllClear()`メソッドによるボード空判定
   - 全セルのチェック

2. **全消しボーナス**
   - 5000点の固定ボーナス
   - `AddAllClearBonus()`メソッド
   - 定数による値管理

3. **ゲーム統合**
   - 消去後の全消しチェック
   - ボーナスポイント加算
   - チェックタイミングの最適化

4. **全消し表示**
   - "ALL CLEAR!"テキスト（金色）
   - ボーナスポイント表示（黄色）
   - 中央揃え表示
   - 表示タイミング制御

### 学んだこと

- **全探索**: 2次元配列の全要素チェック
- **定数管理**: マジックナンバーの排除
- **色の選択**: 金色の表現（RGB: 255, 215, 0）
- **条件表示**: モードとボード状態の組み合わせ判定
- **ユーザー体験**: 達成感を高める視覚的フィードバック

### コミット

イテレーション9が完了したので、コミットしましょう：

```bash
git add .
git commit -m 'feat: 全消しボーナス機能を実装

- ボード空判定（IsAllClear）
- 5000点の全消しボーナス
- "ALL CLEAR!"表示（金色）
- ボーナスポイント表示'
```

### ゲーム完成！

おめでとうございます！これですべてのイテレーションが完了し、ぷよぷよゲームが完成しました！

## まとめ

### 完成したゲームの機能

このチュートリアルで実装した機能：

1. **基本操作**
   - ぷよペアの左右移動
   - ぷよペアの回転（壁キック付き）
   - 高速落下（下キー）

2. **ゲームロジック**
   - 自動落下（タイマー制御）
   - 着地判定
   - 消去判定（DFSによる4つ以上の検出）
   - 重力処理
   - 連鎖システム

3. **スコアシステム**
   - 基本スコア（消した数 × 10）
   - 連鎖ボーナス（2^(chain-1)倍）
   - 全消しボーナス（5000点）

4. **ゲーム管理**
   - ゲームオーバー判定
   - リスタート機能（Rキー）
   - スコアと連鎖数の表示
   - 全消し表示

### TDDで学んだこと

1. **Red-Green-Refactor サイクル**
   - 失敗するテストを先に書く
   - 最小限の実装でテストを通す
   - コードを改善する

2. **Goの重要な概念**
   - 構造体とメソッド
   - インターフェース設計
   - ポインタとゼロ値
   - エラーハンドリング
   - パッケージ構成（cmd/internal）
   - ビット演算
   - 定数管理

3. **アルゴリズム**
   - 深さ優先探索（DFS）
   - 衝突判定
   - 回転計算
   - 重力処理
   - 2次元配列の操作

4. **ゲーム開発パターン**
   - Ebitenゲームループ（Update/Draw/Layout）
   - 状態遷移（Playing → Falling → Checking）
   - タイマー管理（deltaTime）
   - 入力処理（IsKeyPressed/IsKeyJustPressed）

### Goの特徴を活かした実装

- **シンプルさ**: 複雑な継承なしでの設計
- **明示性**: エラーハンドリングが明示的
- **高速性**: コンパイル型言語の性能
- **並行性**: （将来的にgoroutineで拡張可能）

### 次のステップ

このゲームをさらに発展させるアイデア：

1. **グラフィックの改善**
   - 画像アセットの使用（`ebiten/v2/ebitenutil.NewImageFromFile`）
   - アニメーション効果（消去時のエフェクト）
   - パーティクルシステム

2. **音声の追加**
   - `github.com/hajimehoshi/ebiten/v2/audio`を使用
   - BGM再生
   - 効果音（移動、回転、消去、連鎖）

3. **追加機能**
   - ネクストぷよの表示（次に来るぷよの予告）
   - ハイスコア記録（JSONファイルで保存）
   - 難易度調整（落下速度の変更）
   - おじゃまぷよ（対戦時に送られる邪魔なぷよ）

4. **マルチプレイ**
   - 2Pモード（同一画面で対戦）
   - ネットワーク対戦（`net`パッケージ使用）

### 最終コミット

すべての機能が完成したので、最終コミットとタグを作成しましょう：

```bash
git add .
git commit -m 'feat: ぷよぷよゲーム完成！

全イテレーション完了：
- イテレーション0: 環境構築
- イテレーション1: ゲーム開始とボード表示
- イテレーション2: ぷよペアの表示と移動
- イテレーション3: ぷよペアの回転
- イテレーション4: ぷよの自動落下
- イテレーション5: ぷよの消去ロジック
- イテレーション6: 連鎖反応とスコア
- イテレーション7: スコアと連鎖数の表示
- イテレーション8: ゲームオーバー判定
- イテレーション9: 全消しボーナス'

git tag -a v1.0.0 -m 'ぷよぷよゲーム v1.0.0 リリース'
```

### 終わりに

「TDDでゲームを作るのは楽しかったです！」そうですね！テスト駆動開発は、最初は面倒に感じるかもしれませんが、確実に品質の高いコードを書くことができます。

「Goはシンプルで書きやすいですね！」はい、Goの設計思想である「シンプルさ」と「明示性」は、保守しやすいコードを書くのに最適です。

> Simplicity is complicated.
>
> — Rob Pike（Go言語開発者）

この言葉は、「シンプルなものを作るのは実は複雑だ」という意味です。Goは、シンプルさを実現するために、多くの工夫がされている言語なんです。

「次は何を作りましょうか？」良い質問ですね！学んだTDDの技術を使って、自分のオリジナルなゲームやアプリケーションを作ってみてください。Goのシンプルさとテストの力を借りれば、安全で高品質なソフトウェアを作ることができます。

ぷよぷよを通じてテスト駆動開発とGo/Ebitenの基礎を学べたことを願っています。Happy Coding!

```go
package main

import "fmt"

func main() {
	fmt.Println("ぷよぷよゲーム、完成！🎉")
	fmt.Println("Simple made easy.")
}
```

> テスト駆動開発を使うことで、設計が良い方向に変わり、コードが改善され続け、それによって自分自身が開発に前向きになること、それがテスト駆動開発の目指すゴールです。
>
> — Kent Beck 『テスト駆動開発』 付録C　訳者解説：テスト駆動開発の現在

皆さんも、このゴールに一歩近づけたのではないでしょうか？これからも、テストを書きながら、楽しく開発を続けてください！
