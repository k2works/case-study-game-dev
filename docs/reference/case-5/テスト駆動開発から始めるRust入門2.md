---
title: テスト駆動開発から始めるRust入門 ~ソフトウェア開発の三種の神器を準備する~
description: 
published: true
date: 2025-07-16T06:28:50.178Z
tags: 
editor: markdown
dateCreated: 2025-07-03T10:18:22.060Z
---

# エピソード2

## 初めに

この記事は [テスト駆動開発から始めるRust入門 ~2時間でTDDとリファクタリングのエッセンスを体験する~](../テスト駆動開発から始めるRust入門1.md) の続編です。

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

では **自動化** の準備に入りたいのですがそのためにはいくつかの外部プログラムを利用する必要があります。そのためのツールが **Cargo** です。

> Cargoとは、Rustで記述されたサードパーティ製のライブラリ（クレート）を管理するためのツールで、Rustエコシステムの中核を担っています。RubyのBundlerやRubyGemsに相当する機能を提供します。
> 
> —  The Rust Programming Language

**Cargo** はRustの標準的なパッケージマネージャとして、すでに何度か使っています。例えばエピソード1の初めの `clap` のインストールなどです。

``` bash
$ cargo add clap
```

では、これからもこのようにして必要な外部クレートを一つ一つインストールしていくのでしょうか？また、開発用マシンを変えた時にも同じことを繰り返さないといけないのでしょうか？面倒ですよね。そのような面倒なことをしないで済む仕組みがRustには用意されています。それが **Cargo.toml** と **Cargo.lock** です。

> Cargo.tomlとは、作成したアプリケーションがどのクレートに依存しているか、そしてインストールしているバージョンはいくつかという情報を管理するためのファイルです。Cargo.lockはバージョンの固定化を行います。
> 
> —  The Rust Programming Language

**Cargo** を使ってクレートを管理しましょう。

``` bash
$ cargo init --name fizz_buzz_tdd
```

`Cargo.toml` が作成されます。

``` toml
[package]
name = "fizz_buzz_tdd"
version = "0.1.0"
edition = "2021"

[dependencies]
clap = { version = "4.0", features = ["derive"] }

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.0"
```

これで次の準備ができました。

### 静的コード解析

良いコードを書き続けるためにはコードの品質を維持していく必要があります。エピソード1では **テスト駆動開発** によりプログラムを動かしながら品質の改善していきました。出来上がったコードに対する品質チェックの方法として **静的コード解析** があります。Rust用 **静的コード解析** ツール[Clippy](https://github.com/rust-lang/rust-clippy) を使って確認してみましょう。

``` bash
$ cargo clippy
```

なにかいろいろ出てきましたね。Clippyの詳細に関しては [Clippy Documentation](https://doc.rust-lang.org/clippy/)を参照ください。`--` オプションをつけて厳しいチェックを実施してみましょう。

``` bash
$ cargo clippy -- -D warnings
    Checking fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished dev [unoptimized + debuginfo] target(s) in 0.28s
```

警告レベルをエラーとして扱うことで、より厳格なコード品質を維持できます。

テストも実行して壊れていないかも確認しておきます。

``` bash
$ cargo test
   Compiling fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished test [unoptimized + debuginfo] target(s) in 1.34s
     Running unittests src/lib.rs (target/debug/deps/fizz_buzz_tdd-6b9751281dfb1574)

running 27 tests
test array_tests::test_any_all_predicates ... ok
test array_tests::test_chain_operations ... ok
test array_tests::test_collect_with_transformation ... ok
test array_tests::test_enumerate_with_index ... ok
test array_tests::test_filter_reject_elements ... ok
test array_tests::test_filter_select_elements ... ok
test array_tests::test_find_first_element ... ok
test array_tests::test_fold_accumulation ... ok
test array_tests::test_grep_pattern_matching ... ok
test array_tests::test_iteration ... ok
test array_tests::test_map_transform_elements ... ok
test array_tests::test_reduce_accumulation ... ok
test array_tests::test_skip_while_condition ... ok
test array_tests::test_sort_with_custom_comparator ... ok
test array_tests::test_take_while_condition ... ok
test tests::test_array_100th_is_buzz ... ok
test tests::test_array_first_is_1 ... ok
test tests::test_array_last_is_buzz ... ok
test tests::test_buzz_for_10 ... ok
test tests::test_buzz_for_5 ... ok
test tests::test_fizz_for_3 ... ok
test tests::test_fizz_for_6 ... ok
test tests::test_fizzbuzz_for_15 ... ok
test tests::test_fizzbuzz_for_30 ... ok
test tests::test_four_for_4 ... ok
test tests::test_one_for_1 ... ok
test tests::test_two_for_2 ... ok

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

セットアップができたのでここでコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: 静的コード解析セットアップ'
```

### コードフォーマッタ

良いコードであるためにはフォーマットも大切な要素です。

> 優れたソースコードは「目に優しい」ものでなければいけない。
> 
> —  リーダブルコード 

Rustには標準的なフォーマットツールがあります。それが `rustfmt` です。以下のコードのフォーマットをわざと崩してみます。

``` rust
impl FizzBuzz {
    const MAX_NUMBER: u32 = 100;

    pub fn new() -> Self {
            Self {
        max_number: Self::MAX_NUMBER,
        }
    }

    pub fn generate(number: u32) -> String {
        let is_fizz = number % 3 == 0;
let is_buzz = number % 5 == 0;

        match (is_fizz, is_buzz) {
            (true, true) => "FizzBuzz".to_string(),
            (true, false) => "Fizz".to_string(),
            (false, true) => "Buzz".to_string(),
            (false, false) => number.to_string(),
        }
    }
}
```

フォーマットツールを実行してみます。

``` bash
$ cargo fmt
```

``` rust
impl FizzBuzz {
    const MAX_NUMBER: u32 = 100;

    pub fn new() -> Self {
        Self {
            max_number: Self::MAX_NUMBER,
        }
    }

    pub fn generate(number: u32) -> String {
        let is_fizz = number % 3 == 0;
        let is_buzz = number % 5 == 0;

        match (is_fizz, is_buzz) {
            (true, true) => "FizzBuzz".to_string(),
            (true, false) => "Fizz".to_string(),
            (false, true) => "Buzz".to_string(),
            (false, false) => number.to_string(),
        }
    }
}
```

フォーマットが修正されたことが確認できましたね。フォーマットの設定は `rustfmt.toml` ファイルで細かくカスタマイズできます。

### コードカバレッジ

静的コード解析による品質の確認はできました。では動的なテストに関してはどうでしょうか？ **コードカバレッジ** を確認する必要があります。

> コード網羅率（コードもうらりつ、英: Code coverage
> ）コードカバレッジは、ソフトウェアテストで用いられる尺度の1つである。プログラムのソースコードがテストされた割合を意味する。この場合のテストはコードを見ながら行うもので、ホワイトボックステストに分類される。
> 
> —  ウィキペディア 

Rust用 **コードカバレッジ** 検出プログラムとして [cargo-tarpaulin](https://github.com/xd009642/tarpaulin)を使います。

``` bash
$ cargo install cargo-tarpaulin
```

カバレッジを測定してみましょう。

``` bash
$ cargo tarpaulin --config tarpaulin.toml
INFO cargo_tarpaulin::config: Creating config
Dec 26 09:12:13.120  INFO cargo_tarpaulin: Running Tarpaulin
Dec 26 09:12:13.120  INFO cargo_tarpaulin: Building project
Dec 26 09:12:14.368  INFO cargo_tarpaulin: Launching test
Dec 26 09:12:14.428  INFO cargo_tarpaulin: running /workspaces/ai-programing-exercise/app/target/debug/deps/fizz_buzz_tdd-<hash>

running 27 tests
test array_tests::test_any_all_predicates ... ok
test array_tests::test_chain_operations ... ok
test array_tests::test_collect_with_transformation ... ok
test array_tests::test_enumerate_with_index ... ok
test array_tests::test_filter_reject_elements ... ok
test array_tests::test_filter_select_elements ... ok
test array_tests::test_find_first_element ... ok
test array_tests::test_fold_accumulation ... ok
test array_tests::test_grep_pattern_matching ... ok
test array_tests::test_iteration ... ok
test array_tests::test_map_transform_elements ... ok
test array_tests::test_reduce_accumulation ... ok
test array_tests::test_skip_while_condition ... ok
test array_tests::test_sort_with_custom_comparator ... ok
test array_tests::test_take_while_condition ... ok
test tests::test_array_100th_is_buzz ... ok
test tests::test_array_first_is_1 ... ok
test tests::test_array_last_is_buzz ... ok
test tests::test_buzz_for_10 ... ok
test tests::test_buzz_for_5 ... ok
test tests::test_fizz_for_3 ... ok
test tests::test_fizz_for_6 ... ok
test tests::test_fizzbuzz_for_15 ... ok
test tests::test_fizzbuzz_for_30 ... ok
test tests::test_four_for_4 ... ok
test tests::test_one_for_1 ... ok
test tests::test_two_for_2 ... ok

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

Dec 26 09:12:14.728  INFO cargo_tarpaulin: Coverage Results:
|| Tested/Total Lines:
|| src/lib.rs: 32/32
|| src/main.rs: 0/20
||
95.38% coverage, 32/52 lines covered
```

テスト実行後に `coverage` というフォルダが作成されます。その中の `index.html` を開くとカバレッジ状況を確認できます。セットアップが完了したらコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: コードカバレッジセットアップ'
```

### タスクランナー

ここまででテストの実行、静的コード解析、コードフォーマット、コードカバレッジを実施することができるようになりました。でもコマンドを実行するのにそれぞれコマンドを覚えておくのは面倒ですよね。例えばテストの実行は

``` bash
$ cargo test
   Compiling fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished test [unoptimized + debuginfo] target(s) in 1.34s
     Running unittests src/lib.rs (target/debug/deps/fizz_buzz_tdd-6b9751281dfb1574)

running 27 tests
test array_tests::test_any_all_predicates ... ok
...

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

このようにしていました。では静的コードの解析はどうやりましたか？フォーマットはどうやりましたか？調べるのも面倒ですよね。いちいち調べるのが面倒なことは全部 **タスクランナー** にやらせるようにしましょう。

> タスクランナーとは、アプリケーションのビルドなど、一定の手順で行う作業をコマンド一つで実行できるように予めタスクとして定義したものです。

Rustでは **Makefile** や **cargo-make** などのタスクランナーが使えますが、ここでは **cargo-make** を使います。

> cargo-makeは、Rust開発者向けのタスクランナーです。プロジェクト固有のタスクを定義し、複雑なワークフローを自動化できます。TOMLファイルでタスクを設定し、条件分岐やクロスプラットフォーム対応も可能です。

まず、cargo-makeをインストールします。

``` bash
$ cargo install cargo-make
```

早速、テストタスクから作成しましょう。`Makefile.toml` を作ります。

``` toml
[config]
default_to_workspace = false

[tasks.test]
command = "cargo"
args = ["test"]

[tasks.lint]
command = "cargo"
args = ["clippy", "--", "-D", "warnings"]

[tasks.format]
command = "cargo"
args = ["fmt"]

[tasks.format-check]
command = "cargo"
args = ["fmt", "--", "--check"]

[tasks.coverage]
command = "cargo"
args = ["tarpaulin", "--out", "Html"]

[tasks.check-all]
dependencies = ["format-check", "lint", "test"]

[tasks.fix]
dependencies = ["format", "lint"]

[tasks.watch]
command = "cargo"
args = ["watch", "-x", "test", "-x", "clippy", "-x", "fmt"]
install_crate = "cargo-watch"

[tasks.default]
alias = "test"
```

タスクが登録されたか確認してみましょう。

``` bash
$ cargo make --list-all-steps
Available tasks:
- coverage
- default
- format
- format-check
- lint
- test
- watch
```

タスクが実行されたことが確認できたので引き続きテストタスクを実行します。

``` bash
$ cargo make test
[cargo-make] INFO - cargo make 0.37.24
[cargo-make] INFO - Project: fizz_buzz_tdd
[cargo-make] INFO - Build File: Makefile.toml
[cargo-make] INFO - Task: test
[cargo-make] INFO - Profile: development
[cargo-make] INFO - Execute Command: "cargo" "test"
    Finished test [unoptimized + debuginfo] target(s) in 0.33s
     Running unittests src/lib.rs (target/debug/deps/fizz_buzz_tdd-6b9751281dfb1574)

running 27 tests
test array_tests::test_any_all_predicates ... ok
test array_tests::test_chain_operations ... ok
...

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
[cargo-make] INFO - Build Done in 2.85 seconds.
```

テストタスクが実行されたことが確認できたので引き続き静的コードの解析タスクを実行します。

``` bash
$ cargo make lint
[cargo-make] INFO - cargo make 0.37.24
[cargo-make] INFO - Project: fizz_buzz_tdd
[cargo-make] INFO - Build File: Makefile.toml
[cargo-make] INFO - Task: lint
[cargo-make] INFO - Profile: development
[cargo-make] INFO - Execute Command: "cargo" "clippy" "--" "-D" "warnings"
    Checking fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished dev [unoptimized + debuginfo] target(s) in 0.28s
[cargo-make] INFO - Build Done in 1.73 seconds.
```

続いてフォーマットタスクを実行してみましょう。

``` bash
$ cargo make format
[cargo-make] INFO - cargo make 0.37.24
[cargo-make] INFO - Project: fizz_buzz_tdd
[cargo-make] INFO - Build File: Makefile.toml
[cargo-make] INFO - Task: format
[cargo-make] INFO - Profile: development
[cargo-make] INFO - Execute Command: "cargo" "fmt"
[cargo-make] INFO - Build Done in 1.43 seconds.
```

セットアップができたのでコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: タスクランナーセットアップ'
```

### タスクの自動化

良いコードを書くためのタスクをまとめることができました。でも、どうせなら自動で実行できるようにしたいですよね。タスクを自動実行するためのツールとして [cargo-watch](https://github.com/watchexec/cargo-watch) を使います。それぞれの詳細は以下を参照してください。

  - [cargo-watch - Automatically execute Cargo commands on file changes](https://github.com/watchexec/cargo-watch)

cargo-watchは既にMakefile.tomlでインストールするように設定されています。cargo-makeのwatchタスクを使用することで、ファイル変更時に自動でテスト、クリッピング、フォーマットが実行されます。

自動実行タスクを起動しましょう。

``` bash
$ cargo make watch
[cargo-make] INFO - cargo make 0.37.24
[cargo-make] INFO - Project: fizz_buzz_tdd
[cargo-make] INFO - Build File: Makefile.toml
[cargo-make] INFO - Task: watch
[cargo-make] INFO - Profile: development
[cargo-make] INFO - Installing crate: cargo-watch
[cargo-make] INFO - Execute Command: "cargo" "watch" "-x" "test" "-x" "clippy" "-x" "fmt"
[Running 'cargo test']
   Compiling fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished test [unoptimized + debuginfo] target(s) in 1.34s
     Running unittests src/lib.rs (target/debug/deps/fizz_buzz_tdd-6b9751281dfb1574)

running 27 tests
test array_tests::test_any_all_predicates ... ok
...

test result: ok. 27 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
[Running 'cargo clippy']
    Checking fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished dev [unoptimized + debuginfo] target(s) in 0.28s
[Running 'cargo fmt']
[Finished running. Exit status: 0]
```

起動したら `src/lib.rs` を編集してテストが自動実行されるか確認しましょう。

``` rust
#[test]
fn test_fizz_for_3() {
    assert_eq!(FizzBuzz::generate(3), "FizzFizz"); // わざと失敗させる
}
```

``` bash
[Running 'cargo test']
   Compiling fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished test [unoptimized + debuginfo] target(s) in 1.13s
     Running unittests src/lib.rs (target/debug/deps/fizz_buzz_tdd-6b9751281dfb1574)

running 27 tests
test tests::test_fizz_for_3 ... FAILED
...

failures:

---- tests::test_fizz_for_3 stdout ----
thread 'tests::test_fizz_for_3' panicked at src/lib.rs:45:9:
assertion failed: `(left == right)`
  left: `"Fizz"`,
 right: `"FizzFizz"`
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::test_fizz_for_3

test result: FAILED. 26 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
[Finished running. Exit status: 101]
```

変更を感知してテストが実行されて結果失敗していました。コードを元に戻してテストをパスするようにしておきましょう。テストがパスすることが確認できたらコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: タスクの自動化'
```

これで [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) の最後のアイテムの準備ができました。次回の開発からは最初にコマンドラインで `cargo make watch` を実行すれば良いコードを書くためのタスクを自動でやってくれるようになるのでコードを書くことに集中できるようになりました。では、次のエピソードに進むとしましょう。

## 配列や繰り返し処理を理解する

エピソード1では基本的なFizzBuzzの実装を通じてテスト駆動開発を学びました。本エピソードでは、Rustの強力なイテレータAPIを使って配列操作や繰り返し処理を学習していきます。

### 基本的な繰り返し処理

Rustでは `for` ループやイテレータを使って繰り返し処理を行うことができます。

``` rust
#[test]
fn test_iteration() {
    // 繰り返し処理：各要素を2乗する
    let numbers = vec![1, 2, 3];
    let mut output = Vec::new();
    
    for i in numbers {
        output.push(i * i);
    }
    
    assert_eq!(output, vec![1, 4, 9]);
}
```

### フィルタリング操作

特定の条件を満たす要素だけを抽出する場合は `filter` メソッドを使います。

``` rust
#[test]
fn test_filter_select_elements() {
    // 特定の条件を満たす要素だけを配列に入れて返す（select相当）
    let numbers = vec![1, 2, 3, 4, 5, 6];
    let result: Vec<i32> = numbers
        .into_iter()
        .filter(|&x| x % 2 == 0) // 偶数のみ
        .collect();
    
    assert_eq!(result, vec![2, 4, 6]);
}
```

### 変換操作

各要素を変換する場合は `map` メソッドを使います。

``` rust
#[test]
fn test_map_transform_elements() {
    // 新しい要素の配列を返す（map相当）
    let words = vec!["apple", "orange", "pineapple", "strawberry"];
    let result: Vec<usize> = words
        .iter()
        .map(|word| word.len())
        .collect();
    
    assert_eq!(result, vec![5, 6, 9, 10]);
}
```

### 検索操作

条件に一致する要素を検索する場合は `find` メソッドを使います。

``` rust
#[test]
fn test_find_first_element() {
    // 配列の中から条件に一致する要素を取得する（find相当）
    let words = vec!["apple", "orange", "pineapple", "strawberry"];
    let result = words.iter().find(|&&word| word.len() > 7);
    
    assert_eq!(result, Some(&"pineapple"));
}
```

### ソート操作

配列をソートする場合は `sort` や `sort_by` メソッドを使います。

``` rust
#[test]
fn test_sort_with_custom_comparator() {
    // 指定した評価式で並び変えた配列を返す
    let numbers = vec!["2", "4", "13", "3", "1", "10"];
    
    // 文字列として並び替え
    let mut result1 = numbers.clone();
    result1.sort();
    assert_eq!(result1, vec!["1", "10", "13", "2", "3", "4"]);
    
    // 数値として並び替え（昇順）
    let mut result2 = numbers.clone();
    result2.sort_by(|a, b| a.parse::<i32>().unwrap().cmp(&b.parse::<i32>().unwrap()));
    assert_eq!(result2, vec!["1", "2", "3", "4", "10", "13"]);
    
    // 数値として並び替え（降順）
    let mut result3 = numbers.clone();
    result3.sort_by(|a, b| b.parse::<i32>().unwrap().cmp(&a.parse::<i32>().unwrap()));
    assert_eq!(result3, vec!["13", "10", "4", "3", "2", "1"]);
}
```

### 条件付き取得

条件が満たされる間だけ要素を取得する場合は `take_while` や `skip_while` を使います。

``` rust
#[test]
fn test_take_while_condition() {
    // ブロック内の条件式が真である間までの要素を返す（take_while相当）
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9];
    let result: Vec<i32> = numbers
        .iter()
        .take_while(|&&item| item < 6)
        .copied()
        .collect();
    
    assert_eq!(result, vec![1, 2, 3, 4, 5]);
}
```

### 畳み込み演算

配列の要素を累積して単一の値を計算する場合は `fold` や `reduce` を使います。

``` rust
#[test]
fn test_fold_accumulation() {
    // 畳み込み演算を行う（inject相当）
    let numbers = vec![1, 2, 3, 4, 5];
    let result = numbers.iter().fold(0, |total, n| total + n);
    assert_eq!(result, 15);
}

#[test]
fn test_reduce_accumulation() {
    // 畳み込み演算を行う（reduce相当）
    let numbers = vec![1, 2, 3, 4, 5];
    let result = numbers.iter().copied().reduce(|total, n| total + n);
    assert_eq!(result, Some(15));
}
```

これらのテストをすべて実行すると、Rustの強力なイテレータAPIを使って、様々な配列操作ができることがわかります。

``` bash
$ cargo test array_tests
   Compiling fizz_buzz_tdd v0.1.0 (/workspaces/ai-programing-exercise/app)
    Finished test [unoptimized + debuginfo] target(s) in 1.34s
     Running unittests src/lib.rs (target/debug/deps/fizz_buzz_tdd-6b9751281dfb1574)

running 15 tests
test array_tests::test_any_all_predicates ... ok
test array_tests::test_chain_operations ... ok
test array_tests::test_collect_with_transformation ... ok
test array_tests::test_enumerate_with_index ... ok
test array_tests::test_filter_reject_elements ... ok
test array_tests::test_filter_select_elements ... ok
test array_tests::test_find_first_element ... ok
test array_tests::test_fold_accumulation ... ok
test array_tests::test_grep_pattern_matching ... ok
test array_tests::test_iteration ... ok
test array_tests::test_map_transform_elements ... ok
test array_tests::test_reduce_accumulation ... ok
test array_tests::test_skip_while_condition ... ok
test array_tests::test_sort_with_custom_comparator ... ok
test array_tests::test_take_while_condition ... ok

test result: ok. 15 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

## まとめ

本エピソードでは、ソフトウェア開発の三種の神器である「バージョン管理」「テスティング」「自動化」のセットアップを完了し、さらにRustの配列操作や繰り返し処理についても学習しました。

これで次回の開発からは：

1. **バージョン管理**：Gitを使った体系的なコミット管理
2. **テスティング**：Rustの標準テストフレームワークを使った自動テスト
3. **自動化**：cargo-makeとcargo-watchを使ったタスクの自動実行

が整い、良いコードを書き続けるための環境が整いました。

また、Rustの強力なイテレータAPIを使うことで、関数型プログラミングの恩恵を受けながら、安全で効率的なコードを書くことができることも確認できました。これらの知識を活用して、次のエピソードではより複雑なプログラムの開発に挑戦していきましょう。
