# ぷよぷよゲーム (Scala.js + TDD)

## 概要

### 目的

テスト駆動開発 (TDD) を用いて、ぷよぷよゲームを Scala.js で実装する。
型安全な JavaScript 生成と、関数型プログラミングの利点を活かした開発を行う。

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Java         | 11+        | JDK  |
| sbt          | 1.9.9      | Scala ビルドツール |
| Scala        | 3.2.2      | Scala 3 |
| Node.js      | 16+        | npm スクリプト実行用（推奨） |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

**重要**: このプロジェクトは Java 11 が必要です。Java 23 などの新しいバージョンでは動作しません。

#### Java バージョンの確認と切り替え（Scoop を使用している場合）

##### Git Bash / WSL での手順

```bash
# Java 11 がインストールされているか確認
scoop list openjdk11

# Java 11 がインストールされていない場合
scoop install openjdk11

# Java 11 に切り替え（新しいターミナルで有効）
scoop reset openjdk11

# Java バージョンの確認
java -version
# openjdk version "11.0.2" と表示されることを確認
```

##### Windows PowerShell / PowerShell 7 での手順

**方法1: 新しい PowerShell ウィンドウを開く（推奨）**

```powershell
# Java 11 がインストールされているか確認
scoop list openjdk11

# Java 11 がインストールされていない場合
scoop install openjdk11

# Java 11 に切り替え（新しいターミナルで有効）
scoop reset openjdk11

# 新しい PowerShell ウィンドウを開いて、Java バージョンの確認
java -version
# openjdk version "11.0.2" と表示されることを確認

# プロジェクトディレクトリに移動
cd C:\Users\PC202411-1\IdeaProjects\case-study-game-dev\app\scala-2

# コンパイル
sbt compile
```

**方法2: 現在の PowerShell セッションで環境変数を設定**

```powershell
# 環境変数を設定（現在のセッションのみ有効）
$env:JAVA_HOME = "C:\Users\PC202411-1\scoop\apps\openjdk11\current"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Java バージョンの確認
java -version
# openjdk version "11.0.2" と表示されることを確認

# プロジェクトディレクトリに移動
cd C:\Users\PC202411-1\IdeaProjects\case-study-game-dev\app\scala-2

# コンパイル
sbt compile
```

#### npm を使用する場合（推奨）

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動（コンパイル + サーバー起動）
npm run dev
# ブラウザで http://localhost:8083 が自動的に開きます

# テスト実行
npm test

# テストの自動実行（ファイル変更時）
npm run test:watch
```

#### sbt を直接使用する場合

```bash
# 依存関係のダウンロード
sbt update

# テスト実行
sbt test

# JavaScript へのコンパイル（開発用）
sbt fastLinkJS

# ローカルサーバーの起動
python -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

### 構築

#### 開発環境のセットアップ

```bash
# プロジェクト構造の作成
mkdir -p src/main/scala
mkdir -p src/test/scala
mkdir -p project

# build.sbt の作成（既に作成済み）
# project/build.properties の作成（既に作成済み）
# project/plugins.sbt の作成（既に作成済み）
# .scalafmt.conf の作成（既に作成済み）
```

#### 依存関係のインストール

```bash
# sbt が自動的に依存関係をダウンロード
sbt update
```

#### 品質チェックツール

- **WartRemover**: 静的コード解析
- **Scalastyle**: コードスタイルチェック（サイクロマティック複雑度: 7）
- **Scalafmt**: コードフォーマッタ
- **scoverage**: コードカバレッジ測定

**[⬆ back to top](#構成)**

### 配置

#### JavaScript へのビルド

```bash
# 開発用ビルド（高速、デバッグ可能）
sbt fastLinkJS

# 本番用ビルド（最適化、サイズ削減）
sbt fullLinkJS
```

#### 生成されるファイル

- `target/scala-3.2.2/puyo-puyo-game-fastopt.js` - 開発用
- `target/scala-3.2.2/puyo-puyo-game-opt.js` - 本番用

**[⬆ back to top](#構成)**

### 運用

#### テストの実行

```bash
# 全テスト実行
sbt test

# 特定のテストクラスのみ実行
sbt "testOnly *ゲームSpec"

# テストの自動実行（ファイル変更時）
sbt "~ test"
```

#### コードカバレッジ

```bash
# カバレッジレポート生成
sbt clean coverage test coverageReport

# レポートの確認
# target/scala-3.2.2/scoverage-report/index.html をブラウザで開く
```

#### 品質チェック

```bash
# コードフォーマットのチェック
sbt formatCheck

# コードフォーマットの自動修正
sbt format

# 静的コード解析（WartRemover + Scalastyle）
sbt lint

# Scalastyle のみ実行
sbt scalastyle

# 全ての品質チェック実行
sbt check
```

##### Scalastyle の主要なチェック項目

- **サイクロマティック複雑度**: 最大 7
- **メソッドの長さ**: 最大 50 行
- **ファイルの長さ**: 最大 800 行
- **行の長さ**: 最大 100 文字
- **パラメータ数**: 最大 8 個
- **メソッド数**: クラスあたり最大 30 個

**[⬆ back to top](#構成)**

### 開発

#### TDD サイクル

1. **Red（赤）**: 失敗するテストを書く

```bash
# npm を使用する場合
npm run test:watch

# sbt を直接使用する場合
sbt "~ test"
```

2. **Green（緑）**: テストが通る最小限のコードを書く

3. **Refactor（リファクタリング）**: コードを改善する

#### npm スクリプト一覧

```bash
# コンパイル・ビルド
npm run compile        # 開発用ビルド（fastLinkJS）
npm run build          # 本番用ビルド（fullLinkJS）

# テスト
npm test               # テスト実行
npm run test:watch     # テストの自動実行

# 開発サーバー
npm run serve          # サーバー起動（ポート: 8083）
npm run dev            # コンパイル + サーバー起動

# コード品質
npm run format         # コードフォーマット
npm run format:check   # フォーマットチェック
npm run lint           # 静的解析（WartRemover + Scalastyle）
npm run coverage       # カバレッジレポート生成
npm run check          # 全品質チェック

# その他
npm run clean          # ビルド成果物の削除
```

#### 開発ワークフロー

```bash
# 開発セッションの開始（推奨）
npm run dev            # コンパイル + サーバー起動
npm run test:watch     # 別ターミナルでテスト自動実行

# sbt を直接使用する場合
sbt

# sbt シェル内で
> ~ test                    # テストの自動実行
> ~ fastLinkJS              # JavaScript の自動ビルド
> formatCheck               # フォーマットチェック
> format                    # フォーマット自動修正
```

#### カスタムタスク

- `format`: ソースコードをフォーマット
- `formatCheck`: フォーマットチェック
- `lint`: 静的コード解析実行
- `coverage`: カバレッジレポート生成
- `check`: 全ての品質チェック実行

#### プロジェクト構造

```
scala-2/
├── build.sbt                    # プロジェクト設定
├── project/
│   ├── build.properties         # sbt バージョン
│   └── plugins.sbt              # プラグイン設定
├── .scalafmt.conf               # フォーマット設定
├── index.html                   # ゲーム画面
├── src/
│   ├── main/
│   │   └── scala/
│   │       └── com/example/puyo/
│   │           ├── Main.scala
│   │           ├── ゲーム.scala
│   │           ├── 設定情報.scala
│   │           ├── ぷよ画像.scala
│   │           ├── ステージ.scala
│   │           ├── プレイヤー.scala
│   │           └── スコア.scala
│   └── test/
│       └── scala/
│           └── com/example/puyo/
│               ├── ゲームSpec.scala
│               └── プレイヤーSpec.scala
└── target/
    └── scala-3.2.2/
        └── puyo-puyo-game-fastopt.js  # 生成された JavaScript
```

**[⬆ back to top](#構成)**

## 参照

- [Scala.js 公式ドキュメント](https://www.scala-js.org/)
- [sbt 公式ドキュメント](https://www.scala-sbt.org/)
- [ScalaTest 公式ドキュメント](https://www.scalatest.org/)
- [テスト駆動開発 - Kent Beck](https://www.amazon.co.jp/dp/4274217884)
- [Clean Craftsmanship - Robert C. Martin](https://www.amazon.co.jp/dp/4048930850)
