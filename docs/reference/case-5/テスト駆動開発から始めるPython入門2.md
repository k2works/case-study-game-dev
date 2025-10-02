---
title: テスト駆動開発から始めるPython入門 ~ソフトウェア開発の三種の神器を準備する~
description: 
published: true
date: 2025-08-05T08:10:40.506Z
tags: 
editor: markdown
dateCreated: 2025-07-02T05:32:14.135Z
---

# エピソード2

## 初めに

この記事は [テスト駆動開発から始めるPython入門 ~2時間でTDDとリファクタリングのエッセンスを体験する~](テスト駆動開発から始めるPython入門1.md) の続編です。

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

では **自動化** の準備に入りたいのですがそのためにはいくつかの外部プログラムを利用する必要があります。そのためのツールが **uv** です。

> uvとは、Pythonプロジェクトの依存関係を管理し、仮想環境を自動で作成・管理する高速なPythonパッケージマネージャーです。従来のpipやpoetryよりも高速で、プロジェクトの初期化から依存関係の管理まで一元的に行えます。
> 
> —  Pythonパッケージ管理 

**uv** でプロジェクトを初期化しましょう。

``` bash
$ uv init
Initialized project `app`
```

`pyproject.toml` が作成されます。これは **uv** がパッケージの依存関係とプロジェクト設定を管理するためのファイルです。

``` toml
[project]
name = "app"
version = "0.1.0"
description = "テスト駆動開発から始めるPython入門"
readme = "README.md"
requires-python = ">=3.10"
dependencies = []

[project.optional-dependencies]
dev = [
    "pytest",
    "pytest-cov",
    "ruff",
    "mypy",
    "tox",
]
```

開発依存関係を追加してインストールします。

``` bash
$ uv add --dev pytest pytest-cov ruff mypy tox
Using CPython 3.10.12 interpreter at: /usr/bin/python3.10
Creating virtual environment at: .venv
Installed 23 packages in 8.03s
 + mypy==1.17.0
 + pytest==8.4.1
 + pytest-cov==6.2.1
 + ruff==0.12.3
 + tox==4.27.0
 + ...（その他の依存関係）
```

これで次の準備ができました。**uv** が仮想環境も自動で作成・管理してくれるので、環境の分離も簡単です。

### 静的コード解析

良いコードを書き続けるためにはコードの品質を維持していく必要があります。エピソード1では **テスト駆動開発** によりプログラムを動かしながら品質の改善していきました。出来上がったコードに対する品質チェックの方法として **静的コード解析** があります。Python用 **静的コード解析** ツール[Ruff](https://github.com/astral-sh/ruff) を使って確認してみましょう。Ruffは高速でモダンなPythonリンター・フォーマッターで、従来のflake8、pylint、blackなどを置き換える統合ツールです。

プログラムは先程 **uv** を使ってインストールしたので以下のコマンドを実行します。

``` bash
$ uv run ruff check .
test/test_fizz_buzz.py:4:20: F401 [*] `typing.Any` imported but unused
  |
2 | import io
3 | import sys
4 | from typing import Any
  |                    ^^^ F401
5 |
6 | import pytest
  |        ^^^^^^ F401
7 |
8 | from lib.fizz_buzz import FizzBuzz
  |
  = help: Remove unused import: `typing.Any`

Found 6 errors.
[*] 6 fixable with the `--fix` option.
```

なにかいろいろ出てきましたね。Ruffの詳細に関しては [Ruffの使い方](https://docs.astral.sh/ruff/)を参照ください。`--fix` オプションで自動修正してみましょう。

``` bash
$ uv run ruff check . --fix
Found 7 errors (7 fixed, 0 remaining).
```

再度確認します。チェックは通りましたね。

``` bash
$ uv run ruff check .
All checks passed!
```

テストも実行して壊れていないかも確認しておきます。

``` bash
$ uv run pytest test/ -v
========================================================== test session starts ==========================================================
platform linux -- Python 3.10.12, pytest-8.4.1, pluggy-1.6.0 -- /workspaces/ai-programing-exercise/app/.venv/bin/python
cachedir: .pytest_cache
rootdir: /workspaces/ai-programing-exercise/app
configfile: pyproject.toml
plugins: cov-6.2.1
collecting ... collected 23 items                                                                                                                      

test/test_fizz_buzz.py::TestFizzBuzz::test_3を渡したら文字列Fizzを返す PASSED                                                     [  4%]
test/test_fizz_buzz.py::TestFizzBuzz::test_5を渡したら文字列Buzzを返す PASSED                                                     [  8%]
...
========================================================== 23 passed in 0.59s ===========================================================
```

Ruffの設定は`.ruff.toml`ファイルで管理できます。

``` toml
line-length = 88
target-version = "py310"

[lint]
select = [
    "E",  # pycodestyle errors
    "W",  # pycodestyle warnings
    "F",  # pyflakes
    "I",  # isort
    "B",  # flake8-bugbear
    "C4", # flake8-comprehensions
    "UP", # pyupgrade
]
ignore = []

[format]
quote-style = "double"
indent-style = "space"
skip-magic-trailing-comma = false
line-ending = "auto"

[lint.per-file-ignores]
"test/**/*.py" = ["E501"]  # Allow long lines in tests
```

循環的複雑度 (Cyclomatic complexity)は７で設定しておきます

> 循環的複雑度 (Cyclomatic complexity)
> 循環的複雑度(サイクロマティック複雑度)とは、ソフトウェア測定法の一つであり、コードがどれぐらい> 複雑であるかをメソッド単位で数値にして表す指標。

``` toml
[tool.ruff.lint.mccabe]
# Flag errors (`C901`) whenever the complexity level exceeds 7.
max-complexity = 7
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

**Ruff** はリンターとしてだけでなく、コードフォーマッターとしても機能します。従来のblackの代替として使えます。以下のコードのフォーマットをわざと崩してみます。

``` python
class FizzBuzz:
    MAX_NUMBER: int = 100

    @classmethod
    def generate(cls, number: int) -> str:
            is_fizz = number % 3 == 0
        is_buzz = number % 5 == 0

        if is_fizz and is_buzz:
            return "FizzBuzz"
        if is_fizz:
            return "Fizz"
        if is_buzz:
            return "Buzz"

        return str(number)

    @classmethod
    def generate_list(cls) -> list[str]:
        # 1から最大値までのFizzBuzz配列を1発で作る
        return [cls.generate(n) for n in range(1, cls.MAX_NUMBER + 1)]
```

フォーマットをチェックしてみます。

``` bash
$ uv run ruff format --check .
Would reformat: lib/fizz_buzz.py
1 file would be reformatted
```

編集した部分が `Would reformat` と指摘されています。自動修正しておきましょう。

``` bash
$ uv run ruff format .
1 file reformatted
```

フォーマットが修正されたことが確認できましたね。

``` python
class FizzBuzz:
    MAX_NUMBER: int = 100

    @classmethod
    def generate(cls, number: int) -> str:
        is_fizz = number % 3 == 0
        is_buzz = number % 5 == 0

        if is_fizz and is_buzz:
            return "FizzBuzz"
        if is_fizz:
            return "Fizz"
        if is_buzz:
            return "Buzz"

        return str(number)

    @classmethod
    def generate_list(cls) -> list[str]:
        # 1から最大値までのFizzBuzz配列を1発で作る
        return [cls.generate(n) for n in range(1, cls.MAX_NUMBER + 1)]
```

``` bash
$ uv run ruff format --check .
5 files already formatted
```

### コードカバレッジ

静的コードコード解析による品質の確認はできました。では動的なテストに関してはどうでしょうか？ **コードカバレッジ** を確認する必要あります。

> コード網羅率（コードもうらりつ、英: Code coverage
> ）コードカバレッジは、ソフトウェアテストで用いられる尺度の1つである。プログラムのソースコードがテストされた割合を意味する。この場合のテストはコードを見ながら行うもので、ホワイトボックステストに分類される。
> 
> —  ウィキペディア 

Python用 **コードカバレッジ** 検出プログラムとして [pytest-cov](https://pytest-cov.readthedocs.io/)を使います。これは先程 **uv** でインストール済みです。

設定は `pyproject.toml` に記載されているのでテストを実施します。

``` bash
$ uv run pytest test/ -v --cov=lib --cov-report=term-missing
========================================================== test session starts ==========================================================
platform linux -- Python 3.10.12, pytest-8.4.1, pluggy-1.6.0 -- /workspaces/ai-programing-exercise/app/.venv/bin/python
cachedir: .pytest_cache
rootdir: /workspaces/ai-programing-exercise/app
configfile: pyproject.toml
plugins: cov-6.2.1
collecting ... collected 23 items                                                                                                                      

test/test_fizz_buzz.py::TestFizzBuzz::test_3を渡したら文字列Fizzを返す PASSED                                                     [  4%]
test/test_fizz_buzz.py::TestFizzBuzz::test_5を渡したら文字列Buzzを返す PASSED                                                     [  8%]
...
============================================================ tests coverage =============================================================
___________________________________________ coverage: platform linux, python 3.10.12-final-0 ____________________________________________

Name               Stmts   Miss  Cover   Missing
------------------------------------------------
lib/__init__.py        0      0   100%
lib/fizz_buzz.py      16      0   100%
------------------------------------------------
TOTAL                 16      0   100%
Coverage HTML written to dir htmlcov
========================================================== 23 passed in 0.59s ===========================================================
```

テスト実行後に `htmlcov` というフォルダが作成されます。その中の `index.html` を開くとカバレッジ状況を確認できます。

pyproject.tomlでpytestとカバレッジの設定を管理できます。

``` toml
[tool.pytest.ini_options]
testpaths = ["test"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "--cov=lib --cov-report=html --cov-report=term-missing"

[tool.coverage.run]
source = ["lib"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
]
```

セットアップが完了したらコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: コードカバレッジセットアップ'
```

### タスクランナー

ここまででテストの実行、静的コード解析、コードフォーマット、コードカバレッジを実施することができるようになりました。でもコマンドを実行するのにそれぞれコマンドを覚えておくのは面倒ですよね。例えばテストの実行は

``` bash
$ uv run pytest test/ -v --cov=lib --cov-report=term-missing
========================================================== test session starts ==========================================================
platform linux -- Python 3.10.12, pytest-8.4.1, pluggy-1.6.0 -- /workspaces/ai-programing-exercise/app/.venv/bin/python
...
========================================================== 23 passed in 0.59s ===========================================================
```

このようにしていました。では静的コードの解析はどうやりましたか？フォーマットはどうやりましたか？調べるのも面倒ですよね。いちいち調べるのが面倒なことは全部 **タスクランナー** にやらせるようにしましょう。

> タスクランナーとは、アプリケーションのビルドなど、一定の手順で行う作業をコマンド一つで実行できるように予めタスクとして定義したものです。
> 
> —  Pythonビルドツール 

Pythonの **タスクランナー** は `tox` です。

> toxはPythonにおけるタスクランナーです。toxコマンドと起点となるtox.iniというタスクを記述するファイルを用意することで、複数のPython環境でのテスト実行や、タスクの一覧表示を行えます。
> 
> —  Pythonビルドツール 

早速、テストタスクから作成しましょう。まず `tox.ini` を作ります。

``` bash
$ touch tox.ini
```

``` ini
[tox]
envlist = py310,lint,type,coverage
skip_missing_interpreters = true

[testenv]
deps = 
    pytest
    pytest-cov
commands = pytest {posargs}

[testenv:test]
deps = 
    pytest
    pytest-cov
commands = pytest --cov=lib --cov-report=html --cov-report=term-missing --verbose

[testenv:lint]
deps = ruff
commands = 
    ruff check .
    ruff format --check .

[testenv:format]
deps = ruff
commands = ruff format .

[testenv:type]
deps = 
    mypy
    pytest
commands = mypy lib test

[testenv:coverage]
deps = 
    pytest
    pytest-cov
commands = pytest --cov=lib --cov-report=html --cov-report=term-missing
```

タスクが登録されたか確認してみましょう。

``` bash
$ uv run tox -e test
test: install_deps> python -I -m pip install pytest pytest-cov
test: install_package> python -I -m pip install --force-reinstall --no-deps /workspaces/ai-programing-exercise/app/.tox/.tmp/package/1/app-0.1.0.tar.gz
test: commands[0]> pytest --cov=lib --cov-report=html --cov-report=term-missing --verbose
========================================================== test session starts ==========================================================
...
========================================================== 23 passed in 0.60s ===========================================================
  test: OK (119.59=setup[114.67]+cmd[4.92] seconds)
  congratulations :) (124.21 seconds)
```

タスクが実行されたことが確認できたので引き続き静的コードの解析タスクを実行してみます。

``` bash
$ uv run tox -e lint
lint: install_deps> python -I -m pip install ruff
lint: install_package> python -I -m pip install --force-reinstall --no-deps /workspaces/ai-programing-exercise/app/.tox/.tmp/package/2/app-0.1.0.tar.gz
lint: commands[0]> ruff check .
All checks passed!
lint: commands[1]> ruff format --check .
5 files already formatted
lint: OK ✔ in 19.34 seconds
```

うまく実行されたようですね。すべてのタスクを一度に実行することもできます。

``` bash
$ uv run tox
py310: install_deps> python -I -m pip install pytest pytest-cov
...
  py310: OK (95.73=setup[90.39]+cmd[5.34] seconds)
  lint: OK (19.34=setup[19.02]+cmd[0.16,0.16] seconds)
  type: OK (21.88=setup[20.37]+cmd[1.51] seconds)
  coverage: OK (84.32=setup[79.34]+cmd[4.98] seconds)
  congratulations :) (223.82 seconds)
```

セットアップができたのでコミットしておきましょう。

``` bash
$ git add .
$ git commit -m 'chore: タスクランナーセットアップ'
```

### 型チェック

Pythonは動的型付け言語ですが、型ヒントを使って静的型チェックを行うことで、より安全で保守性の高いコードを書くことができます。

> mypyとは、Pythonのための静的型チェッカーです。型ヒント（Type Hints）を使用してコードの型安全性を検証し、実行前に型エラーを検出できます。
> 
> —  Python型チェック 

**mypy** を使って型チェックを実行してみましょう。

``` bash
$ uv run mypy lib test
Success: no issues found in 4 source files
```

エラーがないことが確認できました。mypyの設定は `pyproject.toml` で管理できます。

``` toml
[tool.mypy]
python_version = "3.10"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

型チェック機能により、以下のようなメリットがあります：

- 実行前に型エラーを検出
- IDEでの補完機能の向上
- コードの可読性と保守性の向上
- リファクタリング時の安全性向上

型チェックもtoxタスクとして統合されているので、`uv run tox -e type`で実行できます。

### 最終的な開発ワークフロー

これで [ソフトウェア開発の三種の神器](https://t-wada.hatenablog.jp/entry/clean-code-that-works) の準備が完了しました。最終的な開発ワークフローは以下のようになります：

1. **開発開始**: `cd app && uv run tox` を実行して品質チェック
2. **コード作成**: テスト駆動開発のサイクル（Red-Green-Refactor）
3. **品質確認**: 各ツールが自動で品質をチェック
4. **コミット**: 品質チェックを通ったコードをGitにコミット

### 使用可能なコマンド一覧

``` bash
# すべての品質チェックとテストを実行（推奨）
uv run tox

# 個別タスクの実行
uv run tox -e test        # テストのみ
uv run tox -e lint        # リンターのみ
uv run tox -e type        # 型チェックのみ
uv run tox -e coverage    # カバレッジレポートのみ
uv run tox -e format      # フォーマットのみ

# 個別コマンドの実行
uv run pytest            # テスト実行
uv run ruff check .       # リンター実行
uv run ruff format .      # フォーマッター実行
uv run mypy lib test      # 型チェック実行
```

### 構築した環境の特徴

- **uv**: 高速なPythonパッケージマネージャーと仮想環境管理
- **Ruff**: 従来のflake8、pylint、blackを置き換える統合リンター・フォーマッター
- **mypy**: 静的型チェックによる型安全性の確保
- **pytest + pytest-cov**: テスト実行とカバレッジ計測
- **tox**: 複数環境での品質チェックとタスク管理

この環境により、次回の開発からは最初にコマンドラインで `uv run tox` を実行すれば良いコードを書くためのタスクを自動で実行してくれるようになるので、コードを書くことに集中できるようになりました。

### コミット履歴

今回のセットアップ作業で作成されたコミット：

1. `chore: パッケージマネージャーセットアップ` - uvとpyproject.tomlの設定
2. `chore: 静的コード解析セットアップ` - Ruffの設定と実行
3. `chore: コードカバレッジセットアップ` - pytest-covの設定
4. `chore: タスクランナーセットアップ` - tox.iniの設定

では、次のエピソードに進むとしましょう。
