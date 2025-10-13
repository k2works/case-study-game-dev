# ぷよぷよゲーム (Scala.js 日本語コード版)

Scala.js を使用したぷよぷよゲームのテスト駆動開発チュートリアル実装です。

## 必要な環境

- Java 17+
- sbt 1.9.9+
- Node.js 18+ (開発サーバー用)

## セットアップ

```bash
npm install
```

## 開発コマンド

### コンパイル（開発用・高速）

```bash
npm run compile
# または
sbt fastLinkJS
```

### ビルド（本番用・最適化）

```bash
npm run build
# または
sbt fullLinkJS
```

### テスト実行

```bash
npm test
# または
sbt test
```

### 開発サーバー起動

```bash
npm run serve
```

ブラウザが自動的に開き、`http://localhost:8083` でゲームが起動します。

### 開発モード（コンパイル + サーバー起動）

```bash
npm run dev
```

コンパイル後、自動的にブラウザでゲームが開きます。

### クリーン

```bash
sbt clean
```

## 操作方法

- **←→**: ぷよを左右に移動
- **↑**: ぷよを回転

## プロジェクト構造

```
app/scala-2/
├── src/
│   ├── main/scala/com/example/puyo/  # メインコード
│   │   └── Main.scala                 # 全てのコード
│   └── test/scala/com/example/puyo/  # テストコード（未実装）
├── index.html                         # エントリーHTML
├── build.sbt                          # sbt ビルド設定
└── package.json                       # npm スクリプト
```

## 実装済みイテレーション

- ✅ イテレーション 0: 環境構築
- ✅ イテレーション 1: ゲーム開始
- ✅ イテレーション 2: ぷよの移動
- ✅ イテレーション 3: ぷよの回転
- ✅ イテレーション 4: ぷよの落下
- ⬜ イテレーション 5: ぷよの固定と積み上げ（実装済み）
- ⬜ イテレーション 6: ぷよの消去
- ⬜ イテレーション 7: 連鎖とスコア

## 実装の特徴

- **setInterval を使用した確実な落下**: requestAnimationFrame ではなく、setInterval(1000) でシンプルに1秒ごとの落下を実現
- **日本語識別子**: コード内の変数名・関数名・クラス名を全て日本語にしてドメイン知識を明確化
- **シンプルな構造**: 全てのコードを Main.scala に集約

## ドキュメント

詳細なチュートリアルは以下を参照：
- [ぷよぷよから始めるテスト駆動開発入門_Scala_js_日本語コード版.md](../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_Scala_js_日本語コード版.md)
