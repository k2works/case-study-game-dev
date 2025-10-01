# ぷよぷよゲーム - TypeScript 実装

TypeScript と Vite を使用したぷよぷよゲームの実装です。

## 概要

### 目的

TDD（テスト駆動開発）に基づいた TypeScript によるぷよぷよゲームの実装

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Node.js      | 18.x以上   | Vite実行に必要 |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

```bash
npm install
npm run dev
```

ブラウザで `http://localhost:5173` を開いてゲームをプレイできます。

### 構築

#### 初回セットアップ

```bash
# 依存関係のインストール
npm install

# コード品質チェックと自動修正
npm run setup
```

**[⬆ back to top](#構成)**

### 配置

#### 本番ビルド

```bash
# TypeScript コンパイル + Vite ビルド
npm run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

#### プレビュー

```bash
# ビルド済みアプリケーションのプレビュー
npm run preview
```

**[⬆ back to top](#構成)**

### 運用

#### 開発サーバー起動

```bash
npm run dev
```

- ホットリロード有効
- ポート: 5173（デフォルト）

#### テスト実行

```bash
# テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ計測
npm run test:coverage
```

#### コード品質管理

```bash
# ESLint
npm run lint
npm run lint:fix

# Prettier
npm run format:check
npm run format

# Gulp タスク
npm run check          # チェックと自動修正
npm run watch          # ファイル監視
npm run guard          # 品質ガード
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構成

```
app/typescript/
├── src/
│   ├── main.ts              # エントリーポイント
│   ├── game.ts              # ゲームメインループ
│   ├── stage.ts             # ステージ（ボード）管理
│   ├── player.ts            # プレイヤー（操作）管理
│   ├── score.ts             # スコア管理
│   ├── config.ts            # ゲーム設定
│   ├── puyoimage.ts         # ぷよ画像管理
│   ├── *.test.ts            # テストファイル
├── public/                  # 静的アセット
├── dist/                    # ビルド出力
├── tsconfig.json            # TypeScript 設定
├── vite.config.ts           # Vite 設定
└── package.json             # npm 設定
```

#### ゲーム仕様

- **ボードサイズ**: 8×12 マス（幅 8、高さ 12）
- **ぷよの色**: 5 色（赤、緑、青、黄、紫）
- **消去ルール**: 同色 4 つ以上の接続で消去
- **連鎖システム**: 消去後の落下により新たな接続が形成される
- **スコアリング**: 基本スコア + 連鎖ボーナス + 全消しボーナス

#### 操作方法

- `←` `→` : 左右移動
- `↓` : 高速落下
- `↑` : 回転
- `スペース` : ハードドロップ
- `R` : リスタート

#### 技術スタック

- **TypeScript**: 型安全な JavaScript
- **Vite**: 高速ビルドツール
- **Vitest**: テストフレームワーク
- **ESLint + Prettier**: コード品質管理
- **Gulp**: タスクランナー

#### 開発プロセス

このプロジェクトは TDD に基づいて開発されました：

1. Stage（ステージ管理）の実装
2. Player（操作管理）の実装
3. Game（ゲームループ）の実装
4. 消去判定と連鎖システムの実装
5. UI とスコア表示の実装

#### アーキテクチャ

オブジェクト指向パターンに従った実装：

- **クラスベース設計**: Game、Stage、Player、Score の責務分離
- **ゲームモード管理**: 状態マシンパターン
- **型安全性**: TypeScript の静的型チェック
- **テスタビリティ**: 各クラスが独立してテスト可能

#### ゲームモード

```typescript
type GameMode =
  | 'start'      // ゲーム開始
  | 'checkFall'  // 落下チェック
  | 'fall'       // 落下中
  | 'checkErase' // 消去チェック
  | 'erasing'    // 消去中
  | 'newPuyo'    // 新しいぷよ生成
  | 'playing'    // プレイ中
  | 'gameOver'   // ゲームオーバー
```

**[⬆ back to top](#構成)**

## 参照

- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Vitest](https://vitest.dev/)
