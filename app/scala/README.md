# ぷよぷよゲーム - Scala.js 実装

Scala.js と静的型付け関数型プログラミングによるぷよぷよゲームの実装です。

## 特徴

- **静的型付け**: コンパイル時の型チェックによる高い安全性
- **関数型プログラミング**: 不変性と純粋関数による予測可能な動作
- **ADT（代数的データ型）**: sealed trait による型安全なモデリング
- **Scala.js**: JavaScript への変換とブラウザでの実行

## プロジェクト構成

```
app/scala/
├── src/
│   └── main/scala/puyo/
│       ├── Types.scala         # 型定義（PuyoColor, Rotation, Position等）
│       ├── Board.scala         # ボード管理
│       ├── PuyoGenerator.scala # ランダムぷよ生成
│       ├── GameLogic.scala     # ゲームロジック
│       └── Main.scala          # エントリーポイントとUI
├── public/
│   ├── index.html              # HTML エントリーポイント
│   └── js/                     # Scala.js ビルド成果物
├── project/
│   ├── build.properties        # sbt バージョン
│   └── plugins.sbt             # sbt プラグイン
├── build.sbt                   # ビルド設定
└── package.json                # npm スクリプト
```

## セットアップ

### 前提条件

- Java 11 以降
- sbt 1.9.x
- Node.js（npm が使用可能）

### インストール

```bash
cd app/scala

# 依存関係の解決とコンパイル
sbt compile

# npm パッケージのインストール
npm install
```

## ビルドと実行

### 開発ビルド（高速）

```bash
# Scala.js を fastLinkJS でコンパイル
sbt fastLinkJS

# または npm スクリプトで
npm run compile
```

### 本番ビルド（最適化）

```bash
# Scala.js を fullLinkJS でコンパイル（最適化）
sbt fullLinkJS

# または npm スクリプトで
npm run build
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで `http://localhost:8082` を開いてゲームをプレイできます。

### テスト実行

```bash
sbt test
```

## ゲーム仕様

- **ボードサイズ**: 8×12 マス（幅 8、高さ 12）
- **ぷよの色**: 5 色（赤、緑、青、黄、紫）
- **消去ルール**: 同色 4 つ以上の接続で消去
- **連鎖システム**: 消去後の落下により新たな接続が形成される
- **スコアリング**: 基本スコア + 連鎖ボーナス + 全消しボーナス

## 操作方法

- `←` `→` : 左右移動
- `↓` : 高速落下
- `↑` : 回転
- `スペース` : ハードドロップ

## 技術スタック

- **Scala 2.13.12**: 静的型付け関数型言語
- **Scala.js 1.15.0**: Scala から JavaScript への変換
- **scalajs-dom 2.8.0**: DOM API のタイプセーフなラッパー
- **ScalaTest 3.2.17**: テストフレームワーク

## アーキテクチャ

### 型安全性

```scala
// sealed trait による ADT
sealed trait PuyoColor {
  def colorCode: String
  def value: Int
}

// パターンマッチングの網羅性チェック
rotation match {
  case Rotation.Deg0 => ...
  case Rotation.Deg90 => ...
  case Rotation.Deg180 => ...
  case Rotation.Deg270 => ...
  // コンパイラが全ケースをチェック
}
```

### 不変データ構造

```scala
// case class による不変データ
case class Board(cells: Vector[Vector[Int]]) {
  def setPuyo(x: Int, y: Int, color: Int): Board =
    copy(cells = cells.updated(y, cells(y).updated(x, color)))
}
```

### 関数型プログラミング

```scala
// 純粋関数
def calculateScore(clearedCount: Int, chainBonus: Int): Int =
  clearedCount * 10 + chainBonus

// 末尾再帰による最適化
@tailrec
def loop(current: Board): Board = {
  val next = dropOnce(current)
  if (next == current) current
  else loop(next)
}
```

## 開発プロセス

このプロジェクトは静的型付け TDD に基づいて開発されました：

1. Phase 1: 型定義（ADT による安全なモデリング）
2. Phase 2: ボード管理（不変データ構造）
3. Phase 3: ぷよ生成と移動（純粋関数）
4. Phase 4: ゲームロジック（BFS、連鎖処理）
5. Phase 5: UI とゲームループ（Scala.js DOM API）

## ライセンス

MIT
