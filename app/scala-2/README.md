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
sbt fastOptJS
```

### ビルド（本番用・最適化）

```bash
npm run build
# または
sbt fullOptJS
```

### テスト実行

```bash
npm test
# または
sbt test
```

注: テストは Node.js 環境で実行されるため、DOM が存在せず一部のテストが失敗します。これは既知の制約です。

### 開発サーバー起動

```bash
npm run serve
```

ブラウザが自動的に開き、`http://localhost:8083` でゲームが起動します。

### 開発モード（コンパイル + サーバー起動）

```bash
npm run dev
```

### クリーン

```bash
npm run clean
# または
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
│   │   ├── Main.scala                 # エントリーポイント
│   │   ├── ゲーム.scala               # ゲームループ
│   │   ├── プレイヤー.scala           # プレイヤー操作
│   │   ├── ステージ.scala             # ゲームステージ
│   │   ├── ぷよ画像.scala             # ぷよの描画
│   │   ├── スコア.scala               # スコア管理
│   │   └── 設定情報.scala             # ゲーム設定
│   └── test/scala/com/example/puyo/  # テストコード
│       ├── ゲームSpec.scala
│       └── プレイヤーSpec.scala
├── index.html                         # エントリーHTML
├── build.sbt                          # sbt ビルド設定
└── package.json                       # npm スクリプト
```

## 実装済みイテレーション

- ✅ イテレーション 0: 環境構築
- ✅ イテレーション 1: ゲーム開始
- ✅ イテレーション 2: ぷよの移動
- ✅ イテレーション 3: ぷよの回転
- ⬜ イテレーション 4: ぷよの落下
- ⬜ イテレーション 5: ぷよの固定と積み上げ
- ⬜ イテレーション 6: ぷよの消去
- ⬜ イテレーション 7: 連鎖とスコア

## IntelliJ IDEA での実行

### ⚠️ 重要な制約

Scala.js プロジェクトは JVM 上で直接実行できません。IntelliJ IDEA から以下を実行しようとするとエラーになります：

- ❌ `Main.scala` の右クリック → 実行
- ❌ テストファイルの右クリック → テスト実行

### ✅ 正しい実行方法

#### 1. アプリケーション実行

**sbt シェルから実行：**
1. IntelliJ IDEA 下部の「sbt」タブを開く
2. sbt シェルで以下を実行：
   ```
   fastOptJS
   ```
3. ブラウザで `index.html` を開く

**または npm script から：**
```bash
npm run dev
```

#### 2. テスト実行

**sbt シェルから実行：**
```
test
```

**または npm script から：**
```bash
npm test
```

**または IntelliJ IDEA の Run Configuration を作成：**
1. Run → Edit Configurations
2. 「+」→ sbt Task
3. Tasks: `test`
4. Working directory: `app/scala-2`
5. 実行

### 推奨ワークフロー

1. **開発サーバー起動（初回のみ）：**
   ```bash
   npm run serve
   ```
   ブラウザが `http://localhost:8083` で開きます

2. **コード変更時の再コンパイル：**

   sbt シェルで以下を実行して自動再コンパイルを有効化：
   ```
   ~fastOptJS
   ```
   `~` プレフィックスにより、ファイル変更を検知して自動的に再コンパイルされます

3. **ブラウザでリロード：**

   ブラウザで F5 キーを押して変更を確認

## ドキュメント

詳細なチュートリアルは以下を参照：
- [ぷよぷよから始めるテスト駆動開発入門_Scala_js_日本語コード版.md](../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_Scala_js_日本語コード版.md)
