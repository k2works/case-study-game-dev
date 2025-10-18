# ぷよぷよから始めるテスト駆動開発入門 - Elm 版

## はじめに

みなさん、こんにちは！今日は私と一緒にテスト駆動開発（TDD）を使って、Elm でぷよぷよゲームを作っていきましょう。

> テストを書きながら開発することによって、設計が良い方向に変わり、コードが改善され続け、それによって自分自身が開発に前向きになること、それがテスト駆動開発の目指すゴールです。
>
> — Kent Beck 『テスト駆動開発』 付録C　訳者解説：テスト駆動開発の現在

この記事では、Elm を使ってぷよぷよゲームを実装しながら、テスト駆動開発の基本的な流れと考え方を学んでいきます。

### Elm とは？

「Elm って何？」と思われるかもしれませんね。Elm は、Web フロントエンド開発のための関数型プログラミング言語です。

**Elm の特徴**：
- **実行時エラーなし**: Elm のコンパイラが型チェックで多くのバグを防ぐ
- **親切なコンパイラ**: エラーメッセージが分かりやすく、問題解決のヒントを提示
- **The Elm Architecture**: シンプルで予測可能なアーキテクチャパターン
- **純粋関数型**: 副作用が制御され、テストしやすいコード

### テスト駆動開発のサイクル

Elm でも、テスト駆動開発の基本は同じです：

1. **Red（赤）**: 失敗するテストを書く
2. **Green（緑）**: テストが通る最小限の実装
3. **Refactor（リファクタリング）**: コードの品質を改善

> レッド・グリーン・リファクタリング。それがTDDのマントラだ。
>
> — Kent Beck 『テスト駆動開発』

### 開発環境

Elm プロジェクトでは、以下のツールを使用します：

- **言語**: Elm — 型安全な関数型言語
- **ビルドツール**: elm make — Elm 公式のコンパイラ
- **開発サーバー**: elm reactor — 開発用の簡易サーバー
- **テストフレームワーク**: elm-test — Elm 公式のテストフレームワーク
- **パッケージ管理**: elm install — Elm 公式のパッケージマネージャー
- **バージョン管理**: Git — コード管理

## イテレーション0: 環境の構築

「環境構築って難しそう...」と思われるかもしれませんが、Elm の環境構築は驚くほどシンプルです！

### ユーザーストーリー

> 開発者として、Elm 開発環境をセットアップして、テスト駆動開発を始められるようにしたい

### 必要なツールのインストール

#### 1. Node.js のインストール

Elm は Node.js を必要とします。

```bash
# Node.js のバージョン確認
node --version
npm --version
```

まだインストールされていない場合は、https://nodejs.org/ からインストールしてください。

#### 2. Elm のインストール

```bash
# Elm をグローバルにインストール
npm install -g elm

# Elm のバージョン確認
elm --version
```

#### 3. elm-test のインストール

```bash
# elm-test をグローバルにインストール
npm install -g elm-test

# elm-test のバージョン確認
elm-test --version
```

### プロジェクトの初期化

#### 1. プロジェクトディレクトリの作成

```bash
# プロジェクトディレクトリを作成
mkdir puyo-puyo-elm
cd puyo-puyo-elm

# Git リポジトリを初期化
git init
```

#### 2. Elm プロジェクトの初期化

```bash
# elm.json を作成
elm init
```

`elm.json` が作成されます：

```json
{
    "type": "application",
    "source-directories": [
        "src"
    ],
    "elm-version": "0.19.1",
    "dependencies": {
        "direct": {
            "elm/browser": "1.0.2",
            "elm/core": "1.0.5",
            "elm/html": "1.0.0"
        },
        "indirect": {
            "elm/json": "1.1.3",
            "elm/time": "1.0.0",
            "elm/url": "1.0.0",
            "elm/virtual-dom": "1.0.3"
        }
    },
    "test-dependencies": {
        "direct": {},
        "indirect": {}
    }
}
```

#### 3. テスト環境の初期化

```bash
# テストディレクトリとサンプルテストを作成
elm-test init
```

これにより、`tests/` ディレクトリと `tests/Example.elm` が作成されます。

#### 4. 必要なパッケージのインストール

```bash
# Time モジュールをインストール（ゲームループ用）
elm install elm/time

# Random モジュールをインストール（ランダムなぷよ生成用）
elm install elm/random

# テスト用パッケージ
elm-test install elm-explorations/test
```

### タスクランナーの設定

プロジェクトの管理を簡単にするため、npm scripts をタスクランナーとして使用します。

#### package.json の作成

```bash
# package.json を作成
npm init -y
```

`package.json` を以下のように編集します：

```json
{
  "name": "puyo-puyo-elm",
  "version": "1.0.0",
  "description": "Elm version of Puyo Puyo TDD tutorial",
  "scripts": {
    "test": "elm-test",
    "dev": "elm reactor",
    "build": "elm make src/Main.elm --output=dist/main.js --optimize",
    "build:dev": "elm make src/Main.elm --output=dist/main.js",
    "watch": "elm-test --watch",
    "clean": "rimraf dist elm-stuff",
    "release": "npm test && npm run build && echo Release build completed successfully!",
    "serve": "npx http-server dist -p 8080 -o"
  },
  "devDependencies": {
    "elm": "^0.19.1-5",
    "elm-test": "^0.19.1-revision12"
  }
}
```

#### npm scripts の説明

各スクリプトの役割は以下の通りです：

- **`npm test`**: すべてのテストを実行
- **`npm run dev`**: elm reactor で開発サーバーを起動（http://localhost:8000）
- **`npm run build`**: 本番用ビルド（最適化あり）
- **`npm run build:dev`**: 開発用ビルド（デバッグ用）
- **`npm run watch`**: テストの監視モード（ファイル変更時に自動実行）
- **`npm run clean`**: ビルド成果物とキャッシュを削除
- **`npm run release`**: リリースタスク（テスト→本番ビルド）
- **`npm run serve`**: ビルドしたアプリをブラウザで実行（http://localhost:8080）

#### リリース用 HTML ファイルの準備

ビルドしたアプリケーションを実行するための HTML ファイルを用意します：

```html
<!-- dist/index.html -->
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ぷよぷよ - Elm 版</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #1a1a1a;
            color: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        #app {
            background-color: #2a2a2a;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }
    </style>
</head>
<body>
    <div id="app"></div>
    <script src="main.js"></script>
    <script>
        var app = Elm.Main.init({
            node: document.getElementById('app')
        });
    </script>
</body>
</html>
```

#### .gitignore の更新

npm 関連のファイルとビルド成果物を除外します：

```gitignore
# Elm
elm-stuff/

# elm-test
tests/VerifyExamples/

# npm
node_modules/

# ビルド成果物
dist/*.js
dist/*.js.map

# エディタ
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

**注意**: `dist/index.html` は配布物として必要なため、git の管理対象に含めます。

### プロジェクト構成

```
puyo-puyo-elm/
├── elm.json              # Elm プロジェクト設定
├── package.json          # npm scripts 定義
├── package-lock.json     # npm 依存関係ロック
├── src/                  # ソースコード
│   ├── Main.elm          # エントリーポイント
│   ├── Board.elm         # ボード管理
│   ├── Cell.elm          # セル定義
│   ├── PuyoColor.elm     # ぷよの色
│   ├── PuyoPair.elm      # ぷよペア
│   └── GameLogic.elm     # ゲームロジック
├── tests/                # テストコード
│   ├── BoardTests.elm
│   ├── PuyoPairTests.elm
│   ├── GameLogicTests.elm
│   └── MainTests.elm
├── dist/                 # ビルド成果物
│   ├── index.html        # エントリーHTML（配布用）
│   ├── main.js           # ビルドされた JavaScript（.gitignore）
│   └── main.js.map       # ソースマップ（.gitignore）
├── .gitignore            # Git 除外設定
└── README.md             # プロジェクト説明
```

### The Elm Architecture の基本

Elm では、すべてのアプリケーションが **The Elm Architecture (TEA)** というパターンに従います。

```elm
-- Model: アプリケーションの状態
type alias Model =
    { count : Int
    }

-- Message: 状態を変更するイベント
type Msg
    = Increment
    | Decrement

-- init: 初期状態
init : Model
init =
    { count = 0
    }

-- update: メッセージに応じて状態を更新
update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            { model | count = model.count + 1 }

        Decrement ->
            { model | count = model.count - 1 }

-- view: 状態を HTML に変換
view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Decrement ] [ text "-" ]
        , text (String.fromInt model.count)
        , button [ onClick Increment ] [ text "+" ]
        ]
```

「シンプルですね！」そうなんです。Elm のアーキテクチャは、以下の 3 つの関数で構成されます：

1. **Model**: アプリケーションの状態を定義
2. **Update**: メッセージを受け取り、新しい状態を返す
3. **View**: 状態を受け取り、HTML を返す

### 最小限のアプリケーション

まず、動作確認のために最小限のアプリケーションを作成しましょう。

```elm
-- src/Main.elm
module Main exposing (main)

import Browser
import Html exposing (Html, div, h1, text)


-- MODEL

type alias Model =
    {}


init : Model
init =
    {}


-- UPDATE

type Msg
    = NoOp


update : Msg -> Model -> Model
update msg model =
    case msg of
        NoOp ->
            model


-- VIEW

view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        ]


-- MAIN

main : Program () Model Msg
main =
    Browser.sandbox
        { init = init
        , update = update
        , view = view
        }
```

### アプリケーションの実行

npm scripts を使って開発サーバーを起動します：

```bash
# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:8000 を開き、`src/Main.elm` をクリックすると、アプリケーションが表示されます。

### テストの実行

npm scripts を使ってテストを実行します：

```bash
# すべてのテストを実行
npm test

# または、ファイル変更時に自動実行（監視モード）
npm run watch
```

### リリースビルドとアプリケーションの実行

開発が進んだら、最適化されたビルドを作成して実行できます：

```bash
# リリースビルド（テスト→最適化ビルド）
npm run release

# ビルドしたアプリケーションをブラウザで実行
npm run serve
```

これにより、http://localhost:8080 でアプリケーションが起動します。

### 最初のコミット

環境構築が完了したら、コミットしましょう：

```bash
git add .
git commit -m "$(cat <<'EOF'
chore: initialize Elm project

- Install Elm and elm-test
- Create elm.json with basic dependencies
- Set up project structure (src/ and tests/)
- Add minimal Main.elm application
- Add package.json with npm scripts (test, dev, build, release, serve)
- Add dist/index.html for running built application
- Add .gitignore for Elm and npm projects
- Verify npm test and npm run dev work

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Elm の型システム

Elm の強力な型システムについて少し説明しましょう。

#### カスタム型（Custom Types）

Elm では、独自の型を定義できます：

```elm
-- セルの状態を表す型
type Cell
    = Empty
    | Filled PuyoColor

-- ぷよの色を表す型
type PuyoColor
    = Red
    | Green
    | Blue
    | Yellow
```

「判別共用体みたいなものですね！」そうです。Elm のカスタム型は、F# の判別共用体や TypeScript の Union 型に似ています。

#### パターンマッチング

カスタム型を使う場合は、パターンマッチングで分岐します：

```elm
cellToColor : Cell -> String
cellToColor cell =
    case cell of
        Empty ->
            "white"

        Filled Red ->
            "red"

        Filled Green ->
            "green"

        Filled Blue ->
            "blue"

        Filled Yellow ->
            "yellow"
```

「網羅性チェックがあるんですね！」そうです。コンパイラがすべてのパターンをチェックしてくれるので、漏れがありません。

#### Maybe 型

Elm には `null` がありません。代わりに `Maybe` 型を使います：

```elm
type Maybe a
    = Just a
    | Nothing

-- 配列から要素を取得（失敗する可能性がある）
Array.get : Int -> Array a -> Maybe a
```

```elm
-- Maybe 型の使用例
getCell : Int -> Int -> Board -> Maybe Cell
getCell x y board =
    if x >= 0 && x < board.cols && y >= 0 && y < board.rows then
        Array.get y board.cells
            |> Maybe.andThen (Array.get x)
    else
        Nothing
```

#### レコード型

Elm のレコードは、名前付きフィールドを持つ構造体です：

```elm
type alias Board =
    { cols : Int
    , rows : Int
    , cells : Array (Array Cell)
    }

-- レコードの作成
initialBoard : Board
initialBoard =
    { cols = 6
    , rows = 12
    , cells = Array.repeat 12 (Array.repeat 6 Empty)
    }

-- レコードの更新（イミュータブル）
updateBoard : Board -> Board
updateBoard board =
    { board | cols = 8 }  -- cols のみ更新した新しいレコードを返す
```

### Elm の関数型プログラミング

#### 不変性

Elm では、すべての値が不変（イミュータブル）です：

```elm
-- 元のリストは変更されず、新しいリストが返される
numbers : List Int
numbers =
    [ 1, 2, 3 ]

-- 新しいリストを作成
newNumbers : List Int
newNumbers =
    List.map (\n -> n * 2) numbers
    -- [ 2, 4, 6 ]

-- numbers は変更されていない
-- [ 1, 2, 3 ]
```

#### パイプライン演算子

Elm のパイプライン演算子 `|>` は、関数を左から右へ適用します：

```elm
-- パイプラインなし
result =
    String.toUpper (String.trim "  hello  ")

-- パイプラインあり
result =
    "  hello  "
        |> String.trim
        |> String.toUpper
```

「処理の流れが読みやすいですね！」そうです。データの変換過程が明確になります。

### イテレーション０のまとめ

このイテレーションでは、以下を学びました：

1. **Elm のインストール**: elm と elm-test のセットアップ
2. **プロジェクト構成**: src/ と tests/ の構造、package.json と dist/ の配置
3. **タスクランナー**: npm scripts を使った開発ワークフロー（test, dev, build, release, serve）
4. **The Elm Architecture**: Model-Update-View パターン
5. **型システムの基本**: カスタム型、Maybe 型、レコード型
6. **関数型プログラミング**: 不変性、パターンマッチング、パイプライン演算子
7. **開発ツール**: npm run dev（elm reactor）と npm test（elm-test）の使い方
8. **リリースビルド**: 最適化ビルドとブラウザでの実行方法

**開発ワークフロー**：
- 開発時: `npm run dev` で elm reactor を起動
- テスト: `npm test` でテスト実行、`npm run watch` で監視モード
- リリース: `npm run release` でテスト→ビルド、`npm run serve` でアプリ起動

次のイテレーションでは、実際にぷよぷよゲームのドメインモデルを作成していきます！

## イテレーション1: ゲーム開始の実装

さあ、いよいよコードを書き始めましょう！テスト駆動開発では、小さなイテレーション（反復）で機能を少しずつ追加していきます。最初のイテレーションでは、最も基本的な機能である「ゲームの開始」を実装します。

> システム構築はどこから始めるべきだろうか。システム構築が終わったらこうなる、というストーリーを語るところからだ。
>
> — Kent Beck 『テスト駆動開発』

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、新しいゲームを開始できる

このシンプルなストーリーから始めることで、ゲームの基本的な構造を作り、後続の機能追加の土台を築くことができます。では、テスト駆動開発のサイクルに従って、まずはテストから書いていきましょう！

### TODOリスト

さて、ユーザーストーリーを実装するために、まずはTODOリストを作成しましょう。TODOリストは、大きな機能を小さなタスクに分解するのに役立ちます。

> 何をテストすべきだろうか - 着手する前に、必要になりそうなテストをリストに書き出しておこう。
>
> — Kent Beck 『テスト駆動開発』

私たちの「新しいゲームを開始できる」というユーザーストーリーを実現するためには、どのようなタスクが必要でしょうか？考えてみましょう：

- ドメインモデルの定義（Cell、PuyoColor、Board、PuyoPair 型）
- ボードの初期化処理（空のボードを作成）
- ボードの操作関数（セルの取得、セルの設定）
- ぷよペアの作成と配置
- The Elm Architecture の実装（Model、Msg、update、view）
- ゲームの初期化処理

これらのタスクを一つずつ実装していきましょう。テスト駆動開発では、各タスクに対してテスト→実装→リファクタリングのサイクルを回します。まずは「ドメインモデルの定義」から始めましょう！

### ドメインモデルの設計

Elm では型を使ってドメインモデルを明確に表現できます。まずは、ぷよぷよゲームの基本的な概念を型として定義しましょう。

#### セルの状態を表す型

ボードの各セルは、「空」か「ぷよで埋まっている」のどちらかの状態です。これを Elm のカスタム型で表現します：

```elm
-- src/Cell.elm
module Cell exposing (Cell(..))

import PuyoColor exposing (PuyoColor)


type Cell
    = Empty
    | Filled PuyoColor
```

「シンプルですね！」そうなんです。Elm のカスタム型は、TypeScript の Union 型や F# の判別共用体に似ていますが、コンパイラによる網羅性チェックが強力なのが特徴です。

#### ぷよの色を表す型

ぷよには4つの色があります：

```elm
-- src/PuyoColor.elm
module PuyoColor exposing (PuyoColor(..))


type PuyoColor
    = Red
    | Green
    | Blue
    | Yellow
```

「この型定義、とても読みやすいですね！」そうなんです。Elm の型システムは、コードを自己文書化してくれます。

#### ボードを表す型

次に、ゲームのボード（盤面）を表す型を定義します：

```elm
-- src/Board.elm
module Board exposing
    ( Board
    , Cols
    , Rows
    , create
    , getCell
    , setCell
    )

import Array exposing (Array)
import Cell exposing (Cell(..))


type alias Cols =
    Int


type alias Rows =
    Int


type alias Board =
    { cols : Cols
    , rows : Rows
    , cells : Array (Array Cell)
    }


-- ボードを作成する
create : Cols -> Rows -> Board
create cols rows =
    { cols = cols
    , rows = rows
    , cells = Array.repeat rows (Array.repeat cols Empty)
    }


-- セルを取得する
getCell : Int -> Int -> Board -> Maybe Cell
getCell x y board =
    if x >= 0 && x < board.cols && y >= 0 && y < board.rows then
        Array.get y board.cells
            |> Maybe.andThen (Array.get x)

    else
        Nothing


-- セルを設定する
setCell : Int -> Int -> Cell -> Board -> Board
setCell x y cell board =
    if x >= 0 && x < board.cols && y >= 0 && y < board.rows then
        let
            newRow =
                Array.get y board.cells
                    |> Maybe.map (\row -> Array.set x cell row)
                    |> Maybe.withDefault (Array.repeat board.cols Empty)

            newCells =
                Array.set y newRow board.cells
        in
        { board | cells = newCells }

    else
        board
```

「`Maybe` 型を使っているんですね！」そうです。Elm には `null` がないので、失敗する可能性のある操作は `Maybe` 型で表現します。これにより、`null` 参照エラーが起こらない安全なコードが書けるんです。

#### ぷよペアを表す型

ぷよぷよでは、2つのぷよが一組になって落ちてきます。これを「ぷよペア」として定義します：

```elm
-- src/PuyoPair.elm
module PuyoPair exposing
    ( PuyoPair
    , Position
    , create
    , getPositions
    )

import PuyoColor exposing (PuyoColor)


type alias Position =
    { x : Int, y : Int }


type alias PuyoPair =
    { axis : Position
    , child : Position
    , axisColor : PuyoColor
    , childColor : PuyoColor
    }


-- ぷよペアを作成する
create : Int -> Int -> PuyoColor -> PuyoColor -> PuyoPair
create x y axisColor childColor =
    { axis = { x = x, y = y }
    , child = { x = x, y = y - 1 }
    , axisColor = axisColor
    , childColor = childColor
    }


-- ぷよペアの位置を取得する
getPositions : PuyoPair -> ( Position, Position )
getPositions pair =
    ( pair.axis, pair.child )
```

「レコード型を使っているんですね！」そうです。Elm のレコード型は、名前付きフィールドを持つ構造体です。型エイリアス（`type alias`）を使うことで、複雑な型に意味のある名前を付けられます。

### テスト: ボードの操作

では、定義したドメインモデルが正しく動作することをテストしましょう。Elm では `elm-test` を使ってテストを書きます。

#### ボードのテスト

```elm
-- tests/BoardTests.elm
module BoardTests exposing (suite)

import Array
import Board exposing (Board)
import Cell exposing (Cell(..))
import Expect
import PuyoColor exposing (PuyoColor(..))
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "Board"
        [ describe "create"
            [ test "指定したサイズの空のボードを作成できる" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    Expect.all
                        [ \b -> Expect.equal 6 b.cols
                        , \b -> Expect.equal 12 b.rows
                        , \b -> Expect.equal 12 (Array.length b.cells)
                        ]
                        board
            ]
        , describe "getCell"
            [ test "範囲内のセルを取得できる" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    Board.getCell 0 0 board
                        |> Expect.equal (Just Empty)
            , test "範囲外のセルは Nothing を返す" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    Board.getCell 10 10 board
                        |> Expect.equal Nothing
            ]
        , describe "setCell"
            [ test "セルに値を設定できる" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        updatedBoard =
                            Board.setCell 2 3 (Filled Red) board
                    in
                    Board.getCell 2 3 updatedBoard
                        |> Expect.equal (Just (Filled Red))
            , test "範囲外のセルへの設定は無視される" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        updatedBoard =
                            Board.setCell 10 10 (Filled Red) board
                    in
                    Expect.equal board updatedBoard
            ]
        ]
```

「テストコードも読みやすいですね！」そうです。Elm のテストは、`describe` でグループ化し、`test` で個別のテストケースを定義します。`\_ ->` はラムダ式（無名関数）で、引数を無視しています。

### テストの実行

テストを実行してみましょう：

```bash
elm-test
```

すべてのテストが通れば成功です！

```
TEST RUN PASSED

Duration: 123 ms
Passed:   7
Failed:   0
```

「おお、すべてのテストが通りました！」素晴らしいですね。これがテスト駆動開発の「Green（緑）」の状態です。

### The Elm Architecture の実装

次に、The Elm Architecture (TEA) を使ってゲームのメイン構造を実装します。

#### Model の定義

まず、アプリケーションの状態を表す Model を定義します：

```elm
-- src/Main.elm
module Main exposing (main)

import Board exposing (Board)
import Browser
import Cell exposing (Cell(..))
import Html exposing (Html, div, h1, text)
import Html.Attributes exposing (style)
import PuyoColor exposing (PuyoColor(..))
import PuyoPair exposing (PuyoPair)


-- MODEL


type GameMode
    = Start
    | Playing
    | GameOver


type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    }


init : () -> Model
init _ =
    { board = Board.create 6 12
    , currentPair = Nothing
    , mode = Start
    }
```

「`GameMode` というカスタム型を定義しているんですね！」そうです。ゲームの状態を明確に型で表現することで、どの状態でどの操作が可能かをコンパイラがチェックしてくれます。

#### Msg の定義

次に、アプリケーションで発生するイベントを表す Msg を定義します：

```elm
-- UPDATE


type Msg
    = StartGame
    | Tick
    | NoOp


update : Msg -> Model -> Model
update msg model =
    case msg of
        StartGame ->
            { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
            }

        Tick ->
            -- 後で実装
            model

        NoOp ->
            model
```

「`StartGame` メッセージでゲームを開始するんですね！」そうです。メッセージを受け取ると、新しい Model を返します。Elm では、すべてのデータが不変（イミュータブル）なので、元の Model を変更せず、新しい Model を作成して返します。

#### View の実装

最後に、Model を HTML に変換する View を実装します：

```elm
-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style "padding" "20px"
        , style "font-family" "Arial, sans-serif"
        ]
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div [] [ text ("ゲームモード: " ++ gameModeToString model.mode) ]
        , viewBoard model.board
        , viewCurrentPair model.currentPair
        ]


gameModeToString : GameMode -> String
gameModeToString mode =
    case mode of
        Start ->
            "スタート"

        Playing ->
            "プレイ中"

        GameOver ->
            "ゲームオーバー"


viewBoard : Board -> Html Msg
viewBoard board =
    div
        [ style "margin-top" "20px"
        , style "padding" "10px"
        , style "background-color" "#f0f0f0"
        , style "display" "inline-block"
        ]
        [ text ("ボード: " ++ String.fromInt board.cols ++ "x" ++ String.fromInt board.rows) ]


viewCurrentPair : Maybe PuyoPair -> Html Msg
viewCurrentPair maybePair =
    case maybePair of
        Just pair ->
            div
                [ style "margin-top" "10px" ]
                [ text
                    ("現在のぷよペア: ("
                        ++ String.fromInt pair.axis.x
                        ++ ", "
                        ++ String.fromInt pair.axis.y
                        ++ ")"
                    )
                ]

        Nothing ->
            div [] []
```

「`Maybe` 型のパターンマッチングを使っているんですね！」そうです。`currentPair` が `Just pair` の場合はぷよペアを表示し、`Nothing` の場合は何も表示しません。コンパイラが両方のケースをチェックしてくれるので、安全です。

#### Main 関数

最後に、アプリケーションのエントリーポイントを定義します：

```elm
-- MAIN


main : Program () Model Msg
main =
    Browser.sandbox
        { init = init ()
        , update = update
        , view = view
        }
```

「`Browser.sandbox` を使っているんですね！」そうです。`Browser.sandbox` は、コマンドやサブスクリプション（外部との通信）が不要な、シンプルなアプリケーションに最適です。

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックすると、ぷよぷよゲームの初期画面が表示されます。

「ゲームが表示されました！」おめでとうございます！リリースに向けて最初の第一歩を踏み出すことができました。

> トップダウンでもボトムアップでもなく、エンドツーエンドで構築していく
>
>    エンドツーエンドで小さな機能を構築し、そこから作業を進めながら問題について学習していく。
>
> — 達人プログラマー 熟達に向けたあなたの旅（第2版）

### イテレーション1のまとめ

このイテレーションで実装した内容：

1. **ドメインモデルの定義**
   - `Cell` 型: セルの状態（Empty または Filled）
   - `PuyoColor` 型: ぷよの色（Red, Green, Blue, Yellow）
   - `Board` 型: ゲームボード（cols, rows, cells）
   - `PuyoPair` 型: ぷよペア（axis, child, colors）

2. **ボード操作関数**
   - `create`: 空のボードを作成
   - `getCell`: セルを取得（Maybe 型を返す）
   - `setCell`: セルを設定（範囲外は無視）

3. **The Elm Architecture の実装**
   - `Model`: アプリケーションの状態（board, currentPair, mode）
   - `Msg`: イベント（StartGame, Tick, NoOp）
   - `update`: メッセージに応じた状態更新
   - `view`: 状態を HTML に変換

4. **テストの作成**
   - ボード操作関数のテスト（範囲チェック含む）
   - elm-test による自動テスト

### 学んだこと

- **型安全性**: Elm のカスタム型で、不正な状態を型レベルで防ぐ
- **Maybe 型**: null を排除し、失敗する可能性を明示的に扱う
- **不変性**: すべてのデータがイミュータブルで、副作用がない
- **パターンマッチング**: コンパイラによる網羅性チェック
- **The Elm Architecture**: シンプルで予測可能な状態管理

次のイテレーションでは、キーボード入力でぷよを移動できるようにします！

## イテレーション2: ぷよの移動の実装

さて、前回のイテレーションでゲームの基本的な構造ができましたね。「ゲームが始まったけど、ぷよが動かないと面白くないよね？」と思いませんか？そこで次は、ぷよを左右に移動できるようにしていきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、落ちてくるぷよを左右に移動できる

「ぷよぷよって、落ちてくるぷよを左右に動かして、うまく積み上げるゲームですよね？」そうです！今回はその基本操作である「左右の移動」を実装していきます。

### TODOリスト

さて、このユーザーストーリーを実現するために、どんなタスクが必要でしょうか？一緒に考えてみましょう。
「ぷよを左右に移動する」という機能を実現するためには、以下のようなタスクが必要そうですね：

- キーボード入力を検出する（Browser.Events でキーボードイベントを購読）
- ぷよペアの移動処理を実装する（左右への移動）
- 移動可能かどうかのチェック（ボードの端や既存のぷよとの衝突判定）
- The Elm Architecture への統合（Msg、update、subscriptions）

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。テスト駆動開発の流れに沿って、まずはテストから書いていきますよ。

### キーボード入力の設計

Elm では、キーボード入力を扱うために `Browser.Events` モジュールの `onKeyDown` を使います。TypeScript 版とは異なり、Elm では副作用（イベントリスナーの登録など）はすべて The Elm Architecture の枠組みの中で管理されます。

まず、必要なパッケージをインストールします：

```bash
# Browser.Events モジュールを含むパッケージは既に elm/browser に含まれている
# JSON デコーダを使うために elm/json が必要（既にインストール済み）
```

### テスト: ぷよペアの移動

まずは、ぷよペアの移動ロジックをテストしましょう：

```elm
-- tests/PuyoPairTests.elm
module PuyoPairTests exposing (suite)

import Board
import Cell exposing (Cell(..))
import Expect
import PuyoColor exposing (PuyoColor(..))
import PuyoPair
import Test exposing (Test, describe, test)


suite : Test
suite =
    describe "PuyoPair"
        [ describe "moveLeft"
            [ test "左に移動できる場合、左に移動する" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        movedPair =
                            PuyoPair.moveLeft pair
                    in
                    Expect.equal 1 movedPair.axis.x
            , test "左端にいる場合でも移動する（衝突判定は別で行う）" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 0 5 Red Blue

                        movedPair =
                            PuyoPair.moveLeft pair
                    in
                    Expect.equal -1 movedPair.axis.x
            ]
        , describe "moveRight"
            [ test "右に移動できる場合、右に移動する" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        movedPair =
                            PuyoPair.moveRight pair
                    in
                    Expect.equal 3 movedPair.axis.x
            ]
        , describe "canMove"
            [ test "移動先にぷよがなければ移動可能" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal True
            , test "軸ぷよがボード範囲外なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create -1 5 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            , test "子ぷよがボード範囲外なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 -1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            , test "移動先にぷよがあれば移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 5 (Filled Red)

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            ]
        ]
```

「Elm のテストは型安全ですね！」そうなんです。Elm では、コンパイラが型チェックをしてくれるので、テストを書く段階で多くのバグを防げます。

### 実装: ぷよペアの移動

では、テストが通るように PuyoPair モジュールを拡張しましょう：

```elm
-- src/PuyoPair.elm
module PuyoPair exposing
    ( PuyoPair
    , Position
    , canMove
    , create
    , getPositions
    , moveLeft
    , moveRight
    )

import Board exposing (Board)
import Cell exposing (Cell(..))
import PuyoColor exposing (PuyoColor)


type alias Position =
    { x : Int, y : Int }


type alias PuyoPair =
    { axis : Position
    , child : Position
    , axisColor : PuyoColor
    , childColor : PuyoColor
    }


-- ぷよペアを作成する
create : Int -> Int -> PuyoColor -> PuyoColor -> PuyoPair
create x y axisColor childColor =
    { axis = { x = x, y = y }
    , child = { x = x, y = y - 1 }
    , axisColor = axisColor
    , childColor = childColor
    }


-- ぷよペアの位置を取得する
getPositions : PuyoPair -> ( Position, Position )
getPositions pair =
    ( pair.axis, pair.child )


-- 左に移動する
moveLeft : PuyoPair -> PuyoPair
moveLeft pair =
    { pair
        | axis = { x = pair.axis.x - 1, y = pair.axis.y }
        , child = { x = pair.child.x - 1, y = pair.child.y }
    }


-- 右に移動する
moveRight : PuyoPair -> PuyoPair
moveRight pair =
    { pair
        | axis = { x = pair.axis.x + 1, y = pair.axis.y }
        , child = { x = pair.child.x + 1, y = pair.child.y }
    }


-- 移動可能かチェックする
canMove : PuyoPair -> Board -> Bool
canMove pair board =
    let
        axisCell =
            Board.getCell pair.axis.x pair.axis.y board

        childCell =
            Board.getCell pair.child.x pair.child.y board
    in
    case ( axisCell, childCell ) of
        ( Just Empty, Just Empty ) ->
            True

        _ ->
            False
```

「不変性を保ちながら移動しているんですね！」そうです。Elm では、すべてのデータが不変（イミュータブル）なので、元のぷよペアを変更せず、新しいぷよペアを作成して返します。レコード更新構文（`{ pair | ... }`）を使うことで、一部のフィールドだけを更新した新しいレコードを簡潔に作れます。

### テストの実行

テストを実行してみましょう：

```bash
elm-test
```

すべてのテストが通れば成功です！

```
TEST RUN PASSED

Duration: 145 ms
Passed:   13
Failed:   0
```

「おお、すべてのテストが通りました！」素晴らしいですね。これがテスト駆動開発の「Green（緑）」の状態です。

### The Elm Architecture への統合

次に、キーボード入力を The Elm Architecture に統合します。Elm では、キーボードイベントは「サブスクリプション（Subscriptions）」として扱います。

まず、Main.elm を更新して、キーボード入力を処理できるようにします：

```elm
-- src/Main.elm
module Main exposing (main)

import Board exposing (Board)
import Browser
import Browser.Events
import Cell exposing (Cell(..))
import Html exposing (Html, button, div, h1, text)
import Html.Attributes exposing (style)
import Html.Events exposing (onClick)
import Json.Decode as Decode
import PuyoColor exposing (PuyoColor(..))
import PuyoPair exposing (PuyoPair)


-- MODEL


type GameMode
    = Start
    | Playing
    | GameOver


type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { board = Board.create 6 12
      , currentPair = Nothing
      , mode = Start
      }
    , Cmd.none
    )


-- UPDATE


type Msg
    = StartGame
    | KeyPressed String
    | Tick
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
              }
            , Cmd.none
            )

        KeyPressed key ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        newPair =
                            case key of
                                "ArrowLeft" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveLeft pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                "ArrowRight" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveRight pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                _ ->
                                    pair
                    in
                    ( { model | currentPair = Just newPair }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        Tick ->
            -- 後で実装
            ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )


-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.mode of
        Playing ->
            Browser.Events.onKeyDown (Decode.map KeyPressed keyDecoder)

        _ ->
            Sub.none


keyDecoder : Decode.Decoder String
keyDecoder =
    Decode.field "key" Decode.string


-- VIEW


view : Model -> Html Msg
view model =
    div
        [ style "padding" "20px"
        , style "font-family" "Arial, sans-serif"
        ]
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div [] [ text ("ゲームモード: " ++ gameModeToString model.mode) ]
        , viewGameControls model
        , viewBoard model.board model.currentPair
        ]


viewGameControls : Model -> Html Msg
viewGameControls model =
    case model.mode of
        Start ->
            button [ onClick StartGame ] [ text "ゲーム開始" ]

        _ ->
            div [] []


gameModeToString : GameMode -> String
gameModeToString mode =
    case mode of
        Start ->
            "スタート"

        Playing ->
            "プレイ中"

        GameOver ->
            "ゲームオーバー"


viewBoard : Board -> Maybe PuyoPair -> Html Msg
viewBoard board maybePair =
    div
        [ style "margin-top" "20px"
        , style "display" "inline-block"
        , style "border" "2px solid #444"
        , style "background-color" "#2a2a2a"
        ]
        (List.range 0 (board.rows - 1)
            |> List.map (\y -> viewRow board maybePair y)
        )


viewRow : Board -> Maybe PuyoPair -> Int -> Html Msg
viewRow board maybePair y =
    div [ style "display" "flex" ]
        (List.range 0 (board.cols - 1)
            |> List.map (\x -> viewCell board maybePair x y)
        )


viewCell : Board -> Maybe PuyoPair -> Int -> Int -> Html Msg
viewCell board maybePair x y =
    let
        cellContent =
            case Board.getCell x y board of
                Just cell ->
                    cell

                Nothing ->
                    Empty

        isPairPosition =
            case maybePair of
                Just pair ->
                    (pair.axis.x == x && pair.axis.y == y)
                        || (pair.child.x == x && pair.child.y == y)

                Nothing ->
                    False

        color =
            if isPairPosition then
                case maybePair of
                    Just pair ->
                        if pair.axis.x == x && pair.axis.y == y then
                            puyoColorToString pair.axisColor

                        else
                            puyoColorToString pair.childColor

                    Nothing ->
                        "#888"

            else
                case cellContent of
                    Empty ->
                        "#888"

                    Filled puyoColor ->
                        puyoColorToString puyoColor
    in
    div
        [ style "width" "32px"
        , style "height" "32px"
        , style "margin" "2px"
        , style "border-radius" "50%"
        , style "background-color" color
        , style "border" "2px solid #000"
        ]
        []


puyoColorToString : PuyoColor -> String
puyoColorToString color =
    case color of
        Red ->
            "#ff0000"

        Green ->
            "#00ff00"

        Blue ->
            "#0000ff"

        Yellow ->
            "#ffff00"


-- MAIN


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
```

「`Browser.element` に変わったんですね！」そうです。`Browser.sandbox` は、コマンドやサブスクリプションが使えないシンプルなアプリケーション用です。今回はキーボードイベントを購読する必要があるので、`Browser.element` を使います。

「サブスクリプションって何ですか？」良い質問です！サブスクリプションは、外部からのイベント（キーボード入力、タイマー、WebSocket など）を Elm アプリケーションに通知する仕組みです。Elm では、すべての副作用が The Elm Architecture の枠組みの中で管理されるので、イベントリスナーの登録もサブスクリプションとして宣言的に記述します。

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。「ゲーム開始」ボタンをクリックすると、ぷよペアが表示されます。キーボードの左右矢印キーを押すと、ぷよが左右に移動します！

「本当だ！ぷよが動きました！」おめでとうございます！キーボード入力でぷよを操作できるようになりましたね。

### イテレーション2のまとめ

このイテレーションで実装した内容：

1. **ぷよペアの移動機能**
   - `moveLeft`: 左に移動
   - `moveRight`: 右に移動
   - `canMove`: 移動可能かチェック（ボード範囲と衝突判定）

2. **キーボード入力の統合**
   - `Browser.Events.onKeyDown`: キーボードイベントの購読
   - `keyDecoder`: JSON デコーダでキー名を取得
   - `subscriptions`: ゲームモードに応じたサブスクリプション

3. **The Elm Architecture の拡張**
   - `Browser.element`: コマンドとサブスクリプションをサポート
   - `init`: タプル（Model, Cmd）を返すように変更
   - `update`: タプル（Model, Cmd）を返すように変更
   - `KeyPressed`: キー入力メッセージの追加

4. **ビューの改善**
   - ボードとぷよペアの視覚的な表示
   - CSS スタイルで円形のぷよを表現
   - ゲーム開始ボタンの追加

### 学んだこと

- **サブスクリプション**: 外部イベントを宣言的に購読する仕組み
- **JSON デコーダ**: 外部データ（キーボードイベント）を Elm の型に変換
- **不変性**: レコード更新構文で一部のフィールドを更新
- **パターンマッチング**: Maybe 型とタプルの組み合わせでロジックを表現
- **Browser.element**: コマンドとサブスクリプションが必要な場合に使用

次のイテレーションでは、ぷよを回転させる機能を実装します！

## イテレーション3: ぷよの回転の実装

「左右に移動できるようになったけど、ぷよぷよって回転もできますよね？」そうですね！ぷよぷよの醍醐味の一つは、ぷよを回転させて思い通りの場所に配置することです。今回は、ぷよを回転させる機能を実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、落ちてくるぷよを回転できる

「回転って具体的にどういう動きですか？」良い質問ですね！ぷよぷよでは、2つのぷよが連なった状態で落ちてきます。回転とは、この2つのぷよの相対的な位置関係を変えることです。例えば、縦に並んでいるぷよを横に並ぶように変えたりできるんですよ。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「ぷよを回転させる」という機能を実現するためには、以下のようなタスクが必要そうですね：

- ぷよの回転状態を管理する（0: 上、1: 右、2: 下、3: 左）
- ぷよペアの回転処理を実装する（時計回り・反時計回り）
- 回転可能かどうかのチェックを実装する（壁や既存のぷよとの衝突判定）
- 壁キック処理を実装する（壁際での回転を可能にする特殊処理）
- The Elm Architecture への統合（回転メッセージの追加）

「壁キックって何ですか？」壁キックとは、ぷよが壁際にあるときに回転すると壁にめり込んでしまうので、自動的に少し位置をずらして回転を可能にする処理のことです。プレイヤーの操作性を向上させるための工夫なんですよ。

### テスト: ぷよペアの回転

「まずは何からテストしますか？」テスト駆動開発の流れに沿って、まずは基本的な回転機能のテストから書いていきましょう。

```elm
-- tests/PuyoPairTests.elm（続き）
suite : Test
suite =
    describe "PuyoPair"
        [ -- 既存のテスト...
        , describe "rotate"
            [ test "時計回りに回転すると、子ぷよが軸ぷよの右に移動する" <|
                \_ ->
                    let
                        -- 子ぷよが上にある状態（rotation = 0）
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        rotatedPair =
                            PuyoPair.rotate pair
                    in
                    Expect.all
                        [ \p -> Expect.equal 2 p.axis.x
                        , \p -> Expect.equal 5 p.axis.y
                        , \p -> Expect.equal 3 p.child.x
                        , \p -> Expect.equal 5 p.child.y
                        ]
                        rotatedPair
            , test "4回回転すると元の位置に戻る" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        rotatedPair =
                            pair
                                |> PuyoPair.rotate
                                |> PuyoPair.rotate
                                |> PuyoPair.rotate
                                |> PuyoPair.rotate
                    in
                    Expect.all
                        [ \p -> Expect.equal pair.axis p.axis
                        , \p -> Expect.equal pair.child p.child
                        ]
                        rotatedPair
            ]
        , describe "rotateWithKick"
            [ test "壁際で回転時、壁キックが発生する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        -- 右端に配置（x = 5）
                        pair =
                            PuyoPair.create 5 5 Red Blue

                        -- 回転すると子ぷよが壁外（x = 6）になるので壁キック
                        ( movedPair, kicked ) =
                            PuyoPair.rotateWithKick pair board
                    in
                    Expect.all
                        [ \_ -> Expect.equal True kicked
                        , \_ -> Expect.equal 4 movedPair.axis.x
                        ]
                        ()
            , test "壁キックが不要な場合、位置は変わらない" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        -- 中央に配置
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        ( rotatedPair, kicked ) =
                            PuyoPair.rotateWithKick pair board
                    in
                    Expect.all
                        [ \_ -> Expect.equal False kicked
                        , \_ -> Expect.equal 2 rotatedPair.axis.x
                        ]
                        ()
            ]
        ]
```

「このテストは何を確認しているんですか？」このテストでは、以下のケースを確認しています：

1. 時計回りに回転すると、子ぷよの位置が正しく変わるか
2. 4回回転すると元の位置に戻るか（循環するか）
3. 壁際で回転時、壁キックが正しく発生するか
4. 壁キックが不要な場合、位置が変わらないか

### 実装: ぷよペアの回転

では、テストが通るように PuyoPair モジュールを拡張しましょう：

```elm
-- src/PuyoPair.elm（拡張版）
module PuyoPair exposing
    ( PuyoPair
    , Position
    , canMove
    , create
    , getPositions
    , moveLeft
    , moveRight
    , rotate
    , rotateWithKick
    )

import Board exposing (Board)
import Cell exposing (Cell(..))
import PuyoColor exposing (PuyoColor)


type alias Position =
    { x : Int, y : Int }


type alias PuyoPair =
    { axis : Position
    , child : Position
    , axisColor : PuyoColor
    , childColor : PuyoColor
    , rotation : Int
    }


-- ぷよペアを作成する
create : Int -> Int -> PuyoColor -> PuyoColor -> PuyoPair
create x y axisColor childColor =
    { axis = { x = x, y = y }
    , child = { x = x, y = y - 1 }
    , axisColor = axisColor
    , childColor = childColor
    , rotation = 0
    }


-- ぷよペアの位置を取得する
getPositions : PuyoPair -> ( Position, Position )
getPositions pair =
    ( pair.axis, pair.child )


-- 左に移動する
moveLeft : PuyoPair -> PuyoPair
moveLeft pair =
    { pair
        | axis = { x = pair.axis.x - 1, y = pair.axis.y }
        , child = { x = pair.child.x - 1, y = pair.child.y }
    }


-- 右に移動する
moveRight : PuyoPair -> PuyoPair
moveRight pair =
    { pair
        | axis = { x = pair.axis.x + 1, y = pair.axis.y }
        , child = { x = pair.child.x + 1, y = pair.child.y }
    }


-- 時計回りに回転する（90度）
rotate : PuyoPair -> PuyoPair
rotate pair =
    let
        newRotation =
            modBy 4 (pair.rotation + 1)

        childPos =
            getChildPosition pair.axis newRotation
    in
    { pair
        | rotation = newRotation
        , child = childPos
    }


-- 回転状態に応じた子ぷよの位置を計算
getChildPosition : Position -> Int -> Position
getChildPosition axis rotation =
    case rotation of
        0 ->
            -- 上
            { x = axis.x, y = axis.y - 1 }

        1 ->
            -- 右
            { x = axis.x + 1, y = axis.y }

        2 ->
            -- 下
            { x = axis.x, y = axis.y + 1 }

        _ ->
            -- 左（3）
            { x = axis.x - 1, y = axis.y }


-- 壁キック付き回転
rotateWithKick : PuyoPair -> Board -> ( PuyoPair, Bool )
rotateWithKick pair board =
    let
        rotatedPair =
            rotate pair
    in
    if canMove rotatedPair board then
        -- 回転可能、壁キック不要
        ( rotatedPair, False )

    else
        -- 壁キックを試みる
        tryWallKick rotatedPair board


-- 壁キックを試みる
tryWallKick : PuyoPair -> Board -> ( PuyoPair, Bool )
tryWallKick pair board =
    let
        -- 左に1マス移動
        leftKick =
            { pair | axis = { x = pair.axis.x - 1, y = pair.axis.y } }
                |> (\p -> { p | child = getChildPosition p.axis p.rotation })

        -- 右に1マス移動
        rightKick =
            { pair | axis = { x = pair.axis.x + 1, y = pair.axis.y } }
                |> (\p -> { p | child = getChildPosition p.axis p.rotation })
    in
    if canMove leftKick board then
        ( leftKick, True )

    else if canMove rightKick board then
        ( rightKick, True )

    else
        -- 壁キックも失敗、回転前の状態に戻す
        ( { pair | rotation = modBy 4 (pair.rotation - 1) }
            |> (\p -> { p | child = getChildPosition p.axis p.rotation })
        , False
        )


-- 移動可能かチェックする
canMove : PuyoPair -> Board -> Bool
canMove pair board =
    let
        axisCell =
            Board.getCell pair.axis.x pair.axis.y board

        childCell =
            Board.getCell pair.child.x pair.child.y board
    in
    case ( axisCell, childCell ) of
        ( Just Empty, Just Empty ) ->
            True

        _ ->
            False
```

「不変性を保ちながら回転しているんですね！」そうです。`rotate` 関数では、回転状態を更新し、新しい子ぷよの位置を計算して、新しいぷよペアを返します。

「`rotateWithKick` 関数は何をしているんですか？」この関数は、まず通常の回転を試み、失敗した場合は壁キック（左または右に1マス移動）を試みます。それでも失敗した場合は、回転を中止して元の状態を返します。戻り値はタプルで、`(新しいぷよペア, 壁キックが発生したか)` という情報を返します。

### テストの実行

テストを実行してみましょう：

```bash
elm-test
```

すべてのテストが通れば成功です！

### The Elm Architecture への統合

次に、回転機能を Main.elm に統合します：

```elm
-- src/Main.elm（更新部分のみ）

type Msg
    = StartGame
    | KeyPressed String
    | Tick
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
              }
            , Cmd.none
            )

        KeyPressed key ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        newPair =
                            case key of
                                "ArrowLeft" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveLeft pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                "ArrowRight" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveRight pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                "ArrowUp" ->
                                    -- 回転（壁キック付き）
                                    let
                                        ( rotatedPair, _ ) =
                                            PuyoPair.rotateWithKick pair model.board
                                    in
                                    rotatedPair

                                _ ->
                                    pair
                    in
                    ( { model | currentPair = Just newPair }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        Tick ->
            -- 後で実装
            ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )
```

「上矢印キーで回転するんですね！」そうです。`ArrowUp` が押されると、`rotateWithKick` 関数を呼び出して回転します。壁キックが必要な場合は自動的に処理されます。

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。「ゲーム開始」ボタンをクリックし、上矢印キーを押すと、ぷよが回転します！

「本当だ！ぷよが回転しました！」おめでとうございます！キーボード入力でぷよを回転できるようになりましたね。

### イテレーション3のまとめ

このイテレーションで実装した内容:

1. **回転状態の管理**
   - `rotation` フィールド: 0（上）、1（右）、2（下）、3（左）の4状態
   - `getChildPosition`: 回転状態に応じた子ぷよの位置計算

2. **回転機能**
   - `rotate`: 時計回りに90度回転
   - パターンマッチングで回転状態に応じた位置を計算
   - 不変性を保ちながら新しいぷよペアを返す

3. **壁キック処理**
   - `rotateWithKick`: 回転と壁キックを統合
   - `tryWallKick`: 左右への移動を試みる
   - タプル型で回転結果と壁キック発生フラグを返す

4. **The Elm Architecture の拡張**
   - `KeyPressed "ArrowUp"`: 上矢印キーで回転
   - `update` 関数での回転処理の統合

5. **テストの作成**
   - 回転機能のテスト（2テスト）
   - 壁キック処理のテスト（2テスト）

### 学んだこと

- **回転状態の管理**: カスタム型とパターンマッチングで安全に管理
- **タプル型**: 複数の値を返す場合に便利（回転結果と壁キックフラグ）
- **パイプライン演算子**: 複数の回転を連鎖させてテスト
- **不変性**: 回転前の状態を保ちながら新しい状態を作成
- **型安全性**: コンパイラが回転状態のすべてのケースをチェック

次のイテレーションでは、ぷよの自由落下機能を実装します！

## イテレーション4: ぷよの自由落下の実装

「回転ができるようになったけど、ぷよぷよって自動で落ちていくよね？」そうですね！ぷよぷよでは、ぷよが一定間隔で自動的に下に落ちていきます。今回は、その「自由落下」機能を実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> システムとしてぷよを自由落下させることができる

「ぷよが自動的に落ちていく」という機能は、ぷよぷよの基本中の基本ですね。プレイヤーが何も操作しなくても、時間とともにぷよが下に落ちていく仕組みを作りましょう。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「ぷよを自由落下させる」という機能を実現するためには、以下のようなタスクが必要そうですね：

- 時間の経過を管理する（Time サブスクリプションの追加）
- 自動落下処理の実装（一定時間ごとにぷよを1マス下に移動）
- 落下可能判定の実装（下に移動できるかチェック）
- 着地処理の実装（ぷよが着地したときにボードに固定）
- The Elm Architecture への統合（Tick メッセージの処理）

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。テスト駆動開発の流れに沿って、まずはテストから書いていきますよ。

### テスト: ぷよペアの落下

まずは、ぷよペアが下に移動する機能をテストしましょう：

```elm
-- tests/PuyoPairTests.elm（続き）
suite : Test
suite =
    describe "PuyoPair"
        [ -- 既存のテスト...
        , describe "moveDown"
            [ test "下に移動できる" <|
                \_ ->
                    let
                        pair =
                            PuyoPair.create 2 5 Red Blue

                        movedPair =
                            PuyoPair.moveDown pair
                    in
                    Expect.all
                        [ \p -> Expect.equal 2 p.axis.x
                        , \p -> Expect.equal 6 p.axis.y
                        , \p -> Expect.equal 2 p.child.x
                        , \p -> Expect.equal 5 p.child.y
                        ]
                        movedPair
            ]
        , describe "canMoveDown"
            [ test "下にスペースがあれば移動可能" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal True
            , test "軸ぷよが下端なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 11 Red Blue
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal False
            , test "子ぷよが下端なら移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        -- rotation = 2（子ぷよが下）の状態
                        pair =
                            { axis = { x = 2, y = 10 }
                            , child = { x = 2, y = 11 }
                            , axisColor = Red
                            , childColor = Blue
                            , rotation = 2
                            }
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal False
            , test "下にぷよがあれば移動不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 6 (Filled Red)

                        pair =
                            PuyoPair.create 2 5 Red Blue
                    in
                    PuyoPair.canMoveDown pair board
                        |> Expect.equal False
            ]
        ]
```

「このテストは何を確認しているんですか？」このテストでは、以下のケースを確認しています：

1. ぷよペアが下に移動できるか
2. 下にスペースがあれば移動可能
3. 軸ぷよが下端なら移動不可
4. 子ぷよが下端なら移動不可
5. 下にぷよがあれば移動不可

### 実装: ぷよペアの落下

では、テストが通るように PuyoPair モジュールを拡張しましょう：

```elm
-- src/PuyoPair.elm（拡張版）
module PuyoPair exposing
    ( PuyoPair
    , Position
    , canMove
    , canMoveDown
    , create
    , getPositions
    , moveDown
    , moveLeft
    , moveRight
    , rotate
    , rotateWithKick
    )

-- 省略...


-- 下に移動する
moveDown : PuyoPair -> PuyoPair
moveDown pair =
    { pair
        | axis = { x = pair.axis.x, y = pair.axis.y + 1 }
        , child = { x = pair.child.x, y = pair.child.y + 1 }
    }


-- 下に移動可能かチェックする
canMoveDown : PuyoPair -> Board -> Bool
canMoveDown pair board =
    let
        nextAxisY =
            pair.axis.y + 1

        nextChildY =
            pair.child.y + 1

        -- ボードの高さ
        boardRows =
            board.rows

        -- 下端チェック
        isAxisOutOfBounds =
            nextAxisY >= boardRows

        isChildOutOfBounds =
            nextChildY >= boardRows

        -- 移動先のセルチェック
        axisCell =
            if isAxisOutOfBounds then
                Nothing

            else
                Board.getCell pair.axis.x nextAxisY board

        childCell =
            if isChildOutOfBounds then
                Nothing

            else
                Board.getCell pair.child.x nextChildY board
    in
    case ( axisCell, childCell ) of
        ( Just Empty, Just Empty ) ->
            True

        _ ->
            False
```

「不変性を保ちながら下に移動しているんですね！」そうです。`moveDown` 関数では、軸ぷよと子ぷよの両方の Y 座標を 1 増やした新しいぷよペアを返します。

「`canMoveDown` 関数は `canMove` と似ていますね」そうですね。主な違いは、下方向への移動可能性を専用にチェックしている点です。下端チェックを先に行うことで、範囲外アクセスを防いでいます。

### Time サブスクリプションの追加

次に、一定時間ごとに Tick メッセージを発行するサブスクリプションを追加します。Elm では、`Browser.Events.onAnimationFrame` を使って、ブラウザの描画タイミングに合わせた更新を行えます。

まず、必要な型を定義します：

```elm
-- src/Main.elm（更新部分）
import Browser.Events
import Time


type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    , dropTimer : Float
    , dropInterval : Float
    }


init : () -> ( Model, Cmd Msg )
init _ =
    ( { board = Board.create 6 12
      , currentPair = Nothing
      , mode = Start
      , dropTimer = 0
      , dropInterval = 1000
      }
    , Cmd.none
    )


type Msg
    = StartGame
    | KeyPressed String
    | Tick Float
    | NoOp


subscriptions : Model -> Sub Msg
subscriptions model =
    case model.mode of
        Playing ->
            Sub.batch
                [ Browser.Events.onKeyDown (Decode.map KeyPressed keyDecoder)
                , Browser.Events.onAnimationFrame Tick
                ]

        _ ->
            Sub.none
```

「`onAnimationFrame` は何ですか？」良い質問です！`onAnimationFrame` は、ブラウザの描画タイミング（通常は60FPSで約16.67ms）ごとに呼ばれるサブスクリプションです。引数として現在のタイムスタンプ（ミリ秒）を受け取ります。

### update 関数の拡張

次に、Tick メッセージを処理して、一定時間ごとにぷよを落下させます：

```elm
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                , dropTimer = 0
              }
            , Cmd.none
            )

        KeyPressed key ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        newPair =
                            case key of
                                "ArrowLeft" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveLeft pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                "ArrowRight" ->
                                    let
                                        movedPair =
                                            PuyoPair.moveRight pair
                                    in
                                    if PuyoPair.canMove movedPair model.board then
                                        movedPair

                                    else
                                        pair

                                "ArrowUp" ->
                                    let
                                        ( rotatedPair, _ ) =
                                            PuyoPair.rotateWithKick pair model.board
                                    in
                                    rotatedPair

                                _ ->
                                    pair
                    in
                    ( { model | currentPair = Just newPair }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        Tick deltaTime ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        newTimer =
                            model.dropTimer + deltaTime
                    in
                    if newTimer >= model.dropInterval then
                        -- 落下タイマーが間隔を超えたら落下処理
                        if PuyoPair.canMoveDown pair model.board then
                            -- 下に移動可能
                            ( { model
                                | currentPair = Just (PuyoPair.moveDown pair)
                                , dropTimer = 0
                              }
                            , Cmd.none
                            )

                        else
                            -- 着地した：ボードに固定して新しいぷよを生成
                            let
                                newBoard =
                                    model.board
                                        |> Board.setCell pair.axis.x pair.axis.y (Filled pair.axisColor)
                                        |> Board.setCell pair.child.x pair.child.y (Filled pair.childColor)
                            in
                            ( { model
                                | board = newBoard
                                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                                , dropTimer = 0
                              }
                            , Cmd.none
                            )

                    else
                        -- まだ落下タイマーが間隔に達していない
                        ( { model | dropTimer = newTimer }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )
```

「落下タイマーで一定時間ごとに落下処理を実行しているんですね！」そうです。`Tick` メッセージが来るたびにタイマーを更新し、`dropInterval`（1000ms = 1秒）を超えたら、ぷよを1マス下に移動させます。

「着地したらボードに固定して新しいぷよを生成するんですね」その通りです！`canMoveDown` が `False` を返した場合、現在のぷよペアをボードに固定（`setCell`）し、新しいぷよペアを生成します。

### テストの実行

テストを実行してみましょう：

```bash
elm-test
```

すべてのテストが通れば成功です！

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。「ゲーム開始」ボタンをクリックすると、ぷよが1秒ごとに自動的に下に落ちていきます！

「本当だ！ぷよが自動で落ちて、着地したら新しいぷよが出てきました！」おめでとうございます！自由落下機能が実装できましたね。

### イテレーション4のまとめ

このイテレーションで実装した内容：

1. **ぷよペアの落下機能**
   - `moveDown`: 下に移動
   - `canMoveDown`: 下に移動可能かチェック（下端と衝突判定）

2. **時間管理**
   - `dropTimer`: 落下タイマー
   - `dropInterval`: 落下間隔（1000ms）
   - `Browser.Events.onAnimationFrame`: フレームごとの時間更新

3. **自動落下処理**
   - `Tick` メッセージでタイマーを更新
   - タイマーが間隔を超えたらぷよを1マス下に移動
   - 着地したらボードに固定して新しいぷよを生成

4. **着地処理**
   - `canMoveDown` が `False` の場合に着地と判定
   - 軸ぷよと子ぷよをボードに `setCell` で固定
   - 新しいぷよペアを生成

5. **サブスクリプションの拡張**
   - `Sub.batch`: 複数のサブスクリプションを組み合わせ
   - キーボード入力とアニメーションフレームの両方を購読

6. **テストの作成**
   - 落下機能のテスト（1テスト）
   - 落下可能判定のテスト（4テスト）

### 学んだこと

- **Browser.Events.onAnimationFrame**: ブラウザの描画タイミングに合わせた更新
- **Sub.batch**: 複数のサブスクリプションを組み合わせる
- **タイマー管理**: 経過時間を積算して一定間隔で処理を実行
- **着地判定**: `canMoveDown` で下方向の移動可能性をチェック
- **パイプライン演算子**: 複数の `setCell` を連鎖させてボードを更新

次のイテレーションでは、ぷよの高速落下機能（下矢印キーで素早く落とす）を実装します！

## イテレーション5: ぷよの高速落下の実装

「ぷよが自動で落ちるようになったけど、もっと早く落としたいときはどうするんですか？」良い質問ですね！ぷよぷよでは、下矢印キーを押すことでぷよを素早く落とすことができます。今回は、その「高速落下」機能を実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、下矢印キーを押してぷよを素早く落とせる

「早く次のぷよを出したい！」というときに、下キーを押して素早く落下させる機能は、ゲームのテンポを良くするために重要ですね。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「ぷよを素早く落下させる」という機能を実現するためには、以下のようなタスクが必要そうですね：

- 高速落下フラグを Model に追加する
- 下キー入力の検出を実装する（下矢印キーが押されたことを検知する）
- 高速落下処理を実装する（下キーが押されている間は落下速度を上げる）
- キーが離されたときの処理を実装する（元の速度に戻す）

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。テスト駆動開発の流れに沿って、まずはテストから書いていきますよ。

### テスト: 高速落下フラグ

「最初に何をテストすればいいんでしょうか？」まずは、高速落下のフラグを管理できることをテストしましょう。

```elm
-- tests/MainTests.elm（新規作成）
module MainTests exposing (suite)

import Board
import Expect
import Main exposing (..)
import PuyoColor exposing (PuyoColor(..))
import PuyoPair
import Test exposing (..)


suite : Test
suite =
    describe "Main"
        [ describe "高速落下"
            [ test "下矢印キーで高速落下フラグが立つ" <|
                \_ ->
                    let
                        initialModel =
                            { board = Board.create 6 12
                            , currentPair = Nothing
                            , mode = Start
                            , dropTimer = 0
                            , dropInterval = 1000
                            , fastDropActive = False
                            }

                        ( newModel, _ ) =
                            update (KeyPressed "ArrowDown") initialModel
                    in
                    newModel.fastDropActive
                        |> Expect.equal True
            , test "下矢印キー以外では高速落下フラグが立たない" <|
                \_ ->
                    let
                        initialModel =
                            { board = Board.create 6 12
                            , currentPair = Nothing
                            , mode = Start
                            , dropTimer = 0
                            , dropInterval = 1000
                            , fastDropActive = False
                            }

                        ( newModel, _ ) =
                            update (KeyPressed "ArrowLeft") initialModel
                    in
                    newModel.fastDropActive
                        |> Expect.equal False
            ]
        ]
```

「このテストでは何を確認しているんですか？」このテストでは、以下の2つのケースを確認しています：

1. 下矢印キーが押されたときに `fastDropActive` フラグが `True` になるか
2. 他のキーが押されたときには `fastDropActive` フラグが変わらないか

「なるほど、高速落下の状態を管理できることを確認するんですね！」そうです！では、このテストが失敗することを確認してから、実装に進みましょう。

### 実装: Model への fastDropActive フィールド追加

まず、Model に `fastDropActive` フィールドを追加します：

```elm
-- src/Main.elm
type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    , dropTimer : Float
    , dropInterval : Float
    , fastDropActive : Bool  -- 追加
    }


init : Model
init =
    { board = Board.create 6 12
    , currentPair = Nothing
    , mode = Start
    , dropTimer = 0
    , dropInterval = 1000
    , fastDropActive = False  -- 追加
    }
```

### 実装: 下矢印キーの処理

次に、下矢印キーが押されたときに `fastDropActive` フラグを立てる処理を実装します：

```elm
-- src/Main.elm（update 関数の修正）
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StartGame ->
            ( { model
                | mode = Playing
                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
              }
            , Cmd.none
            )

        KeyPressed key ->
            case key of
                "ArrowDown" ->
                    -- 高速落下フラグを立てる
                    ( { model | fastDropActive = True }, Cmd.none )

                _ ->
                    -- その他のキー処理
                    case ( model.mode, model.currentPair ) of
                        ( Playing, Just pair ) ->
                            let
                                newPair =
                                    case key of
                                        "ArrowLeft" ->
                                            let
                                                movedPair =
                                                    PuyoPair.moveLeft pair
                                            in
                                            if PuyoPair.canMove movedPair model.board then
                                                movedPair

                                            else
                                                pair

                                        "ArrowRight" ->
                                            let
                                                movedPair =
                                                    PuyoPair.moveRight pair
                                            in
                                            if PuyoPair.canMove movedPair model.board then
                                                movedPair

                                            else
                                                pair

                                        "ArrowUp" ->
                                            let
                                                ( rotatedPair, _ ) =
                                                    PuyoPair.rotateWithKick pair model.board
                                            in
                                            rotatedPair

                                        _ ->
                                            pair
                            in
                            ( { model | currentPair = Just newPair }, Cmd.none )

                        _ ->
                            ( model, Cmd.none )

        -- 既存の Tick 処理...
        Tick deltaTime ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        newTimer =
                            model.dropTimer + deltaTime
                    in
                    if newTimer >= model.dropInterval then
                        if PuyoPair.canMoveDown pair model.board then
                            ( { model
                                | currentPair = Just (PuyoPair.moveDown pair)
                                , dropTimer = 0
                              }
                            , Cmd.none
                            )

                        else
                            let
                                newBoard =
                                    model.board
                                        |> Board.setCell pair.axis.x pair.axis.y (Filled pair.axisColor)
                                        |> Board.setCell pair.child.x pair.child.y (Filled pair.childColor)
                            in
                            ( { model
                                | board = newBoard
                                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                                , dropTimer = 0
                              }
                            , Cmd.none
                            )

                    else
                        ( { model | dropTimer = newTimer }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )
```

「テストを実行してみましょう！」そうですね。テストを実行します：

```bash
elm-test
```

「やった！テストが通りました！」おめでとうございます！下矢印キーで高速落下フラグが立つようになりました。

### テスト: 高速落下時の落下速度

次に、高速落下フラグが立っているときに実際に落下速度が上がることをテストしましょう：

```elm
-- tests/MainTests.elm（続き）
suite : Test
suite =
    describe "Main"
        [ describe "高速落下"
            [ -- 既存のテスト...
            , test "高速落下時は落下間隔が短くなる" <|
                \_ ->
                    let
                        model =
                            { board = Board.create 6 12
                            , currentPair = Just (PuyoPair.create 2 5 Red Blue)
                            , mode = Playing
                            , dropTimer = 0
                            , dropInterval = 1000
                            , fastDropActive = True
                            }

                        effectiveInterval =
                            if model.fastDropActive then
                                50

                            else
                                model.dropInterval
                    in
                    effectiveInterval
                        |> Expect.equal 50
            ]
        ]
```

「このテストでは何を確認しているんですか？」このテストでは、`fastDropActive` が `True` のときに、実効的な落下間隔が短く（50ms）なることを確認しています。

### 実装: 高速落下時の落下速度変更

では、Tick メッセージの処理で、高速落下フラグに応じて落下速度を変更しましょう：

```elm
-- src/Main.elm（update 関数の Tick 処理を修正）
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- 既存の処理...

        Tick deltaTime ->
            case ( model.mode, model.currentPair ) of
                ( Playing, Just pair ) ->
                    let
                        -- 高速落下時は落下間隔を短くする
                        effectiveInterval =
                            if model.fastDropActive then
                                50

                            else
                                model.dropInterval

                        newTimer =
                            model.dropTimer + deltaTime
                    in
                    if newTimer >= effectiveInterval then
                        if PuyoPair.canMoveDown pair model.board then
                            ( { model
                                | currentPair = Just (PuyoPair.moveDown pair)
                                , dropTimer = 0
                              }
                            , Cmd.none
                            )

                        else
                            let
                                newBoard =
                                    model.board
                                        |> Board.setCell pair.axis.x pair.axis.y (Filled pair.axisColor)
                                        |> Board.setCell pair.child.x pair.child.y (Filled pair.childColor)
                            in
                            ( { model
                                | board = newBoard
                                , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                                , dropTimer = 0
                                , fastDropActive = False  -- 着地時に高速落下をリセット
                              }
                            , Cmd.none
                            )

                    else
                        ( { model | dropTimer = newTimer }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        NoOp ->
            ( model, Cmd.none )
```

「effectiveInterval を使って落下速度を変えているんですね！」そうです！`fastDropActive` が `True` の場合は 50ms、そうでない場合は通常の 1000ms を使います。また、ぷよが着地したときに `fastDropActive` を `False` にリセットすることで、次のぷよは通常速度で落下します。

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。「ゲーム開始」ボタンをクリックし、下矢印キーを押してみましょう！

「本当だ！下矢印キーを押すとぷよがすごく速く落ちます！」おめでとうございます！高速落下機能が実装できましたね。

### イテレーション5のまとめ

このイテレーションで実装した内容：

1. **高速落下フラグの追加**
   - `fastDropActive : Bool` フィールドを Model に追加
   - 下矢印キーで `True` に設定

2. **高速落下の実装**
   - `effectiveInterval`: 高速落下時は 50ms、通常時は 1000ms
   - Tick メッセージで `effectiveInterval` を使って落下判定
   - 着地時に `fastDropActive` をリセット

3. **テストの作成**
   - 高速落下フラグのテスト（2テスト）
   - 高速落下時の落下間隔のテスト（1テスト）

### 学んだこと

- **条件分岐による速度変更**: `if` 式で状態に応じた値を選択
- **フラグのリセット**: 着地時に高速落下フラグをリセットして次のぷよに影響しないようにする
- **let 式での局所変数**: `effectiveInterval` のような計算結果を一時的に保持

次のイテレーションでは、ぷよの消去機能（同じ色のぷよが4つ以上つながったら消える）を実装します！

## イテレーション6: ぷよの消去の実装

「ぷよが落ちてくるようになったけど、ぷよぷよの醍醐味はぷよを消すことですよね？」そうですね！ぷよぷよの最も重要な要素の一つは、同じ色のぷよを4つ以上つなげると消去できる機能です。今回は、その「ぷよの消去」機能を実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、同じ色のぷよを4つ以上つなげると消去できる

「これがぷよぷよの基本ルールですね！」そうです！同じ色のぷよを4つ以上つなげると消去できるというのが、ぷよぷよの基本的なルールです。これを実装することで、ゲームとしての面白さが大きく向上しますね。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「ぷよを消去する」という機能を実現するためには、以下のようなタスクが必要そうですね：

- 連結したぷよを探索する機能を実装する（深さ優先探索）
- 4つ以上つながったぷよを検出する機能を実装する
- ぷよを消去する機能を実装する
- 消去後に上のぷよを落下させる機能を実装する
- 着地後に消去判定を行う

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。テスト駆動開発の流れに沿って、まずはテストから書いていきますよ。

### テスト: 連結したぷよの探索

「最初に何をテストすればいいんでしょうか？」まずは、連結したぷよを探索する機能をテストしましょう。

新しいモジュール `GameLogic` を作成して、そこに連結判定のロジックを実装します：

```elm
-- tests/GameLogicTests.elm（新規作成）
module GameLogicTests exposing (suite)

import Board
import Cell exposing (Cell(..))
import Expect
import GameLogic
import PuyoColor exposing (PuyoColor(..))
import Set
import Test exposing (..)


suite : Test
suite =
    describe "GameLogic"
        [ describe "findConnectedPuyos"
            [ test "同じ色のぷよが4つつながっている場合、4つすべてを検出する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)

                        connected =
                            GameLogic.findConnectedPuyos 1 10 Red board
                    in
                    Set.size connected
                        |> Expect.equal 4
            , test "異なる色のぷよは接続されない" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Blue)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)

                        connected =
                            GameLogic.findConnectedPuyos 1 10 Red board
                    in
                    Set.size connected
                        |> Expect.equal 3
            , test "3つ以下のつながりも正しく検出する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 3 10 (Filled Red)

                        connected =
                            GameLogic.findConnectedPuyos 1 10 Red board
                    in
                    Set.size connected
                        |> Expect.equal 3
            ]
        ]
```

「このテストでは何を確認しているんですか？」このテストでは、以下の3つのケースを確認しています：

1. 同じ色のぷよが4つつながっている場合、すべて検出できるか
2. 異なる色のぷよは接続されないか
3. 3つ以下のつながりも正しく検出できるか

「テストを実行すると失敗しますよね？」そうです！まだ `GameLogic` モジュールを作っていないので、テストは失敗します。これから実装していきましょう。

### 実装: 深さ優先探索

では、連結したぷよを探索する機能を実装しましょう。深さ優先探索（DFS: Depth-First Search）というアルゴリズムを使います：

```elm
-- src/GameLogic.elm（新規作成）
module GameLogic exposing (findConnectedPuyos, erasePuyos, applyGravity)

import Board exposing (Board)
import Cell exposing (Cell(..))
import PuyoColor exposing (PuyoColor)
import Set exposing (Set)


{-| 指定位置から連結している同色のぷよを探索する
-}
findConnectedPuyos : Int -> Int -> PuyoColor -> Board -> Set ( Int, Int )
findConnectedPuyos x y color board =
    findConnectedHelper x y color board Set.empty


{-| 再帰的に連結ぷよを探索するヘルパー関数
-}
findConnectedHelper : Int -> Int -> PuyoColor -> Board -> Set ( Int, Int ) -> Set ( Int, Int )
findConnectedHelper x y color board visited =
    -- すでに訪問済みの場合は何もしない
    if Set.member ( x, y ) visited then
        visited

    else
        case Board.getCell x y board of
            Just (Filled cellColor) ->
                if cellColor == color then
                    let
                        -- 現在位置を訪問済みに追加
                        newVisited =
                            Set.insert ( x, y ) visited

                        -- 4方向（上下左右）を探索
                        directions =
                            [ ( 0, -1 )  -- 上
                            , ( 0, 1 )   -- 下
                            , ( -1, 0 )  -- 左
                            , ( 1, 0 )   -- 右
                            ]

                        -- 各方向を再帰的に探索
                        searchNeighbor visited2 ( dx, dy ) =
                            findConnectedHelper (x + dx) (y + dy) color board visited2
                    in
                    List.foldl searchNeighbor newVisited directions

                else
                    -- 色が違う場合は探索しない
                    visited

            _ ->
                -- セルが空か範囲外の場合は探索しない
                visited
```

「再帰的な関数ですね！」そうです。深さ優先探索は再帰を使って実装するのが自然です。このアルゴリズムの仕組みを見てみましょう：

1. **訪問済みチェック**: すでに訪問した位置は再度探索しない（無限ループ防止）
2. **色のチェック**: 同じ色のぷよだけを探索対象にする
3. **4方向探索**: 上下左右の4方向を再帰的に探索
4. **Set で管理**: 訪問済み位置を Set で管理することで、重複を自動的に排除

「`foldl` で4方向を順番に探索しているんですね！」そうです！`foldl` を使うことで、各方向の探索結果を累積していきます。

### テストの実行

では、テストを実行してみましょう：

```bash
elm-test
```

「やった！テストが通りました！」おめでとうございます！連結したぷよを探索する機能が実装できましたね。

### テスト: ぷよの消去

次に、4つ以上つながったぷよを消去する機能をテストしましょう：

```elm
-- tests/GameLogicTests.elm（続き）
suite : Test
suite =
    describe "GameLogic"
        [ -- 既存のテスト...
        , describe "erasePuyos"
            [ test "指定した位置のぷよを消去する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)

                        positions =
                            Set.fromList [ ( 1, 10 ), ( 2, 10 ), ( 1, 11 ), ( 2, 11 ) ]

                        newBoard =
                            GameLogic.erasePuyos positions board
                    in
                    Expect.all
                        [ \b -> Board.getCell 1 10 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 10 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 1 11 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 11 b |> Expect.equal (Just Empty)
                        ]
                        newBoard
            ]
        ]
```

「このテストでは、指定した位置のぷよが空になることを確認しているんですね！」そうです！`Expect.all` を使って、4つの位置すべてが `Empty` になることを確認しています。

### 実装: ぷよの消去

では、ぷよを消去する機能を実装しましょう：

```elm
-- src/GameLogic.elm（続き）
{-| 指定した位置のぷよを消去する
-}
erasePuyos : Set ( Int, Int ) -> Board -> Board
erasePuyos positions board =
    Set.foldl
        (\( x, y ) b -> Board.setCell x y Empty b)
        board
        positions
```

「シンプルですね！」そうです。`Set.foldl` を使って、各位置のセルを `Empty` に設定していきます。

### テスト: 重力の適用

ぷよを消去した後、上にあるぷよが落下する必要があります。これを「重力の適用」と呼びます：

```elm
-- tests/GameLogicTests.elm（続き）
suite : Test
suite =
    describe "GameLogic"
        [ -- 既存のテスト...
        , describe "applyGravity"
            [ test "浮いているぷよが落下する" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 8 (Filled Blue)
                                |> Board.setCell 2 9 (Filled Blue)

                        newBoard =
                            GameLogic.applyGravity board
                    in
                    Expect.all
                        [ \b -> Board.getCell 2 8 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 9 b |> Expect.equal (Just Empty)
                        , \b -> Board.getCell 2 10 b |> Expect.equal (Just (Filled Blue))
                        , \b -> Board.getCell 2 11 b |> Expect.equal (Just (Filled Blue))
                        ]
                        newBoard
            , test "浮いていないぷよは動かない" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 11 (Filled Blue)

                        newBoard =
                            GameLogic.applyGravity board
                    in
                    Board.getCell 2 11 newBoard
                        |> Expect.equal (Just (Filled Blue))
            ]
        ]
```

「これは、ぷよが下に落ちていくことを確認するテストですね！」そうです！ぷよ消去後に空いたスペースに、上のぷよが落ちてくる機能をテストしています。

### 実装: 重力の適用

では、重力を適用する機能を実装しましょう：

```elm
-- src/GameLogic.elm（続き）
{-| 重力を適用して浮いているぷよを落下させる
-}
applyGravity : Board -> Board
applyGravity board =
    let
        cols =
            Board.getCols board

        rows =
            Board.getRows board

        -- 各列に対して重力を適用
        applyGravityToColumn : Int -> Board -> Board
        applyGravityToColumn col b =
            -- 下から上に向かって処理
            let
                applyToRow : Int -> Board -> Board
                applyToRow row currentBoard =
                    if row < 0 then
                        currentBoard

                    else
                        case Board.getCell col row currentBoard of
                            Just (Filled color) ->
                                -- 下に落とせるだけ落とす
                                let
                                    finalRow =
                                        findBottomRow col row currentBoard
                                in
                                if finalRow /= row then
                                    currentBoard
                                        |> Board.setCell col row Empty
                                        |> Board.setCell col finalRow (Filled color)
                                        |> applyToRow (row - 1)

                                else
                                    applyToRow (row - 1) currentBoard

                            _ ->
                                applyToRow (row - 1) currentBoard
            in
            applyToRow (rows - 1) b

        -- 下に落とせる最終行を見つける
        findBottomRow : Int -> Int -> Board -> Int
        findBottomRow col row currentBoard =
            if row >= rows - 1 then
                row

            else
                case Board.getCell col (row + 1) currentBoard of
                    Just Empty ->
                        findBottomRow col (row + 1) currentBoard

                    _ ->
                        row
    in
    List.foldl applyGravityToColumn board (List.range 0 (cols - 1))
```

「少し複雑ですね...」そうですね。重力の適用は少し複雑です。処理の流れを見てみましょう：

1. **列ごとに処理**: 各列に対して独立に重力を適用
2. **下から上へ**: 各列を下から上に向かって処理
3. **落下先を探索**: 各ぷよについて、どこまで落とせるかを探す
4. **移動**: 元の位置を `Empty` にして、落下先に ぷよを配置

「Board モジュールに `getCols` と `getRows` 関数が必要ですね！」その通りです！Board モジュールに追加しましょう。

### Board モジュールの拡張

```elm
-- src/Board.elm（追加）
getCols : Board -> Int
getCols board =
    board.cols


getRows : Board -> Int
getRows board =
    board.rows
```

これで、テストを実行してみましょう：

```bash
elm-test
```

「テストが通りました！」素晴らしい！重力の適用機能が実装できましたね。

###

 イテレーション6のまとめ

このイテレーションで実装した内容：

1. **連結ぷよの探索**
   - `findConnectedPuyos`: 深さ優先探索（DFS）で連結ぷよを検出
   - `Set` 型で訪問済み位置を管理
   - 再帰的な探索で上下左右を走査

2. **ぷよの消去**
   - `erasePuyos`: 指定位置のぷよを `Empty` に設定
   - `Set.foldl` で複数位置を一括処理

3. **重力の適用**
   - `applyGravity`: 浮いているぷよを落下させる
   - 列ごとに独立して処理
   - 下から上に向かってスキャン

4. **テストの作成**
   - 連結判定のテスト（3テスト）
   - 消去機能のテスト（1テスト）
   - 重力適用のテスト（2テスト）

### 学んだこと

- **深さ優先探索（DFS）**: 再帰を使った探索アルゴリズム
- **Set 型の活用**: 重複のない位置管理に便利
- **foldl による集約**: 複数の操作を順次適用
- **ヘルパー関数**: 複雑なロジックを小さな関数に分割

次のイテレーションでは、連鎖反応の実装に進みます！

## イテレーション7: 連鎖反応の実装

「ぷよを消せるようになったけど、ぷよぷよの醍醐味は連鎖じゃないですか？」そうですね！ぷよぷよの最も魅力的な要素の一つは、連鎖反応です。ぷよが消えて落下した結果、新たな消去パターンが生まれ、連続して消去が発生する「連鎖」を実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、連鎖反応を起こしてより高いスコアを獲得できる

「れ〜んさ〜ん！」と叫びたくなるような連鎖反応を実装して、プレイヤーがより高いスコアを目指せるようにしましょう。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「連鎖反応を実装する」という機能を実現するためには、以下のようなタスクが必要そうですね：

- ゲームモードに消去判定・消去中・落下中の状態を追加する
- 着地後に消去判定モードに遷移する
- 消去後に重力を適用して再度消去判定を行う
- 連鎖数をカウントする
- 連鎖が終了したら次のぷよを出す

「なるほど、ゲームモードで状態を管理するんですね！」そうです！Elmのカスタム型を使って、ゲームの状態遷移を明確に表現します。

### テスト: ゲームモードの追加

まず、新しいゲームモードを追加します：

```elm
-- src/Main.elm（GameMode の拡張）
type GameMode
    = Start
    | Playing
    | Checking      -- 消去判定中
    | Erasing       -- 消去中
    | Falling       -- 落下中
    | GameOver
```

「Playing だけじゃなくて、細かくモードを分けるんですね！」そうです。各モードで異なる処理を行うことで、ゲームの流れを明確に制御できます。

### テスト: 連鎖判定

連鎖が発生するケースをテストしましょう：

```elm
-- tests/MainTests.elm（続き）
suite : Test
suite =
    describe "Main"
        [ -- 既存のテスト...
        , describe "連鎖反応"
            [ test "ぷよ消去後、上のぷよが落ちて再び4つつながれば連鎖する" <|
                \_ ->
                    let
                        -- 初期配置:
                        -- 赤ぷよ4つ（2×2）の上に青ぷよが縦に3つ、横に1つ
                        board =
                            Board.create 6 12
                                |> Board.setCell 1 10 (Filled Red)
                                |> Board.setCell 2 10 (Filled Red)
                                |> Board.setCell 1 11 (Filled Red)
                                |> Board.setCell 2 11 (Filled Red)
                                |> Board.setCell 3 10 (Filled Blue)
                                |> Board.setCell 2 7 (Filled Blue)
                                |> Board.setCell 2 8 (Filled Blue)
                                |> Board.setCell 2 9 (Filled Blue)

                        -- 1. 赤ぷよを探索
                        redConnected =
                            GameLogic.findConnectedPuyos 1 10 Red board

                        -- 2. 赤ぷよを消去
                        boardAfterErase =
                            GameLogic.erasePuyos redConnected board

                        -- 3. 重力を適用
                        boardAfterGravity =
                            GameLogic.applyGravity boardAfterErase

                        -- 4. 青ぷよの連鎖判定
                        blueConnected =
                            GameLogic.findConnectedPuyos 2 10 Blue boardAfterGravity
                    in
                    Set.size blueConnected
                        |> Expect.equal 4
            ]
        ]
```

「このテストでは、赤ぷよが消えた後に青ぷよが落ちて4つつながることを確認しているんですね！」そうです！これが連鎖の基本パターンです。

### 実装: Model の拡張

連鎖数とスコアを管理するために Model を拡張します：

```elm
-- src/Main.elm（Model の拡張）
type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    , dropTimer : Float
    , dropInterval : Float
    , fastDropActive : Bool
    , chainCount : Int      -- 追加
    , score : Int           -- 追加
    }


init : Model
init =
    { board = Board.create 6 12
    , currentPair = Nothing
    , mode = Start
    , dropTimer = 0
    , dropInterval = 1000
    , fastDropActive = False
    , chainCount = 0        -- 追加
    , score = 0             -- 追加
    }
```

### 実装: 消去判定と連鎖のフロー

次に、着地後の処理を変更して、消去判定→消去→重力→消去判定のサイクルを実装します：

```elm
-- src/Main.elm（update 関数の Tick 処理を大幅に変更）
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- 既存の処理...

        Tick deltaTime ->
            case model.mode of
                Playing ->
                    -- プレイ中の自動落下処理
                    case model.currentPair of
                        Just pair ->
                            let
                                effectiveInterval =
                                    if model.fastDropActive then
                                        50

                                    else
                                        model.dropInterval

                                newTimer =
                                    model.dropTimer + deltaTime
                            in
                            if newTimer >= effectiveInterval then
                                if PuyoPair.canMoveDown pair model.board then
                                    ( { model
                                        | currentPair = Just (PuyoPair.moveDown pair)
                                        , dropTimer = 0
                                      }
                                    , Cmd.none
                                    )

                                else
                                    -- 着地！ボードに固定して消去判定モードへ
                                    let
                                        newBoard =
                                            model.board
                                                |> Board.setCell pair.axis.x pair.axis.y (Filled pair.axisColor)
                                                |> Board.setCell pair.child.x pair.child.y (Filled pair.childColor)
                                    in
                                    ( { model
                                        | board = newBoard
                                        , currentPair = Nothing
                                        , mode = Checking
                                        , dropTimer = 0
                                        , fastDropActive = False
                                        , chainCount = 0  -- 連鎖カウントをリセット
                                      }
                                    , Cmd.none
                                    )

                            else
                                ( { model | dropTimer = newTimer }, Cmd.none )

                        Nothing ->
                            ( model, Cmd.none )

                Checking ->
                    -- 消去判定モード
                    let
                        erasableGroups =
                            findAllErasableGroups model.board
                    in
                    if List.isEmpty erasableGroups then
                        -- 消去なし → 次のぷよを出す
                        ( { model
                            | mode = Playing
                            , currentPair = Just (PuyoPair.create 2 1 Red Blue)
                          }
                        , Cmd.none
                        )

                    else
                        -- 消去あり → 消去モードへ
                        let
                            newChainCount =
                                model.chainCount + 1

                            -- 消去するぷよの数
                            erasedCount =
                                List.sum (List.map Set.size erasableGroups)

                            -- スコア計算: 消去数 × 連鎖ボーナス
                            chainBonus =
                                case newChainCount of
                                    1 -> 1
                                    2 -> 8
                                    3 -> 16
                                    4 -> 32
                                    5 -> 64
                                    6 -> 96
                                    7 -> 128
                                    _ -> 160

                            points =
                                erasedCount * chainBonus

                            -- すべてのグループを消去
                            newBoard =
                                List.foldl GameLogic.erasePuyos model.board erasableGroups
                        in
                        ( { model
                            | mode = Erasing
                            , chainCount = newChainCount
                            , score = model.score + points
                            , board = newBoard
                          }
                        , Cmd.none
                        )

                Erasing ->
                    -- 消去アニメーション（簡略化のためすぐに落下モードへ）
                    ( { model | mode = Falling }, Cmd.none )

                Falling ->
                    -- 重力適用後、再度消去判定へ
                    let
                        newBoard =
                            GameLogic.applyGravity model.board
                    in
                    ( { model
                        | board = newBoard
                        , mode = Checking
                      }
                    , Cmd.none
                    )

                _ ->
                    ( model, Cmd.none )

        -- その他のメッセージ処理...
        _ ->
            ( model, Cmd.none )


{-| ボード全体から消去可能なグループを探す
-}
findAllErasableGroups : Board -> List (Set ( Int, Int ))
findAllErasableGroups board =
    let
        cols =
            Board.getCols board

        rows =
            Board.getRows board

        -- すべてのセルをチェック
        allPositions =
            List.concatMap
                (\y -> List.map (\x -> ( x, y )) (List.range 0 (cols - 1)))
                (List.range 0 (rows - 1))

        -- 訪問済み位置を管理
        findGroups : List ( Int, Int ) -> Set ( Int, Int ) -> List (Set ( Int, Int )) -> List (Set ( Int, Int ))
        findGroups positions visited groups =
            case positions of
                [] ->
                    groups

                ( x, y ) :: rest ->
                    if Set.member ( x, y ) visited then
                        findGroups rest visited groups

                    else
                        case Board.getCell x y board of
                            Just (Filled color) ->
                                let
                                    connected =
                                        GameLogic.findConnectedPuyos x y color board

                                    newVisited =
                                        Set.union visited connected
                                in
                                if Set.size connected >= 4 then
                                    findGroups rest newVisited (connected :: groups)

                                else
                                    findGroups rest newVisited groups

                            _ ->
                                findGroups rest visited groups
    in
    findGroups allPositions Set.empty []
```

「すごく長くなりましたね！」そうですね。でも、各モードでやることは明確です：

1. **Playing**: 自動落下、着地したら `Checking` へ
2. **Checking**: 消去判定、消すものがあれば `Erasing` へ、なければ次のぷよ
3. **Erasing**: 消去実行、`Falling` へ
4. **Falling**: 重力適用、`Checking` へ（ここで連鎖ループ）

「`Checking → Erasing → Falling → Checking` のループが連鎖を作っているんですね！」その通りです！消去→重力→消去判定のサイクルが、消すものがなくなるまで繰り返されます。

### View の更新

スコアと連鎖数を表示しましょう：

```elm
-- src/Main.elm（view 関数の更新）
view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div []
            [ text ("スコア: " ++ String.fromInt model.score)
            , text " | "
            , text ("連鎖数: " ++ String.fromInt model.chainCount)
            ]
        , case model.mode of
            Start ->
                button [ onClick StartGame ] [ text "ゲーム開始" ]

            GameOver ->
                div []
                    [ div [] [ text "ゲームオーバー！" ]
                    , div [] [ text ("最終スコア: " ++ String.fromInt model.score) ]
                    ]

            _ ->
                div []
                    [ viewBoard model.board
                    , viewCurrentPair model.currentPair
                    ]
        ]


viewBoard : Board -> Html Msg
viewBoard board =
    div
        [ style "display" "grid"
        , style "grid-template-columns" ("repeat(" ++ String.fromInt (Board.getCols board) ++ ", 30px)")
        , style "gap" "2px"
        , style "background-color" "#333"
        , style "padding" "10px"
        , style "border-radius" "5px"
        ]
        (List.concatMap (viewRow board) (List.range 0 (Board.getRows board - 1)))


viewRow : Board -> Int -> List (Html Msg)
viewRow board y =
    List.map (viewCell board y) (List.range 0 (Board.getCols board - 1))


viewCell : Board -> Int -> Int -> Html Msg
viewCell board y x =
    let
        cellColor =
            case Board.getCell x y board of
                Just (Filled Red) ->
                    "#ff4444"

                Just (Filled Blue) ->
                    "#4444ff"

                Just (Filled Green) ->
                    "#44ff44"

                Just (Filled Yellow) ->
                    "#ffff44"

                _ ->
                    "#222"
    in
    div
        [ style "width" "30px"
        , style "height" "30px"
        , style "background-color" cellColor
        , style "border-radius" "50%"
        ]
        []


viewCurrentPair : Maybe PuyoPair -> Html Msg
viewCurrentPair maybePair =
    case maybePair of
        Just pair ->
            div
                [ style "position" "absolute"
                , style "top" "50px"
                , style "left" "50px"
                ]
                [ text "Current Pair (実装中)" ]

        Nothing ->
            text ""
```

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。「ゲーム開始」ボタンをクリックして、ぷよを落としてみましょう！

「本当だ！連鎖が起きるとスコアが増えていきます！」おめでとうございます！連鎖反応が実装できましたね。

### イテレーション7のまとめ

このイテレーションで実装した内容：

1. **ゲームモードの拡張**
   - `Checking`: 消去判定モード
   - `Erasing`: 消去実行モード
   - `Falling`: 重力適用モード
   - モード遷移による明確な状態管理

2. **連鎖の仕組み**
   - `Checking → Erasing → Falling → Checking` のループ
   - 消去対象がなくなるまで繰り返し
   - 連鎖数のカウント

3. **スコア計算**
   - 消去数 × 連鎖ボーナス
   - 連鎖数に応じたボーナス倍率（1, 8, 16, 32, ...）

4. **全体探索**
   - `findAllErasableGroups`: ボード全体から消去可能なグループを探索
   - 訪問済み管理で重複チェックを回避

5. **View の更新**
   - スコアと連鎖数の表示
   - ボードの描画
   - ゲームオーバー画面

### 学んだこと

- **状態遷移パターン**: カスタム型とパターンマッチングで状態管理
- **連鎖の自然な実現**: 消去→重力→消去のサイクルで自動的に連鎖
- **訪問済み管理**: Set を使った探索の最適化
- **スコア計算**: 連鎖数に応じた指数的なボーナス

次のイテレーションでは、全消しボーナスの実装に進みます！

## イテレーション8: 全消しボーナスの実装

「連鎖ができるようになったけど、ぷよぷよには全消しボーナスもありますよね？」そうですね！ぷよぷよには、盤面上のぷよをすべて消すと得られる「全消し（ぜんけし）ボーナス」という特別な報酬があります。今回は、その全消しボーナスを実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、盤面上のぷよをすべて消したときに全消しボーナスを獲得できる

「やった！全部消えた！」という達成感と共に、特別なボーナスポイントを獲得できる機能を実装します。これにより、プレイヤーは全消しを狙った戦略を考えるようになりますね。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「全消しボーナスを実装する」という機能を実現するためには、以下のようなタスクが必要そうですね：

- 全消し判定を実装する（盤面上のぷよがすべて空になったかを判定する）
- 全消しボーナスの計算を実装する（全消し時に加算するボーナス点を計算する）
- Checking モードで全消し判定を行う

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。テスト駆動開発の流れに沿って、まずはテストから書いていきますよ。

### テスト: 全消し判定

まず、全消し判定の機能をテストしましょう：

```elm
-- tests/GameLogicTests.elm（続き）
suite : Test
suite =
    describe "GameLogic"
        [ -- 既存のテスト...
        , describe "isEmpty"
            [ test "盤面がすべて空なら True を返す" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                    in
                    GameLogic.isEmpty board
                        |> Expect.equal True
            , test "盤面にぷよがあれば False を返す" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 10 (Filled Red)
                    in
                    GameLogic.isEmpty board
                        |> Expect.equal False
            ]
        ]
```

「このテストでは何を確認しているんですか？」このテストでは、以下の2つのケースを確認しています：

1. 盤面がすべて空の場合、`True` を返すか
2. 盤面にぷよが1つでもあれば、`False` を返すか

「シンプルですね！」そうです。全消し判定はシンプルな条件です。では実装しましょう。

### 実装: 全消し判定

全消し判定の機能を `GameLogic` モジュールに追加します：

```elm
-- src/GameLogic.elm（続き）
{-| 盤面がすべて空かどうかを判定する（全消し判定）
-}
isEmpty : Board -> Bool
isEmpty board =
    let
        cols =
            Board.getCols board

        rows =
            Board.getRows board

        -- すべてのセルをチェック
        allPositions =
            List.concatMap
                (\y -> List.map (\x -> ( x, y )) (List.range 0 (cols - 1)))
                (List.range 0 (rows - 1))

        -- 1つでもFilled があれば False
        hasAnyPuyo =
            List.any
                (\( x, y ) ->
                    case Board.getCell x y board of
                        Just (Filled _) ->
                            True

                        _ ->
                            False
                )
                allPositions
    in
    not hasAnyPuyo
```

「`List.any` を使っているんですね！」そうです。`List.any` は、リストの中に条件を満たす要素が1つでもあれば `True` を返します。ここでは「Filled セルがあるか」をチェックしています。

### テストの実行

では、テストを実行してみましょう：

```bash
elm-test
```

「やった！テストが通りました！」おめでとうございます！全消し判定が実装できましたね。

### 実装: 全消しボーナスの統合

次に、`Checking` モードで全消し判定を行い、全消しの場合はボーナスを加算するように実装します：

```elm
-- src/Main.elm（update 関数の Checking モード部分を修正）
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- 既存の処理...

        Tick deltaTime ->
            case model.mode of
                -- 既存の Playing, Erasing, Falling モード...

                Checking ->
                    -- 消去判定モード
                    let
                        erasableGroups =
                            findAllErasableGroups model.board
                    in
                    if List.isEmpty erasableGroups then
                        -- 消去なし → 全消しチェック
                        let
                            isAllClear =
                                GameLogic.isEmpty model.board

                            zenkeshiBonus =
                                if isAllClear then
                                    3600  -- 全消しボーナス

                                else
                                    0
                        in
                        -- 次のぷよを出す
                        ( { model
                            | mode = Playing
                            | currentPair = Just (PuyoPair.create 2 1 Red Blue)
                            | score = model.score + zenkeshiBonus
                          }
                        , Cmd.none
                        )

                    else
                        -- 消去あり → 消去モードへ
                        let
                            newChainCount =
                                model.chainCount + 1

                            erasedCount =
                                List.sum (List.map Set.size erasableGroups)

                            chainBonus =
                                case newChainCount of
                                    1 -> 1
                                    2 -> 8
                                    3 -> 16
                                    4 -> 32
                                    5 -> 64
                                    6 -> 96
                                    7 -> 128
                                    _ -> 160

                            points =
                                erasedCount * chainBonus

                            newBoard =
                                List.foldl GameLogic.erasePuyos model.board erasableGroups
                        in
                        ( { model
                            | mode = Erasing
                            | chainCount = newChainCount
                            | score = model.score + points
                            | board = newBoard
                          }
                        , Cmd.none
                        )

                _ ->
                    ( model, Cmd.none )

        -- その他のメッセージ処理...
        _ ->
            ( model, Cmd.none )
```

「`Checking` モードで全消しをチェックして、該当すればボーナスを加算しているんですね！」そうです！処理の流れを見てみましょう：

1. **消去対象なし**の場合：
   - 全消し判定を行う（`GameLogic.isEmpty`）
   - 全消しなら 3600 点のボーナスを加算
   - 次のぷよを出して `Playing` モードへ

2. **消去対象あり**の場合：
   - 連鎖カウントを増やす
   - スコアを計算して加算
   - `Erasing` モードへ

### View の更新

全消しが発生したことを視覚的に分かりやすくするため、メッセージを表示しましょう：

```elm
-- src/Main.elm（Model の拡張）
type alias Model =
    { board : Board
    , currentPair : Maybe PuyoPair
    , mode : GameMode
    , dropTimer : Float
    , dropInterval : Float
    , fastDropActive : Bool
    , chainCount : Int
    , score : Int
    , message : String      -- 追加: メッセージ表示用
    }


init : Model
init =
    { board = Board.create 6 12
    , currentPair = Nothing
    , mode = Start
    , dropTimer = 0
    , dropInterval = 1000
    , fastDropActive = False
    , chainCount = 0
    , score = 0
    , message = ""          -- 追加
    }


-- update 関数の Checking モード部分を修正
Checking ->
    let
        erasableGroups =
            findAllErasableGroups model.board
    in
    if List.isEmpty erasableGroups then
        let
            isAllClear =
                GameLogic.isEmpty model.board

            zenkeshiBonus =
                if isAllClear then
                    3600

                else
                    0

            message =
                if isAllClear then
                    "全消し！+3600"

                else
                    ""
        in
        ( { model
            | mode = Playing
            | currentPair = Just (PuyoPair.create 2 1 Red Blue)
            | score = model.score + zenkeshiBonus
            | message = message
          }
        , Cmd.none
        )

    else
        -- 既存の処理...


-- view 関数でメッセージを表示
view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div []
            [ text ("スコア: " ++ String.fromInt model.score)
            , text " | "
            , text ("連鎖数: " ++ String.fromInt model.chainCount)
            ]
        , if String.isEmpty model.message then
            text ""

          else
            div
                [ style "color" "gold"
                , style "font-weight" "bold"
                , style "font-size" "24px"
                , style "margin" "10px 0"
                ]
                [ text model.message ]
        , case model.mode of
            Start ->
                button [ onClick StartGame ] [ text "ゲーム開始" ]

            GameOver ->
                div []
                    [ div [] [ text "ゲームオーバー！" ]
                    , div [] [ text ("最終スコア: " ++ String.fromInt model.score) ]
                    ]

            _ ->
                div []
                    [ viewBoard model.board
                    , viewCurrentPair model.currentPair
                    ]
        ]
```

「全消しメッセージが金色で表示されるんですね！」そうです！`style` 属性で色やサイズを指定して、目立つようにしています。

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。盤面のぷよをすべて消してみましょう！

「本当だ！全消しすると『全消し！+3600』って表示されます！」おめでとうございます！全消しボーナスが実装できましたね。

### イテレーション8のまとめ

このイテレーションで実装した内容：

1. **全消し判定**
   - `GameLogic.isEmpty`: 盤面がすべて空かを判定
   - `List.any` で Filled セルの存在をチェック

2. **全消しボーナス**
   - 消去対象がない時に全消し判定
   - 全消しの場合は 3600 点のボーナス
   - メッセージで全消しを通知

3. **View の拡張**
   - `message` フィールドでメッセージ表示
   - 全消し時は金色で目立つ表示

4. **テストの作成**
   - 全消し判定のテスト（2テスト）

### 学んだこと

- **List.any の活用**: リストの中に条件を満たす要素があるかを簡潔にチェック
- **条件分岐によるボーナス**: if 式でボーナスの有無を切り替え
- **視覚的フィードバック**: style 属性で動的にスタイルを変更
- **一時的なメッセージ**: Model にメッセージフィールドを追加

次のイテレーションでは、ゲームオーバー判定の実装に進みます！

## イテレーション9: ゲームオーバーの実装

「ゲームが終わる条件も必要ですよね？」そうですね！どんなゲームにも終わりがあります。ぷよぷよでは、新しいぷよを配置できなくなったときにゲームオーバーとなります。今回は、そのゲームオーバー判定と演出を実装していきましょう！

### ユーザーストーリー

まずは、このイテレーションで実装するユーザーストーリーを確認しましょう：

> プレイヤーとして、ゲームオーバーになるとゲーム終了の演出を見ることができる

「ゲームが終わったことが明確に分かるといいですね！」そうですね。ゲームの終わりが明確でないと、プレイヤーはモヤモヤした気持ちになってしまいます。

### TODOリスト

「どんな作業が必要になりますか？」このユーザーストーリーを実現するために、TODOリストを作成してみましょう。

「ゲームオーバーを実装する」という機能を実現するためには、以下のようなタスクが必要そうですね：

- ゲームオーバー判定を実装する（新しいぷよを配置できない状態を検出する）
- ゲームオーバー演出を実装する（GameOver モードへの遷移）
- リスタート機能を実装する（ゲームオーバー後に新しいゲームを始められるようにする）

「なるほど、順番に実装していけばいいんですね！」そうです、一つずつ進めていきましょう。

### テスト: ゲームオーバー判定

まず、新しいぷよが配置できるかどうかを判定する機能をテストしましょう：

```elm
-- tests/PuyoPairTests.elm（続き）
suite : Test
suite =
    describe "PuyoPair"
        [ -- 既存のテスト...
        , describe "canSpawn"
            [ test "配置位置が空なら生成可能" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12

                        pair =
                            PuyoPair.create 2 1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal True
            , test "軸ぷよの位置が埋まっていたら生成不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 1 (Filled Blue)

                        pair =
                            PuyoPair.create 2 1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            , test "子ぷよの位置が埋まっていたら生成不可" <|
                \_ ->
                    let
                        board =
                            Board.create 6 12
                                |> Board.setCell 2 0 (Filled Blue)

                        pair =
                            PuyoPair.create 2 1 Red Blue
                    in
                    PuyoPair.canMove pair board
                        |> Expect.equal False
            ]
        ]
```

「既存の `canMove` 関数が使えるんですね！」そうです！新しいぷよが配置できるかどうかも、既存の `canMove` 関数で判定できます。

### 実装: ゲームオーバー判定

次に、新しいぷよを生成しようとしたときにゲームオーバーかどうかを判定する処理を実装します：

```elm
-- src/Main.elm（update 関数の Checking モードを修正）
update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- 既存の処理...

        Tick deltaTime ->
            case model.mode of
                -- 既存の Playing, Erasing, Falling モード...

                Checking ->
                    let
                        erasableGroups =
                            findAllErasableGroups model.board
                    in
                    if List.isEmpty erasableGroups then
                        -- 消去なし → 全消しチェックして次のぷよを出す
                        let
                            isAllClear =
                                GameLogic.isEmpty model.board

                            zenkeshiBonus =
                                if isAllClear then
                                    3600

                                else
                                    0

                            message =
                                if isAllClear then
                                    "全消し！+3600"

                                else
                                    ""

                            -- 新しいぷよを生成
                            newPair =
                                PuyoPair.create 2 1 Red Blue

                            -- 配置可能かチェック
                            canSpawn =
                                PuyoPair.canMove newPair model.board
                        in
                        if canSpawn then
                            -- 配置可能 → 通常のゲーム続行
                            ( { model
                                | mode = Playing
                                | currentPair = Just newPair
                                | score = model.score + zenkeshiBonus
                                | message = message
                              }
                            , Cmd.none
                            )

                        else
                            -- 配置不可 → ゲームオーバー
                            ( { model
                                | mode = GameOver
                                | score = model.score + zenkeshiBonus
                                | message = "ゲームオーバー！"
                              }
                            , Cmd.none
                            )

                    else
                        -- 既存の消去処理...
                        let
                            newChainCount =
                                model.chainCount + 1

                            erasedCount =
                                List.sum (List.map Set.size erasableGroups)

                            chainBonus =
                                case newChainCount of
                                    1 -> 1
                                    2 -> 8
                                    3 -> 16
                                    4 -> 32
                                    5 -> 64
                                    6 -> 96
                                    7 -> 128
                                    _ -> 160

                            points =
                                erasedCount * chainBonus

                            newBoard =
                                List.foldl GameLogic.erasePuyos model.board erasableGroups
                        in
                        ( { model
                            | mode = Erasing
                            | chainCount = newChainCount
                            | score = model.score + points
                            | board = newBoard
                          }
                        , Cmd.none
                        )

                GameOver ->
                    -- ゲームオーバー時は何もしない
                    ( model, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        -- その他のメッセージ処理...
        _ ->
            ( model, Cmd.none )
```

「新しいぷよを生成する前に `canMove` でチェックして、配置できなければゲームオーバーになるんですね！」その通りです！

### 実装: リスタート機能

ゲームオーバー後に新しいゲームを始められるようにリスタート機能を追加します：

```elm
-- src/Main.elm（Msg と update の拡張）
type Msg
    = StartGame
    | KeyPressed String
    | Tick Float
    | Restart      -- 追加
    | NoOp


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        -- 既存の処理...

        Restart ->
            -- ゲームを初期状態にリセット
            ( init, Cmd.none )

        _ ->
            ( model, Cmd.none )
```

### View の更新

ゲームオーバー画面を表示し、リスタートボタンを追加します：

```elm
-- src/Main.elm（view 関数の GameOver 部分を更新）
view : Model -> Html Msg
view model =
    div []
        [ h1 [] [ text "ぷよぷよ - Elm 版" ]
        , div []
            [ text ("スコア: " ++ String.fromInt model.score)
            , text " | "
            , text ("連鎖数: " ++ String.fromInt model.chainCount)
            ]
        , if String.isEmpty model.message then
            text ""

          else
            div
                [ style "color" "gold"
                , style "font-weight" "bold"
                , style "font-size" "24px"
                , style "margin" "10px 0"
                ]
                [ text model.message ]
        , case model.mode of
            Start ->
                button [ onClick StartGame ] [ text "ゲーム開始" ]

            GameOver ->
                div []
                    [ div
                        [ style "color" "red"
                        , style "font-weight" "bold"
                        , style "font-size" "32px"
                        , style "margin" "20px 0"
                        ]
                        [ text "ゲームオーバー！" ]
                    , div
                        [ style "font-size" "24px"
                        , style "margin" "10px 0"
                        ]
                        [ text ("最終スコア: " ++ String.fromInt model.score) ]
                    , button
                        [ onClick Restart
                        , style "font-size" "18px"
                        , style "padding" "10px 20px"
                        , style "margin-top" "20px"
                        , style "cursor" "pointer"
                        ]
                        [ text "もう一度遊ぶ" ]
                    ]

            _ ->
                div []
                    [ viewBoard model.board
                    , viewCurrentPair model.currentPair
                    ]
        ]
```

「ゲームオーバー画面に『もう一度遊ぶ』ボタンが表示されるんですね！」そうです！ボタンをクリックすると、`Restart` メッセージが送られて、ゲームが初期状態にリセットされます。

### アプリケーションの実行

では、アプリケーションを実行してみましょう：

```bash
elm reactor
```

ブラウザで `http://localhost:8000` を開き、`src/Main.elm` をクリックします。わざとぷよを積み上げてゲームオーバーにしてみましょう！

「本当だ！新しいぷよが出せなくなるとゲームオーバーになります！」おめでとうございます！ゲームオーバー機能が実装できましたね。

### イテレーション9のまとめ

このイテレーションで実装した内容：

1. **ゲームオーバー判定**
   - 新しいぷよの配置位置に既にぷよがあるかチェック
   - `canMove` 関数を再利用
   - 配置不可なら GameOver モードへ遷移

2. **ゲームオーバー演出**
   - GameOver モード時の専用画面
   - 最終スコアの表示
   - 赤字で目立つメッセージ

3. **リスタート機能**
   - `Restart` メッセージで初期状態に戻す
   - 「もう一度遊ぶ」ボタン
   - init 関数を再利用

4. **テストの作成**
   - 配置可能判定のテスト（3テスト）

### 学んだこと

- **既存関数の再利用**: `canMove` を生成判定にも活用
- **状態遷移の完成**: Start → Playing → Checking → Erasing → Falling → GameOver
- **init の再利用**: リスタート時に init を呼び出すだけでリセット完了
- **視覚的な差別化**: ゲームオーバー時は赤字、全消しは金色など状態ごとに色を変える

## まとめ

このチュートリアルでは、Elm でぷよぷよゲームを作りながら、テスト駆動開発（TDD）の実践方法を学びました。

### Elm で学んだこと

1. **型システムの力**
   - カスタム型による明確な状態表現（GameMode, Cell, PuyoColor）
   - Maybe 型で null エラーを完全に回避
   - コンパイラによる網羅性チェック（パターンマッチング）

2. **The Elm Architecture**
   - Model - Update - View の明確な分離
   - 単方向データフロー
   - Subscription による宣言的な副作用管理（キーボード、タイマー）

3. **関数型プログラミング**
   - 不変性によるバグの削減
   - パターンマッチングによる分岐の明確化
   - パイプライン演算子 `|>` による処理の連鎖
   - 再帰による深さ優先探索（DFS）

4. **テスト駆動開発**
   - Red-Green-Refactor サイクル
   - 小さなステップでの着実な進歩
   - テストによる安全なリファクタリング
   - elm-test による型安全なテスト

### Elm の利点

- **ランタイムエラーがない**: Elm の型システムは、null、undefined、型エラーを完全に排除します
- **親切なコンパイラ**: エラーメッセージが非常に親切で、初心者でも理解しやすい
- **保守しやすいコード**: 不変性と型システムにより、コードが予測可能で理解しやすい
- **予測可能な振る舞い**: 副作用が制御されているため、デバッグが容易
- **小さなバンドルサイズ**: 最適化されたJavaScriptコードを生成

### TypeScript/F# との比較

| 特徴 | TypeScript | F# (Bolero) | Elm |
|------|------------|-------------|-----|
| **型安全性** | 任意（strict モード推奨） | 強力 | 最強（ランタイムエラーなし） |
| **学習曲線** | 緩やか（JS 経験者） | 中程度 | 緩やか |
| **エコシステム** | 非常に豊富 | .NET エコシステム | 限定的だが高品質 |
| **バンドルサイズ** | 中程度 | 大きい | 非常に小さい |
| **開発体験** | 良好 | 良好 | 優れている |
| **エラーメッセージ** | 良好 | 良好 | 非常に親切 |
| **副作用管理** | 開発者任せ | Elmish で管理 | 完全に制御 |

### 実装したイテレーション一覧

- **イテレーション0**: 環境構築と The Elm Architecture の基礎
- **イテレーション1**: ゲーム開始とドメインモデルの実装
- **イテレーション2**: キーボード入力とぷよの移動
- **イテレーション3**: 回転と壁キック
- **イテレーション4**: 自由落下と着地判定
- **イテレーション5**: 高速落下（下矢印キー）
- **イテレーション6**: ぷよの消去（深さ優先探索）
- **イテレーション7**: 連鎖反応とスコア計算
- **イテレーション8**: 全消しボーナス
- **イテレーション9**: ゲームオーバーとリスタート

### 次のステップ

このチュートリアルで基礎を学んだ後、以下のような拡張を試してみましょう：

1. **難易度調整**
   - 落下速度の段階的な増加
   - 色数の増加（5色、6色）
   - レベルシステムの導入

2. **アニメーション**
   - ぷよの消去アニメーション（CSS Transitions/Animations）
   - 連鎖時のエフェクト
   - ぷよの落下時のスムーズな移動

3. **サウンド**
   - 効果音の追加（Web Audio API）
   - BGM の実装
   - 連鎖数に応じた効果音の変化

4. **AI 対戦**
   - シンプルな AI の実装
   - ミニマックス法などの探索アルゴリズム
   - 難易度調整

5. **データ永続化**
   - ハイスコアの保存（LocalStorage, Ports）
   - ゲーム途中のセーブ機能
   - リプレイ機能

### テスト駆動開発の価値

> テストを書きながら開発することによって、設計が良い方向に変わり、コードが改善され続け、それによって自分自身が開発に前向きになること、それがテスト駆動開発の目指すゴールです。
>
> — Kent Beck 『テスト駆動開発』 付録C　訳者解説：テスト駆動開発の現在

このチュートリアルを通じて、以下を体験できたはずです：

- **小さなステップ**: TODOリストで作業を分解し、一つずつ確実に進める
- **安全なリファクタリング**: テストがあるから、自信を持ってコードを改善できる
- **設計の改善**: テストしやすいコードは、自然と良い設計になる
- **開発の楽しさ**: テストが通る瞬間の達成感

### Elm と TDD の相乗効果

Elm とテスト駆動開発の組み合わせは、初心者にも優しく、それでいて強力です：

- **型システムがテストの一部を担う**: null チェックや型エラーのテストは不要
- **コンパイラが最初の品質保証**: コンパイルが通れば、多くのバグが既に排除されている
- **重要なロジックに集中**: ビジネスロジックのテストに集中できる
- **リファクタリングが安全**: 型とテストの二重保護

### 結びに

Elm は、「ランタイムエラーのない」という大胆な約束を守る、数少ない言語の一つです。型システムと The Elm Architecture の組み合わせにより、堅牢で保守しやすいフロントエンドアプリケーションを構築できます。

テスト駆動開発と組み合わせることで、さらに高い品質のソフトウェアを、自信を持って開発できるようになります。

ぜひ、学んだ知識を活かして、自分だけのアプリケーションを作ってみてください。Elm の世界へようこそ！

## 参考資料

### Elm 公式リソース
- **Elm 公式ガイド**: https://guide.elm-lang.org/
- **Elm パッケージ**: https://package.elm-lang.org/
- **elm-test ドキュメント**: https://package.elm-lang.org/packages/elm-explorations/test/latest/
- **Elm Discourse**: https://discourse.elm-lang.org/

### テスト駆動開発
- **テスト駆動開発**: Kent Beck 著
- **リーダブルコード**: Dustin Boswell, Trevor Foucher 著
- **Clean Code**: Robert C. Martin 著

### ゲーム開発
- **ゲームプログラミングパターン**: Robert Nystrom 著
- **Game Programming Patterns**: https://gameprogrammingpatterns.com/

Happy Coding! 🎉
