---
title: テスト駆動開発から始めるGo入門 ~ソフトウェア開発の三種の神器を準備する~
description: 
published: true
date: 2025-07-10T05:18:51.180Z
tags: 
editor: markdown
dateCreated: 2025-07-02T05:12:08.090Z
---

# エピソード2

## 初めに

この記事は [テスト駆動開発から始めるGo入門1](./テスト駆動開発から始めるGo入門1.md) の続編です。

## 自動化から始めるテスト駆動開発

エピソード1ではテスト駆動開発のゴールが **動作するきれいなコード** であることを学びました。では、良いコードを書き続けるためには何が必要になるでしょうか？それは[ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works)と呼ばれるものです。

> 今日のソフトウェア開発の世界において絶対になければならない3つの技術的な柱があります。
> 三本柱と言ったり、三種の神器と言ったりしていますが、それらは
> 
>   - バージョン管理
> 
>   - テスティング
> 
>   - 自動化
> 
> の3つです。
> 
> —  https://t-wada.hatenablog.jp/entry/clean-code-that-works 

**バージョン管理** と **テスティング** に関してはエピソード1で触れました。本エピソードでは最後の **自動化** に関しての解説と次のエピソードに備えたセットアップ作業を実施しておきたいと思います。ですがその前に **バージョン管理** で1つだけ解説しておきたいことがありますのでそちらから進めて行きたいと思います。

### コミットメッセージ

これまで作業の区切りにごとにレポジトリにコミットしていましたがその際に以下のような書式でメッセージを書いていました。

```bash
$ git commit -m 'refactor: メソッドの抽出'
```

この書式は [Angularルール](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#type)に従っています。具体的には、それぞれのコミットメッセージはヘッダ、ボディ、フッタで構成されています。ヘッダはタイプ、スコープ、タイトルというフォーマットで構成されています。

    <タイプ>(<スコープ>): <タイトル>
    <空行>
    <ボディ>
    <空行>
    <フッタ>

ヘッダは必須です。 ヘッダのスコープは任意です。 コミットメッセージの長さは50文字までにしてください。

(そうすることでその他のGitツールと同様にGitHub上で読みやすくなります。)

コミットのタイプは次を用いて下さい。

  - feat: A new feature (新しい機能)

  - fix: A bug fix (バグ修正)

  - docs: Documentation only changes (ドキュメント変更のみ)

  - style: Changes that do not affect the meaning of the code
    (white-space, formatting, missing semi-colons, etc) (コードに影響を与えない変更)

  - refactor: A code change that neither fixes a bug nor adds a feature
    (機能追加でもバグ修正でもないコード変更)

  - perf: A code change that improves performance (パフォーマンスを改善するコード変更)

  - test: Adding missing or correcting existing tests
    (存在しないテストの追加、または既存のテストの修正)

  - chore: Changes to the build process or auxiliary tools and libraries
    such as documentation generation
    (ドキュメント生成のような、補助ツールやライブラリやビルドプロセスの変更)

コミットメッセージにつけるプリフィックスに関しては [【今日からできる】コミットメッセージに 「プレフィックス」をつけるだけで、開発効率が上がった話](https://qiita.com/numanomanu/items/45dd285b286a1f7280ed)を参照ください。

### パッケージマネージャ

では **自動化** の準備に入りたいのですがそのためにはいくつかの外部プログラムを利用する必要があります。そのためのツールが **Go modules** です。

> Go modulesとは、Goで記述されたサードパーティ製のライブラリを管理するためのツールで、Go modulesで扱うライブラリをmoduleと呼びます。
> 
> — Go公式ドキュメント

**Go modules** はすでに何度か使っています。例えばエピソード1の初めの `testify` のインストールなどです。

```bash
$ go get github.com/stretchr/testify
```

では、これからもこのようにして必要な外部プログラムを一つ一つインストールしていくのでしょうか？また、開発用マシンを変えた時にも同じことを繰り返さないといけないのでしょうか？面倒ですよね。そのような面倒なことをしないで済む仕組みがGoには用意されています。それが **go.mod** です。

> go.modとは、作成したアプリケーションがどのmoduleに依存しているか、そしてインストールしているバージョンはいくつかという情報を管理するためのファイルです。
> 
> — Go公式ドキュメント

**go.mod** を初期化してmoduleを束ねましょう。

```bash
$ go mod init go-tdd-tutorial
```

`go.mod` が作成されます。

```go
module go-tdd-tutorial

go 1.21

require (
	github.com/stretchr/testify v1.8.4
)

require (
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
```

必要に応じて `go mod tidy` でmoduleを整理します。

```bash
$ go mod tidy
```

これで次の準備ができました。

### 静的コード解析

良いコードを書き続けるためにはコードの品質を維持していく必要があります。エピソード1では **テスト駆動開発** によりプログラムを動かしながら品質の改善していきました。出来上がったコードに対する品質チェックの方法として **静的コード解析** があります。Go用 **静的コード解析** ツール[golangci-lint](https://golangci-lint.run/) を使って確認してみましょう。

まず、golangci-lintをインストールします。

```bash
$ go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
```

設定ファイル `.golangci.yml` を作成します。

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
    min-complexity: 10
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

静的解析を実行してみましょう。

```bash
$ golangci-lint run
```

何か指摘があるかもしれません。golangci-lintの詳細に関しては [golangci-lint公式ドキュメント](https://golangci-lint.run/)を参照ください。

自動で修正できるところは修正してもらいましょう。

```bash
$ golangci-lint run --fix
```

まだ、自動修正できなかった部分があるかもしれません。この部分はチェック対象から外すか、ルールを調整することにしましょう。

`.golangci.yml` を調整します：

```yaml
issues:
  exclude-rules:
    - path: _test\.go
      linters:
        - gosec
        - goconst
    - text: "should have comment or be unexported"
      linters:
        - revive
```

再度チェックを実行します。

```bash
$ golangci-lint run
```

セットアップができたのでここでコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: 静的コード解析セットアップ'
```

### コードフォーマッタ

良いコードであるためにはフォーマットも大切な要素です。

> 優れたソースコードは「目に優しい」ものでなければいけない。
> 
> — リーダブルコード 

Goには標準のフォーマットアプリケーションとして [gofmt](https://golang.org/cmd/gofmt/) があります。これを使って確認してみましょう。以下のコードのフォーマットをわざと崩してみます。

```go
package main

import "errors"

type Calculator struct{}

func NewCalculator() *Calculator {
	return &Calculator{}
}

func (c *Calculator) Add(a, b int) int {
       return a+b
}

func (c *Calculator) Subtract(a, b int) int {
    return a-b
}

func (c *Calculator) Multiply(a, b int) int {
     return a * b
}

func (c *Calculator) Divide(a, b int) (float64, error) {
	if b==0{
		return 0, errors.New("ゼロで割ることはできません")
}
	return float64(a)/float64(b), nil
}
```

フォーマットをチェックしてみます。

```bash
$ gofmt -d .
```

自動修正します。

```bash
$ gofmt -w .
```

```go
package main

import "errors"

type Calculator struct{}

func NewCalculator() *Calculator {
	return &Calculator{}
}

func (c *Calculator) Add(a, b int) int {
	return a + b
}

func (c *Calculator) Subtract(a, b int) int {
	return a - b
}

func (c *Calculator) Multiply(a, b int) int {
	return a * b
}

func (c *Calculator) Divide(a, b int) (float64, error) {
	if b == 0 {
		return 0, errors.New("ゼロで割ることはできません")
	}
	return float64(a) / float64(b), nil
}
```

フォーマットが修正されたことが確認できましたね。さらに、`goimports`を使用すると、importの自動整理も行えます。

```bash
$ go install golang.org/x/tools/cmd/goimports@latest
$ goimports -w .
```

### コードカバレッジ

静的コード解析による品質の確認はできました。では動的なテストに関してはどうでしょうか？ **コードカバレッジ** を確認する必要があります。

> コード網羅率（コードもうらりつ、英: Code coverage ）コードカバレッジは、ソフトウェアテストで用いられる尺度の1つである。プログラムのソースコードがテストされた割合を意味する。この場合のテストはコードを見ながら行うもので、ホワイトボックステストに分類される。
> 
> — ウィキペディア 

Goには **コードカバレッジ** 機能が組み込まれています。

テストを実施します。

```bash
$ go test -coverprofile=coverage.out ./...
$ go tool cover -html=coverage.out -o coverage.html
```

テスト実行後に `coverage.html` が作成されます。このファイルを開くとカバレッジ状況を確認できます。セットアップが完了したらコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: コードカバレッジセットアップ'
```

### タスクランナー

ここまででテストの実行、静的コード解析、コードフォーマット、コードカバレッジを実施することができるようになりました。でもコマンドを実行するのにそれぞれコマンドを覚えておくのは面倒ですよね。例えばテストの実行は

```bash
$ go test -v ./...
=== RUN   TestCalculator_Add
=== RUN   TestCalculator_Add/正の数の加算
=== RUN   TestCalculator_Add/負の数の加算
=== RUN   TestCalculator_Add/ゼロの加算
=== RUN   TestCalculator_Add/大きな数の加算
--- PASS: TestCalculator_Add (0.00s)
    --- PASS: TestCalculator_Add/正の数の加算 (0.00s)
    --- PASS: TestCalculator_Add/負の数の加算 (0.00s)
    --- PASS: TestCalculator_Add/ゼロの加算 (0.00s)
    --- PASS: TestCalculator_Add/大きな数の加算 (0.00s)
...
PASS
ok  	go-tdd-tutorial	0.002s
```

このようにしていました。では静的コードの解析はどうやりましたか？フォーマットはどうやりましたか？調べるのも面倒ですよね。いちいち調べるのが面倒なことは全部 **タスクランナー** にやらせるようにしましょう。

> タスクランナーとは、アプリケーションのビルドなど、一定の手順で行う作業をコマンド一つで実行できるように予めタスクとして定義したものです。
> 
> — Go公式ドキュメント

Goの **タスクランナー** は `go-task` です。

> go-taskはGoで書かれたタスクランナーです。YAMLファイル（Taskfile.yml）でタスクを定義し、タスクの実行や登録されたタスクの一覧表示を行えます。
> 
> — go-task公式ドキュメント

早速、テストタスクから作成しましょう。まず`go-task`をインストールします。

```bash
$ go install github.com/go-task/task/v3/cmd/task@latest
```

`Taskfile.yml` を作ります。

```yaml
version: '3'

vars:
  BINARY_NAME: go-tdd-tutorial
  BUILD_DIR: bin

tasks:
  default:
    desc: ヘルプを表示
    cmds:
      - task --list

  test:
    desc: テストを実行
    cmds:
      - echo "テストを実行中..."
      - go test -v ./...

  test-coverage:
    desc: テストカバレッジを実行
    cmds:
      - echo "テストカバレッジを実行中..."
      - go test -coverprofile=coverage.out ./...
      - go tool cover -html=coverage.out -o coverage.html
      - echo "カバレッジレポートが coverage.html に作成されました"

  lint:
    desc: 静的解析を実行
    cmds:
      - echo "静的解析を実行中..."
      - cmd: command -v golangci-lint >/dev/null 2>&1
        ignore_error: true
      - export PATH=$PATH:$(go env GOPATH)/bin && golangci-lint run

  fmt:
    desc: コードフォーマットを実行
    cmds:
      - echo "コードフォーマットを実行中..."
      - go fmt ./...

  vet:
    desc: go vetを実行
    cmds:
      - echo "go vetを実行中..."
      - go vet ./...

  build:
    desc: アプリケーションをビルド
    cmds:
      - echo "アプリケーションをビルド中..."
      - mkdir -p {{.BUILD_DIR}}
      - go build -o {{.BUILD_DIR}}/{{.BINARY_NAME}} .

  run:
    desc: アプリケーションを実行
    cmds:
      - echo "アプリケーションを実行中..."
      - go run .

  clean:
    desc: クリーンアップ
    cmds:
      - echo "クリーンアップ中..."
      - go clean
      - rm -rf {{.BUILD_DIR}}
      - rm -f coverage.out coverage.html

  check:
    desc: 品質チェック（フォーマット、vet、lint、テスト）
    deps: [fmt, vet, lint, test]

  fix:
    desc: 自動修正（フォーマット）
    deps: [fmt]

  deps:
    desc: 依存関係のダウンロード
    cmds:
      - echo "依存関係をダウンロード中..."
      - go mod download
      - go mod tidy
```

タスクが登録されたか確認してみましょう。

```bash
$ task --list
task: Available tasks for this project:
* build:               アプリケーションをビルド
* check:               品質チェック（フォーマット、vet、lint、テスト）
* clean:               クリーンアップ
* default:             ヘルプを表示
* deps:                依存関係のダウンロード
* fix:                 自動修正（フォーマット）
* fmt:                 コードフォーマットを実行
* lint:                静的解析を実行
* run:                 アプリケーションを実行
* test:                テストを実行
* test-coverage:       テストカバレッジを実行
* vet:                 go vetを実行
```

タスクが登録されたことが確認できたのでタスクを実行します。

```bash
$ task test
task: [test] echo "テストを実行中..."
テストを実行中...
task: [test] go test -v ./...
=== RUN   TestCalculator_Add
=== RUN   TestCalculator_Add/正の数の加算
=== RUN   TestCalculator_Add/負の数の加算
=== RUN   TestCalculator_Add/ゼロの加算
=== RUN   TestCalculator_Add/大きな数の加算
--- PASS: TestCalculator_Add (0.00s)
    --- PASS: TestCalculator_Add/正の数の加算 (0.00s)
    --- PASS: TestCalculator_Add/負の数の加算 (0.00s)
    --- PASS: TestCalculator_Add/ゼロの加算 (0.00s)
    --- PASS: TestCalculator_Add/大きな数の加算 (0.00s)
...
PASS
ok  	go-tdd-tutorial	0.002s
```

テストタスクが実行されたことが確認できたので引き続き静的コードの解析タスクを実行します。

```bash
$ task lint
task: [lint] echo "静的解析を実行中..."
静的解析を実行中...
task: [lint] command -v golangci-lint >/dev/null 2>&1
task: [lint] export PATH=$PATH:$(go env GOPATH)/bin && golangci-lint run
```

続いてフォーマットタスクも実行してみましょう。

```bash
$ task fmt
task: [fmt] echo "コードフォーマットを実行中..."
コードフォーマットを実行中...
task: [fmt] go fmt ./...
```

品質チェックを一括で実行してみましょう。

```bash
$ task check
task: [fmt] echo "コードフォーマットを実行中..."
コードフォーマットを実行中...
task: [fmt] go fmt ./...
task: [vet] echo "go vetを実行中..."
go vetを実行中...
task: [vet] go vet ./...
task: [lint] echo "静的解析を実行中..."
静的解析を実行中...
task: [lint] command -v golangci-lint >/dev/null 2>&1
task: [lint] export PATH=$PATH:$(go env GOPATH)/bin && golangci-lint run
task: [test] echo "テストを実行中..."
テストを実行中...
task: [test] go test -v ./...
=== RUN   TestCalculator_Add
...
PASS
ok  	go-tdd-tutorial	0.002s
```

セットアップができたのでコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: タスクランナーセットアップ'
```

### タスクの自動化

良いコードを書くためのタスクをまとめることができました。でも、どうせなら自動で実行できるようにしたいですよね。タスクを自動実行するためのツールを追加します。[fswatch](https://github.com/emcrisostomo/fswatch)を使ってファイル監視による自動実行を実現します。

fswatch をインストールします：

```bash
# macOS
brew install fswatch

# Ubuntu/Debian
sudo apt-get install fswatch
```

`Taskfile.yml` にwatch用のタスクを追加します：

```yaml
  watch:
    desc: ファイル監視による自動チェック
    cmds:
      - echo "ファイル監視による自動チェックを開始..."
      - task: watch-test

  watch-test:
    desc: テストのwatch実行
    cmds:
      - echo "テストのwatch実行を開始..."
      - |
        if command -v fswatch >/dev/null 2>&1; then
          fswatch -o . | xargs -n1 -I{} task test
        else
          echo "fswatch がインストールされていません。"
          echo "Ubuntu/Debian: sudo apt-get install fswatch"
          echo "macOS: brew install fswatch"
          exit 1
        fi
```

自動実行タスクを起動しましょう。

```bash
$ task watch
```

起動したら `calculator.go` を編集してテストが自動実行されるか確認しましょう。

```go
func (c *Calculator) Add(a, b int) int {
	return a + b + 1 // わざと間違いを入れる
}
```

ファイルを保存すると自動でテストが実行され、テストが失敗することが確認できます。コードを元に戻してテストをパスするようにしておきましょう。

より高度な自動化のために、Gitフックを使って、コミット前に自動でテストとリントを実行する仕組みも導入できます：

`.githooks/pre-commit` ファイルを作成：

```bash
#!/bin/sh
# pre-commit hook for Go TDD Tutorial
# コミット前に品質チェックを自動実行

echo "pre-commit hook: 品質チェックを実行中..."

# go-taskのパスを設定
export PATH=$PATH:$(go env GOPATH)/bin

# コードフォーマットチェック
if ! task fmt >/dev/null 2>&1; then
    echo "❌ フォーマットエラーが検出されました"
    exit 1
fi

# 静的解析
if command -v golangci-lint >/dev/null 2>&1; then
    if ! task lint >/dev/null 2>&1; then
        echo "❌ 静的解析エラーが検出されました"
        exit 1
    fi
else
    echo "⚠️  golangci-lintがインストールされていません"
fi

# テスト実行
if ! task test >/dev/null 2>&1; then
    echo "❌ テストが失敗しました"
    exit 1
fi

echo "✅ 品質チェック完了 - コミット可能です"
exit 0
```

セットアップスクリプト `setup-hooks.sh` を作成：

```bash
#!/bin/bash
# Gitフックをセットアップするスクリプト

echo "Gitフックをセットアップ中..."

# プロジェクトルートディレクトリに移動
cd "$(dirname "$0")"

# .git/hooksディレクトリが存在しない場合は作成
if [ ! -d ".git/hooks" ]; then
    echo ".git/hooksディレクトリが見つかりません。Gitリポジトリを初期化してください。"
    exit 1
fi

# pre-commitフックをコピー
cp .githooks/pre-commit .git/hooks/pre-commit

# 実行権限を付与
chmod +x .git/hooks/pre-commit

echo "✅ Gitフックのセットアップが完了しました"
echo "コミット前に自動で品質チェックが実行されます"
```

これで品質チェックを自動化する環境が整いました。セットアップが完了したらコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: タスクの自動化'
```

これで [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) の最後のアイテムの準備ができました。次回の開発からは最初にコマンドラインで `task watch` を実行すれば良いコードを書くためのタスクを自動でやってくれるようになるのでコードを書くことに集中できるようになりました。では、次のエピソードに進むとしましょう。

## まとめ

このエピソードでは、Goでのテスト駆動開発における **ソフトウェア開発の三種の神器** を準備しました：

### 1. バージョン管理（Git）
- Angularルールに従ったコミットメッセージの書式
- 変更履歴の適切な管理
- Gitフックによる自動品質チェック

### 2. テスティング（Go testing + testify）
- 自動テストの実行環境
- コードカバレッジの測定
- テスト駆動開発のサイクル

### 3. 自動化（Taskfile.yml + fswatch）
- タスクランナーによるコマンドの統一
- ファイル変更の監視と自動実行
- 品質チェックの自動化

### セットアップした内容

| ツール | 目的 | コマンド |
|--------|------|----------|
| Go modules | パッケージ管理 | `go mod tidy` |
| Go testing | テスト実行・カバレッジ | `task test`, `task test-coverage` |
| golangci-lint | 静的コード解析 | `task lint` |
| gofmt | コードフォーマット | `task fmt` |
| go vet | 静的解析 | `task vet` |
| fswatch | ファイル監視・自動実行 | `task watch` |
| go-task | タスクランナー | `task --list` |

これらのツールを使うことで、開発者は **良いコードを書くこと** に集中でき、品質管理に関する作業は自動化されます。次回のエピソードからは、この環境を活用してより高度なテスト駆動開発を実践していきます。

### 参考リンク

- [Go公式ドキュメント](https://golang.org/doc/)
- [Go Testing Package](https://golang.org/pkg/testing/)
- [testify - Testing toolkit](https://github.com/stretchr/testify)
- [golangci-lint](https://golangci-lint.run/)
- [go-task - A task runner / build tool that aims to be simpler and easier to use than GNU Make](https://taskfile.dev/)
- [fswatch - File change monitor](https://github.com/emcrisostomo/fswatch)
- [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works)
