---
title: テスト駆動開発から始めるKotlin入門2 ~ソフトウェア開発の三種の神器を準備する~
description: 
published: true
date: 2025-07-18T08:29:11.879Z
tags: 
editor: markdown
dateCreated: 2025-07-18T08:29:11.879Z
---

## はじめに

前回はKotlinとテスト駆動開発を使ってFizzBuzzプログラムを作りました。プログラムは動くものができたのですが、一人で開発していく上でまだ不便な部分があります。今回は開発していく上で便利になるツールを導入していきます。

### ソフトウェア開発の三種の神器

> よいソフトウェアを書くのは難しい。よいソフトウェアを書くコツを覚えるのにも時間がかかる。けれども、よいソフトウェアを書くのに役立つツールを知ることはできる。
> 
> 「よいコードを書くコツの一つは、よいツールを使うことだ。よいツールが自分のかわりに仕事をしてくれる。」
> 
> —  [和田卓人（t-wada）さん](https://twitter.com/t_wada) 

[和田卓人（t-wada）さん](https://twitter.com/t_wada) が提唱されている [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) を使ってよいソフトウェアを書くためのツールを準備していきます。

三種の神器とは以下のとおりです。

1. **バージョン管理システム**
2. **テスティングフレームワーク**  
3. **自動化**

この三種の神器について説明していきます。

#### バージョン管理システム

バージョン管理システムとは、ファイルの作成日時、変更日時、変更点などの履歴を管理するシステムです。これを使うことでファイルをバックアップしなくても、以前のファイルの状態を復元できたり、ファイルの変更内容を確認できたり、バックアップとしての役目も果たします。現在の主流は `Git` です。

#### テスティングフレームワーク

テスティングフレームワークとは、プログラムをテストするために使用するソフトウェアです。前回、プログラムの動作を確認するために対話的Kotlinシェル（REPL）にプログラムを入力していました。しかし、プログラムの変更を行った場合に前回実施した動作確認を再度実施するのは面倒ですよね。テスティングフレームワークを使うとテストプログラムを作成することで何度でも同じテストを自動実行できるようになります。Kotlinにはデフォルトで **JUnit** というテスティングフレームワークが使用できます。

#### 自動化

自動化とは、これまで手動で行っていた作業をツールを使って自動的に実行できるようにすることです。例えば、テストの実行、プログラムの品質をチェックしたり、プログラムのフォーマットを整えたりといった作業を自動化してくれます。Kotlinでは **Gradle** というビルドツールを使用して自動化を実現できます。

### 今回準備するツール

今回はKotlinでの開発に向けて以下のツールを準備していきます：

- **バージョン管理システム**: Git
- **テスティングフレームワーク**: JUnit（前回導入済み）
- **パッケージマネージャ**: Gradle
- **静的コード解析**: Detekt  
- **コードフォーマッタ**: ktlint
- **コードカバレッジ**: JaCoCo
- **タスクランナー**: Gradle
- **自動化**: Gradle Watch

それでは、ツールを一つずつ導入していきましょう。

## バージョン管理

バージョン管理にはGitを使用します。Gitは分散型バージョン管理システムです。前回のエピソードでプロジェクトをGitで管理するための初期化は済んでいると思いますが、改めて確認してみましょう。

Gitが初期化されているかどうかを確認します。

```bash
$ git status
On branch main
nothing to commit, working tree clean
```

上記のような出力がされればGitは初期化されています。もしも `fatal: not a git repository` のようなエラーが出力された場合は、以下のコマンドでGitを初期化してください。

```bash
$ git init
```

次に、リモートリポジトリの設定を確認します。GitHubなどにリポジトリを作成している場合は、リモートリポジトリの設定を行います。

```bash
$ git remote -v
origin  https://github.com/username/repository.git (fetch)
origin  https://github.com/username/repository.git (push)
```

リモートリポジトリが設定されていない場合は、以下のコマンドで設定します。

```bash
$ git remote add origin https://github.com/username/repository.git
```

これでバージョン管理の準備は完了です。

## コミットメッセージ

Gitを使ったバージョン管理では、変更をコミットする際にコミットメッセージを書きます。このコミットメッセージは後からコードの変更履歴を確認する際に重要な情報となります。

### Conventional Commits

コミットメッセージを書く際には、一定のルールに従って書くことで、後から変更履歴を確認しやすくなります。そのためのルールとして **Conventional Commits** という規約があります。

> Conventional Commits仕様は、コミットメッセージのための軽量な規約です。明確なコミット履歴を作成するための簡単なルールを提供します。この規約に従うことで、コミット履歴を元に自動化ツールを作成することが簡単になります。
> 
> — [Conventional Commits](https://www.conventionalcommits.org/ja/v1.0.0/)

Conventional Commitsでは、コミットメッセージを以下の形式で書きます：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### type（必須）

コミットの種類を表します。主要なtypeは以下のとおりです：

- **feat**: 新機能の追加
- **fix**: バグの修正
- **docs**: ドキュメントの変更
- **style**: コードの意味に影響しない変更（空白、フォーマットなど）
- **refactor**: バグ修正や機能追加ではないコードの変更
- **test**: テストの追加や修正
- **chore**: ビルドプロセスや補助ツールの変更

#### scope（任意）

変更された範囲を表します。例：`api`, `ui`, `database`など

#### description（必須）

変更内容の簡潔な説明

#### 例

```bash
feat: FizzBuzzクラスに数値から文字列生成機能を追加

fix: 15の倍数の場合にFizzBuzzが返されない問題を修正

docs: README.mdにプロジェクトの説明を追加

test: FizzBuzzクラスの単体テストを追加

chore: Gradleの依存関係を更新
```

このルールに従ってコミットメッセージを書くことで、変更履歴が分かりやすくなります。

## パッケージマネージャ

ソフトウェア開発では、様々な外部ライブラリを使用することがあります。これらのライブラリを手動で管理するのは大変な作業です。そこで **パッケージマネージャ** を使用します。

> パッケージマネージャとは、ソフトウェアのパッケージの検索、インストール、アップデート、削除などを自動化するツールです。
> 
> — Wikipedia

Kotlinでは **Gradle** というビルドツールがパッケージマネージャの役割も果たします。GradleはJavaプラットフォーム向けのビルド自動化ツールです。

### Gradleの設定

Kotlinプロジェクトでは、`build.gradle.kts`（Kotlin DSL）または`build.gradle`（Groovy DSL）ファイルでプロジェクトの設定を行います。今回はKotlin DSLを使用します。

プロジェクトのルートディレクトリに`build.gradle.kts`を作成します：

```kotlin
plugins {
    kotlin("jvm") version "2.0.0"
    application
}

group = "com.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
}

kotlin {
    jvmToolchain(21)
}

application {
    mainClass.set("MainKt")
}
```

#### plugins ブロック

使用するプラグインを指定します：

- `kotlin("jvm")`: KotlinでJVMアプリケーションを開発するためのプラグイン
- `application`: アプリケーションの実行やパッケージングを行うプラグイン

#### repositories ブロック

依存関係を取得するリポジトリを指定します。`mavenCentral()`は Maven Central リポジトリを使用することを意味します。

#### dependencies ブロック

プロジェクトで使用する外部ライブラリを指定します：

- `testImplementation(kotlin("test"))`: Kotlinの標準テストライブラリ
- `testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")`: JUnit 5テストフレームワーク

### Gradleのタスク実行

Gradleでは様々なタスクを実行できます：

```bash
# プロジェクトのビルド
$ ./gradlew build

# テストの実行
$ ./gradlew test

# アプリケーションの実行
$ ./gradlew run

# 利用可能なタスクの一覧表示
$ ./gradlew tasks
```

これでパッケージマネージャの設定は完了です。設定をコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: Gradleプロジェクトセットアップ'
```

## 静的コード解析

コードを書いていると、バグや品質の問題が混入することがあります。これらの問題を早期に発見するために **静的コード解析** ツールを使用します。

> 静的コード解析とは、プログラムを実行することなく、ソースコードを解析してバグやコーディング規約違反、セキュリティ上の問題などを検出する手法です。

Kotlinでは **Detekt** という静的コード解析ツールを使用できます。

### Detektの導入

`build.gradle.kts`にDetektプラグインを追加します：

```kotlin
plugins {
    kotlin("jvm") version "2.0.0"
    application
    id("io.gitlab.arturbosch.detekt") version "1.23.0"
}

group = "com.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
    detektPlugins("io.gitlab.arturbosch.detekt:detekt-formatting:1.23.0")
}

// Detekt configuration
detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom("$projectDir/config/detekt/detekt.yml")
}

// DetektタスクのJVMターゲット設定
tasks.withType<io.gitlab.arturbosch.detekt.Detekt>().configureEach {
    jvmTarget = "17"
}
```

### Detektの設定ファイル

プロジェクトに`config/detekt/detekt.yml`ファイルを作成して、Detektのルールをカスタマイズできます：

```yaml
# detekt.yml
autoCorrect: true

style:
  MaxLineLength:
    maxLineLength: 120
  
complexity:
  TooManyFunctions:
    active: false

formatting:
  ParameterListWrapping:
    active: false
```

### Detektの実行

以下のコマンドでDetektを実行できます：

```bash
# 静的解析の実行
$ ./gradlew detekt

# 自動修正を含む実行
$ ./gradlew detektMain --auto-correct
```

実行結果の例：

```
> Task :detektMain
Detekt found 3 issues.

/src/main/kotlin/FizzBuzz.kt:10:1: [style] MagicNumber: This expression contains a magic number. Consider defining it to a well named constant.
/src/main/kotlin/FizzBuzz.kt:15:1: [style] ReturnCount: Restrict the number of return statements in methods.

BUILD SUCCESSFUL in 2s
```

Detektは以下のような問題を検出します：

- **コード品質**: 複雑すぎるメソッド、長すぎる行など
- **バグの可能性**: nullポインタ例外の可能性、型キャストエラーなど  
- **スタイル**: コーディング規約違反、命名規則違反など
- **パフォーマンス**: 非効率なコード
- **セキュリティ**: セキュリティ上の問題

設定をコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: Detekt静的コード解析セットアップ'
```

## コードフォーマッタ

コードの書き方にはスタイルがあります。インデント、改行、スペースの使い方などです。チーム開発では、メンバー全員が同じスタイルでコードを書くことが重要です。**コードフォーマッタ** を使用することで、コードのスタイルを自動的に統一できます。

> コードフォーマッタとは、ソースコードを一定のスタイルに自動的に整形するツールです。

Kotlinでは **ktlint** というコードフォーマッタを使用できます。ktlintは、Kotlinの公式コーディング規約に準拠したフォーマッタです。

### ktlintの導入

`build.gradle.kts`にktlintプラグインを追加します：

```kotlin
plugins {
    kotlin("jvm") version "2.0.0"
    application
    id("io.gitlab.arturbosch.detekt") version "1.23.0"
    id("org.jlleitschuh.gradle.ktlint") version "11.5.1"
}

group = "com.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

// Detekt configuration
detekt {
    buildUponDefaultConfig = true
    allRules = false
    config.setFrom("$projectDir/config/detekt/detekt.yml")
}

// DetektタスクのJVMターゲット設定
tasks.withType<io.gitlab.arturbosch.detekt.Detekt>().configureEach {
    jvmTarget = "17"
}

// Ktlint configuration
ktlint {
    verbose.set(true)
    outputToConsole.set(true)
    coloredOutput.set(true)
    reporters {
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.CHECKSTYLE)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.JSON)
        reporter(org.jlleitschuh.gradle.ktlint.reporter.ReporterType.HTML)
    }
}
```

### ktlintの実行

以下のコマンドでktlintを実行できます：

```bash
# コードスタイルのチェック
$ ./gradlew ktlintCheck

# コードスタイルの自動修正
$ ./gradlew ktlintFormat
```

実行結果の例：

```
> Task :ktlintMainSourceSetCheck
/src/main/kotlin/FizzBuzz.kt:5:1: Unexpected indentation (4) (should be 8) (indent)
/src/main/kotlin/FizzBuzz.kt:10:17: Missing spacing after "," (comma-spacing)

2 problems (0 errors, 2 warnings)

BUILD FAILED in 1s
```

ktlintは以下のようなスタイル問題を検出・修正します：

- **インデント**: タブやスペースの統一
- **スペーシング**: 演算子、カンマ、括弧周りのスペース
- **改行**: 適切な位置での改行
- **インポート**: インポート文の整理
- **命名規則**: クラス名、メソッド名の規則

### 自動修正の例

修正前：
```kotlin
class FizzBuzz{
    fun generate(number:Int):String {
        if(number%15==0)return "FizzBuzz"
        if(number%3==0)return "Fizz"
        if(number%5==0)return "Buzz"
        return number.toString()
    }
}
```

修正後：
```kotlin
class FizzBuzz {
    fun generate(number: Int): String {
        if (number % 15 == 0) return "FizzBuzz"
        if (number % 3 == 0) return "Fizz"
        if (number % 5 == 0) return "Buzz"
        return number.toString()
    }
}
```

設定をコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: ktlintコードフォーマッタセットアップ'
```

## コードカバレッジ

テストを書いていると、「どの程度のコードがテストされているか」を知りたくなります。これを測定するのが **コードカバレッジ** です。

> コードカバレッジとは、テストによって実行されたソースコードの割合を測定する手法です。

Kotlinでは **JaCoCo**（Java Code Coverage）というツールでコードカバレッジを測定できます。

### JaCoCoの導入

`build.gradle.kts`にJaCoCoプラグインを追加します：

```kotlin
plugins {
    kotlin("jvm") version "2.0.0"
    application
    id("io.gitlab.arturbosch.detekt") version "1.23.0"
    id("org.jlleitschuh.gradle.ktlint") version "11.5.1"
    jacoco
}

group = "com.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.0")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    finalizedBy(tasks.jacocoTestReport)
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required = false
        csv.required = false
        html.outputLocation = layout.buildDirectory.dir("jacocoHtml")
    }
}
```

### JaCoCoの実行

テストを実行すると、自動的にコードカバレッジが測定されます：

```bash
# テスト実行（カバレッジも同時に実行される）
$ ./gradlew test

# カバレッジレポートのみ生成
$ ./gradlew jacocoTestReport
```

実行結果の例：

```
> Task :test
FizzBuzzTest > 3を渡したら文字列Fizzを返す() PASSED
FizzBuzzTest > 5を渡したら文字列Buzzを返す() PASSED
FizzBuzzTest > 15を渡したら文字列FizzBuzzを返す() PASSED

> Task :jacocoTestReport

BUILD SUCCESSFUL in 3s
```

### カバレッジレポートの確認

テスト実行後に `build/jacocoHtml` フォルダが作成されます。その中の `index.html` を開くとカバレッジ状況を確認できます。

```bash
# ブラウザでレポートを開く
$ open build/jacocoHtml/index.html
```

レポートには以下の情報が表示されます：

- **Line Coverage**: 実行された行の割合
- **Branch Coverage**: 実行された分岐の割合
- **Method Coverage**: 実行されたメソッドの割合
- **Class Coverage**: 実行されたクラスの割合

### カバレッジの例

```
Package         Line Coverage    Branch Coverage    Method Coverage
com.example     85% (17/20)      75% (6/8)         100% (4/4)
```

この例では：
- 20行中17行がテストで実行された（85%）
- 8つの分岐中6つがテストで実行された（75%）
- 4つのメソッドすべてがテストで実行された（100%）

コードカバレッジは品質の指標の一つですが、100%である必要はありません。重要なのは、重要な機能がしっかりテストされていることです。

設定をコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: JaCoCoコードカバレッジセットアップ'
```

## タスクランナー

ここまででテストの実行、静的コード解析、コードフォーマット、コードカバレッジを実施することができるようになりました。でもコマンドを実行するのにそれぞれのコマンドを覚えておくのは面倒ですよね。例えばテストの実行は：

```bash
$ ./gradlew test
```

では静的コード解析はどうやりましたか？フォーマットはどうやりましたか？調べるのも面倒ですよね。いちいち調べるのが面倒なことは全部 **タスクランナー** にやらせるようにしましょう。

> タスクランナーとは、アプリケーションのビルドなど、一定の手順で行う作業をコマンド一つで実行できるように予めタスクとして定義したものです。

Kotlinの **タスクランナー** は `Gradle` です。Gradleは単なるパッケージマネージャではなく、強力なタスクランナーでもあります。

### カスタムタスクの定義

`build.gradle.kts`にカスタムタスクを追加して、よく使うコマンドを簡単に実行できるようにします：

```kotlin
// カスタムタスクの定義
tasks.register("checkAll") {
    description = "全てのチェックを実行"
    group = "verification"
    dependsOn("ktlintCheck", "detekt", "test")
}

tasks.register("fixAll") {
    description = "自動修正可能な全ての問題を修正"
    group = "formatting"
    dependsOn("ktlintFormat")
    finalizedBy("detektMain")
}

tasks.register("qualityCheck") {
    description = "コード品質チェック"
    group = "verification"
    dependsOn("ktlintCheck", "detekt")
}
```

### タスクの実行

定義したタスクを実行できます：

```bash
# 利用可能なタスクの一覧表示
$ ./gradlew tasks

# 全てのチェックを実行
$ ./gradlew checkAll

# 自動修正を実行
$ ./gradlew fixAll

# コード品質チェックのみ実行
$ ./gradlew qualityCheck
```

実行結果の例：

```
> Task :ktlintCheck
> Task :detekt
> Task :test

BUILD SUCCESSFUL in 5s
```

### Gradle Wrapper

プロジェクトには `gradlew`（Unix/Linux/Mac）と `gradlew.bat`（Windows）というファイルがあります。これは **Gradle Wrapper** と呼ばれ、Gradleがインストールされていない環境でも同じバージョンのGradleを使用できるようにするツールです。

```bash
# Unix/Linux/Mac
$ ./gradlew build

# Windows
$ gradlew.bat build
```

チーム開発では、メンバー全員が同じバージョンのGradleを使用することが重要なので、Gradle Wrapperを使用することが推奨されます。

## 自動化

これまでに導入したツールを使って、開発作業を自動化しましょう。Gradleには **継続的ビルド** 機能があり、ファイルの変更を監視して自動的にタスクを実行できます。

### ファイル監視による自動実行

```bash
# ファイル変更を監視してテストを自動実行
$ ./gradlew test --continuous

# ファイル変更を監視して品質チェックを自動実行
$ ./gradlew qualityCheck --continuous
```

`--continuous`オプションを使用すると、ソースファイルが変更されるたびに自動的にタスクが実行されます。

実行結果の例：

```
> Task :qualityCheck

BUILD SUCCESSFUL in 2s

Waiting for changes to input files... (ctrl-d to exit)
<-------------> 0% EXECUTING
> :qualityCheck
```

この状態でKotlinファイルを編集すると、自動的に品質チェックが実行されます：

```
Change detected, executing build...

> Task :ktlintCheck
> Task :detekt

BUILD SUCCESSFUL in 1s

Waiting for changes to input files... (ctrl-d to exit)
```

### IDEとの連携

多くのIDEはGradleと連携して、以下のような自動化を提供しています：

- **保存時の自動フォーマット**: ファイル保存時にktlintFormatを実行
- **リアルタイム解析**: Detektによる静的解析結果をエディタに表示
- **テストの自動実行**: テストファイル変更時にテストを自動実行

これらの機能により、開発中にリアルタイムでコード品質を確認できます。

設定をコミットしておきましょう。

```bash
$ git add .
$ git commit -m 'chore: タスクの自動化セットアップ'
```

これで [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) の最後のアイテムの準備ができました。次回の開発からは最初にコマンドラインで `./gradlew checkAll` を実行すれば良いコードを書くためのタスクを自動で実行してくれるようになるので、コードを書くことに集中できるようになりました。

## まとめ

今回はKotlinでの開発に必要なツールを導入しました：

### 導入したツール

1. **バージョン管理システム**: Git
2. **テスティングフレームワーク**: JUnit（前回導入済み）
3. **パッケージマネージャ**: Gradle
4. **静的コード解析**: Detekt
5. **コードフォーマッタ**: ktlint
6. **コードカバレッジ**: JaCoCo
7. **タスクランナー**: Gradle
8. **自動化**: Gradle Watch

### よく使うコマンド

```bash
# 全てのチェックを実行
$ ./gradlew checkAll

# 自動修正を実行
$ ./gradlew fixAll

# テスト実行（カバレッジ付き）
$ ./gradlew test

# 継続的品質チェック
$ ./gradlew qualityCheck --continuous
```

これらのツールを使うことで、以下の利点が得られます：

- **品質の向上**: 静的解析とフォーマッタによりコードの品質が向上
- **効率の向上**: 自動化により手動作業が削減
- **一貫性の確保**: チーム全体で同じ品質基準を共有
- **早期発見**: 問題の早期発見と修正
- **集中力の向上**: コード品質管理から開放され、ロジックに集中可能

次のエピソードでは、これらのツールを活用してより高度なプログラミング技法を学んでいきましょう。
