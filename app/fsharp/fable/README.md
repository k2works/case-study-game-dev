# PuyoPuyo (Fable + Webpack)

## 概要

Fable コンパイラを使用して F# を JavaScript にトランスパイルし、Webpack でバンドルするぷよぷよゲーム実装。ブラウザの Canvas API を直接操作し、TDD で開発されています。

### 目的

- F# と Fable を使った JavaScript へのトランスパイル実証
- Canvas API を使った 2D ゲーム描画
- TDD（テスト駆動開発）によるゲームロジックの構築
- Webpack を使ったモジュールバンドリング

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Node.js      | 18.x 以上  | 必須 |
| .NET SDK     | 8.0        | 必須 |
| npm          | 9.x 以上   |      |

## 構成

- [構築](#構築)
- [配置](#配置)
- [開発](#開発)
- [アーキテクチャ](#アーキテクチャ)

## 詳細

### Quick Start

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動（ホットリロード付き）
npm start

# ブラウザで http://localhost:8080 にアクセス
```

### 構築

#### 初回セットアップ

```bash
# Node.js と .NET SDK のバージョン確認
node --version
dotnet --version

# npm パッケージのインストール
npm install

# .NET パッケージの復元
dotnet restore src/
dotnet restore tests/
```

#### ビルド

```bash
# F# を JavaScript にコンパイル + Webpack バンドル
npm run build

# 出力先: public/bundle.js
```

**[⬆ back to top](#構成)**

### 配置

#### 開発環境

```bash
# 開発サーバー起動（ホットリロード）
npm start

# ファイル監視モード（自動再ビルド）
npm run watch
```

#### プロダクションビルド

```bash
# 最適化ビルド
npm run build

# public/ ディレクトリを静的ホスティングサービスにデプロイ
```

#### 手動での実行

```bash
# public/index.html をブラウザで直接開く
# または、シンプルな HTTP サーバーを起動
npx http-server public -p 8080
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構造

```
app/fsharp/fable/
├── src/                    # F# ソースコード
│   ├── Types.fs           # 基本型定義
│   ├── Board.fs           # ボード操作
│   ├── Puyo.fs            # ぷよペア管理
│   ├── GameLogic.fs       # ゲームルール
│   ├── Rendering.fs       # Canvas 描画
│   ├── Game.fs            # ゲーム状態管理
│   └── Main.fs            # エントリーポイント
├── tests/                 # テストコード
│   └── Puyo.Tests.fsproj
├── public/                # 静的リソース
│   ├── index.html
│   ├── styles.css
│   └── bundle.js          # ビルド出力
├── dist/                  # Fable コンパイル出力
├── package.json
└── webpack.config.js      # Webpack 設定
```

#### npm スクリプト

```bash
# F# → JavaScript コンパイル
npm run prebuild

# 開発サーバー起動
npm start

# プロダクションビルド
npm run build

# テスト実行
npm test

# ファイル監視
npm run watch
```

#### テスト実行

```bash
# 全テスト実行
npm test

# または dotnet コマンドで直接実行
dotnet test tests/

# カバレッジ付き実行
dotnet test tests/ --collect:"XPlat Code Coverage"
```

#### TDD サイクル

このプロジェクトは TDD で開発されています：

1. **Red（失敗）**: 最小限の失敗するテストを書く
2. **Green（成功）**: テストを通す最小限のコードを実装
3. **Refactor（改善）**: テストが通った後でリファクタリング

```bash
# TDD サイクルの例
# 1. テストを書く (tests/)
# 2. npm test で失敗を確認
# 3. 実装を追加 (src/)
# 4. npm test で成功を確認
# 5. リファクタリング
```

#### コーディング規約

- F# の標準的な命名規則に従う
- 純粋関数を優先し、副作用は明示的に分離
- ドメインロジックは `GameLogic.fs` に集約
- 描画処理は `Rendering.fs` に分離
- すべてのコミットでテストが通る状態を維持

**[⬆ back to top](#構成)**

## アーキテクチャ

### レイヤー構成

```
┌─────────────────────────────────────────┐
│         Main.fs (エントリーポイント)      │
│    - イベントリスナー設定                 │
│    - タイマー管理                         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│          Game.fs (ゲーム制御)            │
│    - ゲーム状態管理                       │
│    - キー入力処理                         │
│    - ゲームループ                         │
└───────────┬───────────┬─────────────────┘
            │           │
            ▼           ▼
┌──────────────────┐  ┌──────────────────┐
│  GameLogic.fs    │  │  Rendering.fs    │
│  (ゲームルール)   │  │  (Canvas 描画)   │
│  - 落下処理      │  │  - ボード描画    │
│  - 消去判定      │  │  - ぷよ描画      │
│  - 連鎖計算      │  │  - UI 更新       │
└────────┬─────────┘  └──────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│      Domain Models (純粋データ)          │
│  - Types.fs (基本型)                     │
│  - Board.fs (ボード操作)                 │
│  - Puyo.fs (ぷよペア)                    │
└─────────────────────────────────────────┘
```

### Fable コンパイルフロー

```
F# ソースコード (.fs)
    ↓ [Fable Compiler]
JavaScript (dist/)
    ↓ [Webpack]
バンドル済み JS (public/bundle.js)
    ↓
ブラウザで実行
```

### 主要な技術スタック

- **Fable**: F# to JavaScript コンパイラ
- **Webpack**: モジュールバンドラー
- **Canvas API**: 2D グラフィックス描画
- **xUnit**: テストフレームワーク

### 主要な機能

- ぷよペアの操作（左右移動、回転、落下）
- リアルタイム Canvas 描画
- 連鎖判定と消去アニメーション
- スコア計算とゲームオーバー判定
- キーボード入力対応

## 参照

- [Fable 公式ドキュメント](https://fable.io/)
- [Webpack ドキュメント](https://webpack.js.org/)
- [F# ドキュメント](https://learn.microsoft.com/ja-jp/dotnet/fsharp/)
- [Canvas API リファレンス](https://developer.mozilla.org/ja/docs/Web/API/Canvas_API)
- [ぷよぷよルール](https://puyo.sega.jp/portal/howto.html)
