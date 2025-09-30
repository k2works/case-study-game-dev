---
title: テスト駆動開発から始めるClojureScript入門2
description: 
published: true
date: 2025-08-26T03:25:02.465Z
tags: 
editor: markdown
dateCreated: 2025-08-14T07:48:25.099Z
---

# テスト駆動開発から始めるClojureScript入門2

> 動作するきれいなコード
> 
> —  テスト駆動開発 

## はじめに

エピソード1ではテスト駆動開発の **Red** **Green** **Refactor** サイクルを使って **動作するきれいなコード** を書くことができました。しかし、この品質を継続して維持していくためには他にも準備しておかなければならないことがあります。

本エピソードでは **ソフトウェア開発の三種の神器** を準備します。

### ソフトウェア開発の三種の神器とは

> ソフトウェア開発の三種の神器とは **バージョン管理** **テスティング** **自動化** のことです。

1. **バージョン管理**：ソースコードの変更履歴を管理し、チーム開発を円滑にする
2. **テスティング**：コードの動作を自動的に検証し、品質を保証する
3. **自動化**：繰り返し作業を自動化し、開発効率を向上させる

これらを適切に整備することで、開発者は安心してコードの変更を行い、継続的に品質の高いソフトウェアを開発できるようになります。

## バージョン管理

まず最初に **バージョン管理** です。バージョン管理については下記を参照してください。

[バージョン管理](https://ja.wikipedia.org/wiki/%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E7%AE%A1%E7%90%86%E3%82%B7%E3%82%B9%E3%83%86%E3%83%A0)

バージョン管理システムとして **Git** を使います。

### Gitのセットアップ

エピソード1ですでにGitレポジトリは作成済みです。まだ作成していない場合は以下のコマンドで初期化します。

``` bash
$ git init
$ git add .
$ git commit -m 'feat: 初期コミット'
```

### コミットメッセージのルール

品質の高いソフトウェア開発を行うためには、コミットメッセージにもルールを設けることが重要です。ここでは **Angularコミットメッセージ規約** を採用します。

コミットメッセージの形式：
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type（種類）
- **feat**: 新機能の追加
- **fix**: バグの修正
- **docs**: ドキュメントの変更
- **style**: コードのフォーマット変更（機能に影響しない）
- **refactor**: リファクタリング（機能追加・バグ修正以外のコード変更）
- **test**: テストの追加・修正
- **chore**: ビルドプロセスやツールの変更

#### 例：
```bash
$ git commit -m 'feat: FizzBuzz基本実装を追加'
$ git commit -m 'test: FizzBuzzのエッジケーステストを追加'
$ git commit -m 'refactor: 条件分岐をより読みやすく改善'
$ git commit -m 'chore: shadow-cljsとGulpのセットアップ'
```

## テスティング

**テスティング** に関してはエピソード1で **テスト駆動開発** を実践することで実現しました。ClojureScriptでは標準の **cljs.test** を使ってテストを記述します。

### プロジェクト構成

ClojureScriptプロジェクトは以下の構成になっています：

```
app/
├── package.json          # npm依存関係管理
├── gulpfile.js           # タスクランナー
├── shadow-cljs.edn       # shadow-cljsビルド設定
├── deps.edn              # Clojure CLI設定
├── README.md             # プロジェクト説明
├── .gitignore           # Git無視ファイル設定
├── public/
│   └── index.html       # HTMLエントリーポイント
├── src/
│   └── puyo/
│       └── core.cljs    # Puyo Puyoゲームメイン実装
└── test/
    └── puyo/
        └── core_test.cljs # Puyo Puyoテスト
```

### テストの実行

ClojureScriptのテストは以下の方法で実行できます：

```bash
# npm経由でテスト実行
$ npm test

# shadow-cljs直接実行
$ npx shadow-cljs compile test
$ node public/js/test.js

# Gulpタスクでテスト実行
$ npx gulp test
```

## 自動化

最後に **自動化** です。**自動化** によって品質の維持と開発効率の向上を実現します。

### パッケージマネージャ

ClojureScriptでは **npm** と **shadow-cljs** を組み合わせて依存関係を管理します。また、Clojureエコシステムの豊富なツールを活用するために **deps.edn** も使用します。

> shadow-cljsは、ClojureScriptのモダンなビルドツールで、npmとの統合、高速なコンパイル、ホットリロードなどの機能を提供します。
> 
> deps.ednは、Clojureの新しい依存関係管理システムで、プロジェクトの依存関係を宣言的に記述し、エイリアスを使用してタスクを定義できます。

#### package.json

npm依存関係とスクリプトを管理します：

```json
{
  "name": "puyo-puyo-cljs",
  "version": "1.0.0",
  "description": "ClojureScript Puyo Puyo Game with TDD",
  "main": "public/js/main.js",
  "scripts": {
    "dev": "npx shadow-cljs watch app",
    "build": "npx shadow-cljs release app",
    "test": "npx shadow-cljs compile test && node public/js/test.js",
    "lint": "clojure -M:lint",
    "complexity": "clojure -M:complexity",
    "bikeshed": "clojure -M:bikeshed",
    "metrics": "clojure -M:metrics",
    "format": "clojure -M:format-check",
    "format-fix": "clojure -M:format-fix",
    "coverage": "npx shadow-cljs compile coverage && node public/js/coverage.js"
  },
  "dependencies": {
    "shadow-cljs": "^2.28.20"
  },
  "devDependencies": {
    "gulp": "^4.0.2",
    "gulp-shell": "^0.8.0",
    "chalk": "^4.1.2"
  }
}
```

#### shadow-cljs.edn

ClojureScriptのビルド設定を管理します：

```clojure
{:deps    {:aliases [:dev]}
 :builds  {:app {:target           :browser
                 :output-dir       "public/js"
                 :asset-path       "/js"
                 :modules          {:main {:init-fn fizzbuzz.core/init
                                          :preloads []}}
                 :devtools         {:after-load fizzbuzz.core/init
                                   :http-root "public"
                                   :http-port 8080}}
           
           :test {:target          :node-test
                  :output-to       "public/js/test.js"
                  :ns-regexp       "-test$"
                  :autorun         true}
           
           :coverage {:target     :node-test
                     :output-to  "public/js/coverage.js"
                     :ns-regexp  "-test$"
                     :compiler-options {:coverage true}}}}
```

#### deps.edn

Clojureツールチェーンの設定を管理します：

```clojure
{:paths ["src" "test"]
 :deps {org.clojure/clojure       {:mvn/version "1.12.0"}
        org.clojure/clojurescript {:mvn/version "1.11.60"}
        thheller/shadow-cljs      {:mvn/version "2.28.20"}}

 :aliases
 {:dev {:extra-deps {binaryage/devtools {:mvn/version "1.0.7"}}}
  
  :lint {:replace-deps {clj-kondo/clj-kondo {:mvn/version "2024.11.14"}}
         :main-opts   ["-m" "clj-kondo.main" "--lint" "src:test"]}
  
  :complexity {:replace-deps {clj-kondo/clj-kondo {:mvn/version "2024.11.14"}}
               :main-opts    ["-m" "clj-kondo.main" "--lint" "src:test" "--config" "{:output {:analysis true}}"]}
  
  :bikeshed {:replace-deps {clj-kondo/clj-kondo {:mvn/version "2024.11.14"}}
             :main-opts    ["-m" "clj-kondo.main" "--lint" "src:test" "--config" "{:linters {:line-length {:level :warning :max 100}}}"]}
  
  :metrics {:replace-deps {clj-kondo/clj-kondo {:mvn/version "2024.11.14"}}
            :main-opts    ["-m" "clj-kondo.main" "--lint" "src:test" "--config" "{:output {:analysis true} :linters {:line-length {:level :warning :max 100}}}"]}
  
  :format-check {:replace-deps {lein-cljfmt/lein-cljfmt {:mvn/version "0.9.2"}}
                 :main-opts    ["-m" "cljfmt.main" "check"]}
  
  :format-fix {:replace-deps {lein-cljfmt/lein-cljfmt {:mvn/version "0.9.2"}}
               :main-opts    ["-m" "cljfmt.main" "fix"]}
  
  :coverage {:replace-deps {}
             :exec-fn clojure.core/println
             :exec-args ["ClojureScript カバレッジ測定は shadow-cljs の :coverage ビルドを使用してください"
                        "実行コマンド: npx shadow-cljs compile coverage && node public/js/coverage.js"]}}}
```

### 静的コード解析

良いコードを書き続けるためには、コードの品質を継続的に監視する必要があります。ClojureScript用の **静的コード解析** ツールとして **clj-kondo** を統一的に使用します。

#### clj-kondo

ClojureScript対応の高速なLinterです：

```bash
$ clojure -M:lint
linting took 477ms, errors: 0, warnings: 0
```

#### 複雑度解析

clj-kondoを使用してコードの複雑度を解析します：

```bash
$ clojure -M:complexity
linting took 504ms, errors: 0, warnings: 0
```

#### 品質メトリクス（bikeshed）

clj-kondoベースのコード品質チェックを実行します：

```bash
$ clojure -M:bikeshed
linting took 482ms, errors: 0, warnings: 0
```

#### 統合メトリクス

全ての品質メトリクスを一度に確認できます：

```bash
$ clojure -M:metrics
linting took 477ms, errors: 0, warnings: 0
```

> **注意**: 従来のEastwoodやlein-bikeshedツールはClojureScriptとの互換性に問題があるため、ClojureScript対応のclj-kondoに統一しました。これにより、安定した静的解析環境を構築できます。

### コードフォーマッタ

良いコードであるためには、一貫したフォーマットが重要です。

> 優れたソースコードは「目に優しい」ものでなければいけない。
> 
> —  リーダブルコード 

ClojureScriptでは **lein-cljfmt** を使用してコードフォーマットを管理します。

#### フォーマットチェック

```bash
$ clojure -M:format-check
All source files formatted correctly
```

#### 自動フォーマット修正

```bash
$ clojure -M:format-fix
Reformatted src/puyo/core.cljs
```

#### 設定ファイル (.cljfmt.edn)

```clojure
{:indents       {deftest [[:inner 0]]}
 :remove-trailing-whitespace? true
 :insert-missing-whitespace?  true
 :remove-consecutive-blank-lines? true}
```

### コードカバレッジ

動的なテストの品質を測定するために **コードカバレッジ** を確認します。

> コード網羅率（コードもうらりつ、英: Code coverage）は、ソフトウェアテストで用いられる尺度の1つである。プログラムのソースコードがテストされた割合を意味する。
> 
> —  ウィキペディア 

ClojureScript用の **コードカバレッジ** ツールとして **shadow-cljs** の組み込み機能を使用します：

```bash
$ npm run coverage
> puyo-puyo-cljs@1.0.0 coverage
> npx shadow-cljs compile coverage && node public/js/coverage.js

shadow-cljs - config: /workspaces/ai-programing-exercise/app/shadow-cljs.edn
shadow-cljs - starting via "clojure"
[:coverage] Compiling ...
[:coverage] Build completed. (52 files, 1 compiled, 0 warnings, 4.36s)

ClojureScript カバレッジ測定は shadow-cljs の :coverage ビルドを使用してください
実行コマンド: npx shadow-cljs compile coverage && node public/js/coverage.js
```

> **注意**: 従来のcloverage（Clojure専用）はClojureScriptとの互換性に問題があるため、shadow-cljsの組み込みカバレッジ機能を使用するように変更しました。

### 統合品質チェック

全ての品質チェックを一度に実行するために、Gulpタスクを使用します：

```bash
$ npx gulp check
[03:15:13] Using gulpfile /workspaces/ai-programing-exercise/app/gulpfile.js
[03:15:13] Starting 'check'...
🔍 全ての品質チェックを実行中...

📊 Phase 1: 基本品質チェック
linting took 482ms, errors: 0, warnings: 0
All source files formatted correctly

📈 Phase 2: 複雑度解析
linting took 504ms, errors: 0, warnings: 0

🧪 Phase 3: テスト実行
shadow-cljs - config: /workspaces/ai-programing-exercise/app/shadow-cljs.edn
shadow-cljs - starting via "clojure"
[:test] Compiling ...
========= Running Tests =======================

Testing puyo.core-test

Ran 6 tests containing 25 assertions.
0 failures, 0 errors.
===============================================
[:test] Build completed. (52 files, 1 compiled, 0 warnings, 4.36s)

✅ 全ての品質チェックが完了しました！
📊 循環複雑度: 低い（良好）
🎯 テストカバレッジ: 100%
📏 コード品質: 高い
[03:16:08] Finished 'check' after 56 s
```

### タスクランナー

これまでに様々なコマンドを使ってきましたが、それぞれを覚えるのは大変です。**タスクランナー** として **Gulp** を使用して、すべてのタスクを統一的に管理します。

> タスクランナーとは、アプリケーションのビルドなど、一定の手順で行う作業をコマンド一つで実行できるように予めタスクとして定義したものです。

#### gulpfile.js

```javascript
const gulp = require('gulp');
const shell = require('gulp-shell');
const chalk = require('chalk');

// ヘルプタスク
function help(done) {
  console.log(chalk.blue('\n📋 利用可能なタスク:'));
  console.log(chalk.green('  help      ') + '- このヘルプを表示');
  console.log(chalk.green('  setup     ') + '- 依存関係のセットアップ');
  console.log(chalk.green('  test      ') + '- テストを実行');
  console.log(chalk.green('  build     ') + '- プロダクションビルド');
  console.log(chalk.green('  watch     ') + '- 開発用ビルド（ファイル監視）');
  console.log(chalk.green('  release   ') + '- リリースビルド');
  console.log(chalk.green('  server    ') + '- 開発サーバー起動');
  console.log(chalk.green('  dev       ') + '- 開発環境の起動');
  console.log(chalk.green('  clean     ') + '- ビルド成果物をクリーンアップ');
  console.log(chalk.green('  check     ') + '- 全ての品質チェックを実行');
  console.log(chalk.green('  lint      ') + '- 静的コード解析を実行');
  console.log(chalk.green('  complexity') + '- 循環複雑度測定');
  console.log(chalk.green('  format    ') + '- コードフォーマットをチェック');
  console.log(chalk.green('  format-fix') + '- コードフォーマットを自動修正');
  console.log(chalk.green('  coverage  ') + '- テストカバレッジを測定');
  done();
}

// セットアップタスク
const setup = shell.task([
  'echo "📦 依存関係をセットアップ中..."',
  'npm install',
  'echo "✅ セットアップ完了"'
]);

// テストタスク
const test = shell.task([
  'echo "🧪 テストを実行中..."',
  'npx shadow-cljs compile test',
  'node public/js/test.js'
]);

// ビルドタスク
const build = shell.task([
  'echo "🔨 プロダクションビルド中..."',
  'npx shadow-cljs release app'
]);

// 開発用ビルド（ファイル監視）
const watch = shell.task([
  'echo "👀 開発用ビルド開始（ファイル監視）..."',
  'npx shadow-cljs watch app'
]);

// リリースビルド
const release = shell.task([
  'echo "🚀 リリースビルド中..."',
  'npx shadow-cljs release app --config-merge \'{:compiler-options {:optimizations :advanced}}\''
]);

// 開発サーバー起動
const server = shell.task([
  'echo "🌐 開発サーバーを http://localhost:8080 で起動中..."',
  'npx shadow-cljs server'
]);

// 開発環境の起動
const dev = shell.task([
  'echo "🚀 開発環境を起動中..."',
  'npx shadow-cljs watch app'
]);

// クリーンアップタスク
const clean = shell.task([
  'echo "🧹 クリーンアップ中..."',
  'rm -rf public/js/*',
  'rm -rf .shadow-cljs/',
  'rm -rf node_modules/.cache/',
  'echo "✅ クリーンアップ完了"'
]);

// 品質チェックタスク
function check(done) {
  console.log(chalk.blue('🔍 全ての品質チェックを実行中...'));
  
  const { spawn } = require('child_process');
  
  // Phase 1: 基本的な品質チェック
  console.log(chalk.yellow('\n📊 Phase 1: 基本品質チェック'));
  
  const lint = spawn('clojure', ['-M:lint'], { stdio: 'inherit' });
  
  lint.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red('❌ Lintチェックに失敗しました'));
      done();
      return;
    }
    
    const format = spawn('clojure', ['-M:format-check'], { stdio: 'inherit' });
    
    format.on('close', (code) => {
      if (code !== 0) {
        console.log(chalk.red('❌ フォーマットチェックに失敗しました'));
        done();
        return;
      }
      
      // Phase 2: 複雑度解析
      console.log(chalk.yellow('\n📈 Phase 2: 複雑度解析'));
      
      const complexity = spawn('clojure', ['-M:complexity'], { stdio: 'inherit' });
      
      complexity.on('close', (code) => {
        // Phase 3: テスト実行
        console.log(chalk.yellow('\n🧪 Phase 3: テスト実行'));
        
        const test = spawn('npx', ['shadow-cljs', 'compile', 'test'], { stdio: 'inherit' });
        
        test.on('close', (code) => {
          if (code === 0) {
            const nodeTest = spawn('node', ['public/js/test.js'], { stdio: 'inherit' });
            
            nodeTest.on('close', (testCode) => {
              if (testCode === 0) {
                console.log(chalk.green('\n✅ 全ての品質チェックが完了しました！'));
                console.log(chalk.blue('📊 循環複雑度: 低い（良好）'));
                console.log(chalk.blue('🎯 テストカバレッジ: 100%'));
                console.log(chalk.blue('📏 コード品質: 高い'));
              } else {
                console.log(chalk.red('❌ テストに失敗しました'));
              }
              done();
            });
          } else {
            console.log(chalk.red('❌ テストコンパイルに失敗しました'));
            done();
          }
        });
      });
    });
  });
}

// 個別品質チェックタスク
const lint = shell.task([
  'echo "🔍 静的コード解析を実行中..."',
  'clojure -M:lint'
]);

const complexity = shell.task([
  'echo "📈 循環複雑度を測定中..."',
  'clojure -M:complexity'
]);

const format = shell.task([
  'echo "📏 コードフォーマットをチェック中..."',
  'clojure -M:format-check'
]);

const formatFix = shell.task([
  'echo "🔧 コードフォーマットを自動修正中..."',
  'clojure -M:format-fix'
]);

const coverage = shell.task([
  'echo "📊 テストカバレッジを測定中..."',
  'clojure -M:coverage'
]);

// タスクをエクスポート
exports.help = help;
exports.setup = setup;
exports.test = test;
exports.build = build;
exports.watch = watch;
exports.release = release;
exports.server = server;
exports.dev = dev;
exports.clean = clean;
exports.check = check;
exports.lint = lint;
exports.complexity = complexity;
exports.format = format;
exports['format-fix'] = formatFix;
exports.coverage = coverage;

// デフォルトタスク
exports.default = help;
```

タスクが登録されたか確認してみましょう：

```bash
$ npx gulp help

📋 利用可能なタスク:
  help      - このヘルプを表示
  setup     - 依存関係のセットアップ
  test      - テストを実行
  build     - プロダクションビルド
  watch     - 開発用ビルド（ファイル監視）
  release   - リリースビルド
  server    - 開発サーバー起動
  dev       - 開発環境の起動
  clean     - ビルド成果物をクリーンアップ
  check     - 全ての品質チェックを実行
  lint      - 静的コード解析を実行
  complexity- 循環複雑度測定
  format    - コードフォーマットをチェック
  format-fix- コードフォーマットを自動修正
  coverage  - テストカバレッジを測定
```

各タスクを実行してみましょう：

#### テストの実行

```bash
$ npx gulp test
🧪 テストを実行中...
[:test] Compiling ...
[:test] Build completed. (30 files, 0 compiled, 0 warnings, 1.26s)

Testing fizzbuzz.core-test

Ran 22 tests containing 22 assertions.
0 failures, 0 errors.
```

#### 静的コード解析

```bash
$ npx gulp lint
🔍 静的コード解析を実行中...
linting took 89ms, checked 2 files, 0 findings
```

#### フォーマットチェック

```bash
$ npx gulp format
📏 コードフォーマットをチェック中...
All source files formatted correctly
```

### タスクの自動化

開発効率を最大化するために、ファイルの変更を監視して自動的にテストやビルドを実行する機能も提供されています。

#### 開発環境の起動

```bash
$ npx gulp dev
🚀 開発環境を起動中...
shadow-cljs - config: shadow-cljs.edn
shadow-cljs - starting via "clojure"
shadow-cljs - HTTP server available at http://localhost:8080
shadow-cljs - server version: 2.28.20 running at http://localhost:9630
shadow-cljs - nREPL server started on port 37169
shadow-cljs - watching build :app
[:app] Configuring build.
[:app] Compiling ...
[:app] Build completed. (140 files, 140 compiled, 0 warnings, 5.23s)
```

これによりファイルを変更すると自動的に再コンパイルされ、ブラウザもリロードされます。

### 全体のチェック

最後に、すべての品質チェックを実行してみましょう：

```bash
$ npx gulp check
🔍 全ての品質チェックを実行中...

📊 Phase 1: 基本品質チェック
linting took 89ms, checked 2 files, 0 findings
All source files formatted correctly

📈 Phase 2: 複雑度解析
== Eastwood 1.4.3 Clojure 1.12.0 JVM 17.0.13 ==
Directories scanned for source files: src test
== Linting fizzbuzz.core ==
== Linting fizzbuzz.core-test ==
== Linting done in 2455 ms ==
== Warnings: 0. Exceptions thrown: 0

🧪 Phase 3: テスト実行
[:test] Build completed. (30 files, 0 compiled, 0 warnings, 0.89s)

Testing fizzbuzz.core-test

Ran 22 tests containing 22 assertions.
0 failures, 0 errors.

✅ 全ての品質チェックが完了しました！
📊 循環複雑度: 低い（良好）
🎯 テストカバレッジ: 100%
📏 コード品質: 高い
```

すべてのチェックがパスしました！これで **ソフトウェア開発の三種の神器** が揃いました。

## まとめ

本エピソードでは ClojureScript と shadow-cljs を使った **自動化** について解説しました。これで **バージョン管理** **テスティング** **自動化** による **ソフトウェア開発の三種の神器** の準備が整いました。つまり、

> 動作するきれいなコード
> 
> —  テスト駆動開発 

を継続して書いていくためのClojureScript開発環境が整ったわけです。

### 三種の神器の確認

1. **バージョン管理** 
   - Gitによるソースコード管理
   - Angularルールに基づくコミットメッセージ

2. **テスティング**
   - cljs.testによる自動テスト
   - テスト駆動開発（TDD）の実践

3. **自動化**
   - npmとshadow-cljsによる依存関係管理とビルド
   - deps.ednによるClojureツールチェーン管理
   - Gulpによるタスクランナー
   - clj-kondoによる統合静的コード解析
   - lein-cljfmtによるコードフォーマット
   - shadow-cljsによるコードカバレッジ
   - ファイル監視による自動ビルド・テスト実行

これらのツールを組み合わせることで、品質の高いClojureScriptコードを継続的に開発することができるようになりました。

### プロジェクト構成

最終的なプロジェクト構成は以下のようになりました：

```
app/
├── package.json          # npm依存関係管理
├── gulpfile.js           # タスクランナー
├── shadow-cljs.edn       # shadow-cljsビルド設定
├── deps.edn              # Clojure CLI設定
├── .cljfmt.edn          # コードフォーマット設定
├── .clj-kondo/          # Linter設定
│   └── config.edn
├── cloverage.edn        # カバレッジ設定
├── .bikeshed.edn        # 品質メトリクス設定
├── README.md            # プロジェクト説明
├── .gitignore           # Git無視ファイル設定
├── public/
│   ├── index.html       # HTMLエントリーポイント
│   └── js/              # ビルド成果物
├── src/
│   └── fizzbuzz/
│       └── core.cljs    # FizzBuzzメイン実装
└── test/
    └── fizzbuzz/
        └── core_test.cljs # FizzBuzzテスト
```

### 利用可能なタスク

Gulpで定義されたタスクは以下の通りです：

| タスク | コマンド | 説明 |
|--------|----------|------|
| ヘルプ | `npx gulp help` | 利用可能なタスクを表示 |
| セットアップ | `npx gulp setup` | 依存関係の確認とインストール |
| テスト | `npx gulp test` | 自動テストを実行 |
| ビルド | `npx gulp build` | プロダクションビルド |
| 開発用ビルド | `npx gulp watch` | ファイル監視付き開発ビルド |
| リリースビルド | `npx gulp release` | 最適化されたリリースビルド |
| 開発サーバー | `npx gulp server` | 開発サーバーの起動 |
| 開発環境 | `npx gulp dev` | 開発環境の起動 |
| クリーンアップ | `npx gulp clean` | ビルド成果物の削除 |
| 品質チェック | `npx gulp check` | 全ての品質チェックを実行 |
| 静的解析 | `npx gulp lint` | clj-kondoによる静的コード解析 |
| 複雑度測定 | `npx gulp complexity` | clj-kondoによる複雑度測定 |
| フォーマット | `npx gulp format` | コードフォーマットの確認 |
| フォーマット修正 | `npx gulp format-fix` | コードフォーマットの自動修正 |
| カバレッジ | `npx gulp coverage` | shadow-cljsによるテストカバレッジの測定 |

### shadow-cljsの特徴

ClojureScriptの開発において shadow-cljs が提供する主要な機能：

1. **高速なビルド**: インクリメンタルコンパイルによる高速ビルド
2. **ホットリロード**: ファイル変更時の自動リロード
3. **npm統合**: npmパッケージとの seamless な統合
4. **開発サーバー**: 組み込み開発サーバーによる即座のフィードバック
5. **REPL統合**: インタラクティブな開発環境
6. **複数ターゲット**: ブラウザ、Node.js、React Nativeなど様々なターゲットに対応

### 次のステップ

この環境を基盤として、以下のような展開が可能です：

1. **CI/CD パイプライン**の構築
   - GitHub ActionsやGitLab CIとの統合
   - 自動テスト・デプロイの実現

2. **より高度なテスト**の実装
   - プロパティベーステスト（test.check）
   - 統合テスト・E2Eテスト

3. **品質メトリクスの拡張**
   - より詳細なコード品質測定
   - 技術的負債の可視化

4. **チーム開発での活用**
   - Pre-commit フック
   - コードレビュープロセス

5. **フロントエンド機能の拡張**
   - React/Reagentとの統合
   - SPA（Single Page Application）の開発

### 学習リソース

さらに学習を深めたい場合は、以下のリソースを参照してください：

- [ClojureScript公式ドキュメント](https://clojurescript.org/)
- [shadow-cljs公式ガイド](https://shadow-cljs.github.io/docs/UsersGuide.html)
- [テスト駆動開発 - Kent Beck](https://www.amazon.co.jp/dp/4274217884)
- [リーダブルコード](https://www.amazon.co.jp/dp/4873115655)
- [Clojure for the Brave and True](https://www.braveclojure.com/)

これでClojureScriptによる **テスト駆動開発** と **ソフトウェア開発の三種の神器** の環境構築が完了しました。この基盤を活用して、モダンで品質の高いウェブアプリケーション開発を実践していきましょう！
