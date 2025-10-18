---
title: テスト駆動開発から始めるScala入門 ~ソフトウェア開発の三種の神器を準備する~
description: 
published: true
date: 2025-07-18T01:43:43.748Z
tags: 
editor: markdown
dateCreated: 2025-07-18T01:43:43.748Z
---

# エピソード2

## 初めに

この記事は [テスト駆動開発から始めるScala入門 ~2時間でTDDとリファクタリングのエッセンスを体験する~](テスト駆動開発から始めるScala入門1.md) の続編です。

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

``` bash
$ git commit -m 'refactor: メソッドの抽出'
```

この書式は
[Angularルール](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#type)に従っています。具体的には、それぞれのコミットメッセージはヘッダ、ボディ、フッタで構成されています。ヘッダはタイプ、スコープ、タイトルというフォーマットで構成されています。

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

では **自動化** の準備に入りたいのですがそのためにはいくつかの外部ライブラリを利用する必要があります。そのためのツールが **sbt** です。

> sbtとは、Scalaで記述されたビルドツールで、Scalaプロジェクトの依存関係管理、コンパイル、テスト実行、パッケージング等を行います。
> 
> —  [公式ドキュメント](https://www.scala-sbt.org/)

**sbt** はすでに何度か使っています。例えばエピソード1の初めの依存関係設定などです。

``` bash
$ sbt test
```

これまでもこのようにして必要な外部ライブラリを使用してきましたが、開発に必要なツールをより組織的に管理していきましょう。そのような管理を効率的に行う仕組みがScalaには用意されています。それが **sbtプラグイン** です。

> sbtプラグインとは、sbtの機能を拡張するためのライブラリで、コード品質チェック、テストカバレッジ、自動フォーマット等の機能を提供します。
> 
> —  [sbt Plugin Tutorial](https://www.scala-sbt.org/1.x/docs/Plugins.html)

まず、`project/plugins.sbt` にプラグインの設定を追加しましょう。

```scala
addSbtPlugin("org.scalameta" % "sbt-scalafmt" % "2.5.0")
addSbtPlugin("org.wartremover" % "sbt-wartremover" % "3.1.3")
addSbtPlugin("org.scoverage" % "sbt-scoverage" % "2.0.9")
addSbtPlugin("io.spray" % "sbt-revolver" % "0.10.0")
```

そして `build.sbt` でプラグインを有効化します。

```scala
ThisBuild / scalaVersion := "3.3.3"
ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / organization := "com.example"
ThisBuild / organizationName := "example"

lazy val root = (project in file("."))
  .settings(
    name := "fizzbuzz-scala",
    libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.18" % Test
  )
  .enablePlugins(ScalafmtPlugin)
```

これで次の準備ができました。

### 静的コード解析

良いコードを書き続けるためにはコードの品質を維持していく必要があります。エピソード1では **テスト駆動開発** によりプログラムを動かしながら品質の改善していきました。出来上がったコードに対する品質チェックの方法として **静的コード解析** があります。Scala用 **静的コード解析** ツール[WartRemover](https://www.wartremover.org/) を使って確認してみましょう。

プラグインの設定を `build.sbt` に追加します：

```scala
lazy val root = (project in file("."))
  .settings(
    name := "fizzbuzz-scala",
    libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.18" % Test,
    wartremoverWarnings ++= Warts.unsafe
  )
  .enablePlugins(ScalafmtPlugin)
```

静的コード解析を実行してみましょう：

``` bash
$ sbt compile
```

WartRemoverは以下のような問題を検出してくれます：
- Null参照の使用
- var（可変変数）の不適切な使用
- Anyの使用
- 例外の不適切な使用

例えば、以下のコードでは警告が出力されます：

```scala
// 警告が出るコード例
def badExample(): Any = {
  var x = 1  // var使用の警告
  x = 2
  null      // null使用の警告
}
```

このような問題を事前に発見することで、より安全で保守しやすいコードを書くことができます。

次に、コードフォーマットツールのScalafmtを設定します。`.scalafmt.conf` ファイルを作成して設定を追加しましょう：

```conf
version = "3.7.17"
runner.dialect = scala3

maxColumn = 100
indent.main = 2
indent.callSite = 2
indent.ctrlSite = 2
indent.defnSite = 2
indent.caseSite = 2

rewrite.rules = [RedundantBraces, RedundantParens, SortModifiers]
rewrite.redundantBraces.stringInterpolation = true
```

フォーマットチェックを実行してみましょう：

``` bash
$ sbt scalafmtCheck
```

自動フォーマットを適用する場合は：

``` bash
$ sbt scalafmt
```

セットアップができたのでここでコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: 静的コード解析セットアップ'
```

### コードカバレッジ

静的コードコード解析による品質の確認はできました。では動的なテストに関してはどうでしょうか？ **コードカバレッジ** を確認する必要あります。

> コード網羅率（コードもうらりつ、英: Code coverage
> ）コードカバレッジは、ソフトウェアテストで用いられる尺度の1つである。プログラムのソースコードがテストされた割合を意味する。この場合のテストはコードを見ながら行うもので、ホワイトボックステストに分類される。
> 
> —  ウィキペディア 

Scala用 **コードカバレッジ** 検出プログラムとして [scoverage](https://github.com/scoverage/sbt-scoverage)を使います。`build.sbt`に設定を追加しましょう。

```scala
lazy val root = (project in file("."))
  .settings(
    name := "fizzbuzz-scala",
    libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.18" % Test,
    wartremoverWarnings ++= Warts.unsafe,
    coverageEnabled := true,
    coverageMinimumStmtTotal := 80,
    coverageFailOnMinimum := false,
    coverageHighlighting := true
  )
  .enablePlugins(ScalafmtPlugin)
```

コードカバレッジを有効にしてテストを実施します。

``` bash
$ sbt clean coverage test coverageReport
```

テスト実行後に `target/scala-3.3.3/scoverage-report` フォルダが作成されます。その中の `index.html` を開くとカバレッジ状況を確認できます。

カバレッジレポートには以下の情報が含まれます：
- ステートメントカバレッジ: 実行された文の割合
- ブランチカバレッジ: 実行された分岐の割合
- ファイル別のカバレッジ詳細

例えば、以下のようなレポートが生成されます：

```
[info] Statement coverage.: 100.00%
[info] Branch coverage....: 100.00%
[info] Coverage reports completed
```

カバレッジが低い場合は、不足しているテストケースを追加する必要があります。セットアップが完了したらコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: コードカバレッジセットアップ'
```

### タスクランナー

ここまででテストの実行、静的コード解析、コードフォーマット、コードカバレッジを実施することができるようになりました。でもコマンドを実行するのにそれぞれコマンドを覚えておくのは面倒ですよね。例えばテストの実行は

``` bash
$ sbt test
```

このようにしていました。では静的コードの解析はどうやりましたか？フォーマットはどうやりましたか？調べるのも面倒ですよね。いちいち調べるのが面倒なことは全部 **タスクランナー** にやらせるようにしましょう。

> タスクランナーとは、アプリケーションのビルドなど、一定の手順で行う作業をコマンド一つで実行できるように予めタスクとして定義したものです。

Scalaの **タスクランナー** は `sbt` 自体です。sbtでは独自のタスクを定義することができます。

早速、カスタムタスクを作成しましょう。`build.sbt` にタスクを追加します：

```scala
lazy val root = (project in file("."))
  .settings(
    name := "fizzbuzz-scala",
    libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.18" % Test,
    wartremoverWarnings ++= Warts.unsafe,
    coverageEnabled := true,
    coverageMinimumStmtTotal := 80,
    coverageFailOnMinimum := false,
    coverageHighlighting := true
  )
  .enablePlugins(ScalafmtPlugin)

// カスタムタスクの定義
lazy val format = taskKey[Unit]("Format source code")
format := {
  (Compile / scalafmt).value
  (Test / scalafmt).value
}

lazy val formatCheck = taskKey[Unit]("Check source code formatting")
formatCheck := {
  (Compile / scalafmtCheck).value
  (Test / scalafmtCheck).value
}

lazy val lint = taskKey[Unit]("Run static analysis")
lint := {
  (Compile / compile).value
}

lazy val coverage = taskKey[Unit]("Run tests with coverage")
coverage := {
  (Test / coverageReport).value
}

lazy val check = taskKey[Unit]("Run all quality checks")
check := {
  formatCheck.value
  lint.value
  (Test / test).value
  coverage.value
}
```

タスクが登録されたか確認してみましょう。

``` bash
$ sbt tasks | grep -E "(format|lint|coverage|check)"
```

カスタムタスクを実行してみます：

``` bash
# フォーマットチェック
$ sbt formatCheck

# 静的解析実行
$ sbt lint

# テストとカバレッジ実行
$ sbt coverage

# 全ての品質チェック実行
$ sbt check
```

`check` タスクを実行することで、フォーマットチェック、静的解析、テスト、カバレッジまで一度に実行できます。

セットアップができたのでコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: タスクランナーセットアップ'
```

### タスクの自動化

良いコードを書くためのタスクをまとめることができました。でも、どうせなら自動で実行できるようにしたいですよね。sbtには **ファイル監視機能** が組み込まれています。

sbtの `~` 接頭辞を使うことで、ファイルの変更を監視してタスクを自動実行できます。

> sbtのファイル監視機能を使うと、ソースファイルが変更されるたびに指定したタスクが自動実行されます。これにより、コードを書きながらリアルタイムでテストやフォーマットチェックを行うことができます。

以下のコマンドで自動監視を開始できます：

``` bash
# テストの自動実行
$ sbt "~ test"

# フォーマットチェックの自動実行  
$ sbt "~ formatCheck"

# 全ての品質チェックの自動実行
$ sbt "~ check"
```

より高度な自動化のため、sbt-revolverプラグインも活用できます。すでに `project/plugins.sbt` に追加済みです：

```scala
addSbtPlugin("io.spray" % "sbt-revolver" % "0.10.0")
```

sbt-revolverを使うと、コードの変更を検知してアプリケーションを自動再起動できます：

``` bash
# アプリケーションの自動再起動
$ sbt reStart

# 停止
$ sbt reStop
```

開発時のワークフロー例：

1. ターミナルで `sbt "~ test"` を実行してファイル監視を開始
2. コードを編集・保存
3. 自動的にテストが実行される
4. テストが失敗した場合は、コードを修正して再度保存
5. 自動的にテストが再実行される

この自動化により、**レッド→グリーン→リファクタ** のTDDサイクルをより効率的に回すことができます。

監視を停止するには `Ctrl+C` を押すか、sbtコンソールで `Enter` キーを押します。

```bash
# ファイル監視の開始
$ sbt
sbt:fizzbuzz-scala> ~ test
[info] 1. Monitoring source files for fizzbuzz-scala/test...
[info]    Press <enter> to interrupt or '?' for more options.
# ファイルを変更すると自動でテストが実行される
# Enter キーで監視停止
```

セットアップができたのでコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: タスクの自動化'
```

これで [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) の最後のアイテムの準備ができました。次回の開発からは最初にコマンドラインで `sbt "~ check"` を実行すれば良いコードを書くためのタスクを自動でやってくるようになるのでコードを書くことに集中できるようになりました。では、次のエピソードに進むとしましょう。
