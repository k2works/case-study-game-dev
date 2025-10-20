# ぷよぷよゲーム

## 概要

### 目的

Test-Driven Development (TDD) の学習を目的として開発されたクロスプラットフォーム対応のパズルゲームです。
すべての機能がテストを先行して実装され、Red-Green-Refactor サイクルに従って開発されています。

### 前提

| ソフトウェア | バージョン | 備考                     |
| :----------- | :--------- | :----------------------- |
| Node.js      | 18以上     | 推奨: 20.x LTS           |
| npm          | 9以上      | または yarn              |
| Expo CLI     | ~54.0.13   | グローバルインストール不要 |

### 主な機能

- **ぷよの落下と操作**: 2つ1組のぷよペアが上から落下し、左右移動・回転・ドロップ操作が可能
- **消去システム**: 同じ色のぷよが4つ以上つながると消去
- **連鎖システム**: 消去後の落下で新たな消去パターンが発生すると連鎖
- **スコアシステム**: 連鎖数に応じたスコア倍率
- **ゲームオーバー**: ぷよが画面上部に到達するとゲームオーバー
- **リスタート機能**: ゲームオーバー後に再度プレイ可能

### 技術スタック

| 技術                | バージョン | 用途                     |
| :------------------ | :--------- | :----------------------- |
| React Native        | 0.81.4     | モバイルアプリフレームワーク |
| Expo                | ~54.0.13   | 開発・ビルドプラットフォーム |
| React               | 19.1.0     | UI ライブラリ            |
| TypeScript          | ~5.9.2     | 型安全性                 |
| Jest                | ^30.2.0    | テスティングフレームワーク |
| ESLint + Prettier   | latest     | コード品質管理           |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

```bash
# 依存関係をインストール
npm install

# Web版を起動（開発モード）
npm run web

# テストを実行
npm test
```

**[⬆ back to top](#構成)**

### 構築

#### 初期セットアップ

```bash
# 依存関係をインストール
npm install
```

#### プロジェクト構造

```
puyo-puyo-game/
├── src/
│   ├── components/          # React コンポーネント
│   │   ├── GameControls.tsx # ゲームコントロール UI
│   │   ├── GameScreen.tsx   # メインゲーム画面
│   │   ├── Puyo.tsx         # ぷよコンポーネント
│   │   └── Stage.tsx        # ステージコンポーネント
│   ├── hooks/               # カスタムフック
│   │   ├── useGameState.ts  # ゲーム状態管理フック
│   │   └── __tests__/       # フックのテスト
│   ├── models/              # モデル定義
│   │   ├── Config.ts        # ゲーム設定
│   │   └── PuyoColor.ts     # ぷよの色定義
│   └── utils/               # ユーティリティ関数
│       ├── erasePuyo.ts     # 消去・連鎖ロジック
│       └── __tests__/       # ユーティリティのテスト
├── assets/                  # アセット（アイコン、画像等）
├── app.json                 # Expo 設定
├── eas.json                 # EAS Build 設定
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

**[⬆ back to top](#構成)**

### 配置

#### Web版のビルドとデプロイ

##### ビルド

```bash
# Web版をエクスポート
npx expo export --platform web

# ビルド成果物を確認
ls dist/
```

##### デプロイ

**Netlify へのデプロイ**

```bash
# Netlify CLI でデプロイ
npx netlify deploy --prod --dir=dist
```

**Vercel へのデプロイ**

```bash
# Vercel CLI でデプロイ
npx vercel --prod
```

**GitHub Pages へのデプロイ**

```bash
# dist フォルダを gh-pages ブランチにプッシュ
git subtree push --prefix dist origin gh-pages
```

#### Android/iOS版のビルド

##### 前提条件

```bash
# EAS CLI をグローバルインストール
npm install -g eas-cli

# Expo にログイン
eas login
```

##### Android APK ビルド（プレビュー版）

```bash
# プレビュー用 APK をビルド
eas build --platform android --profile preview
```

##### Android AAB ビルド（本番版）

```bash
# 本番用 AAB をビルド（Google Play Store 用）
eas build --platform android --profile production
```

##### iOS IPA ビルド

```bash
# iOS 本番用ビルド（Apple Developer アカウント必要）
eas build --platform ios --profile production
```

**[⬆ back to top](#構成)**

### 運用

#### 動作確認

```bash
# ローカルサーバーで Web 版を起動
npx serve dist -l 3000

# ブラウザで http://localhost:3000 にアクセス
```

#### テスト実行

```bash
# 全テストを実行
npm test

# ウォッチモードで実行
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage
```

#### テスト統計

- **総テスト数**: 48件
- **成功率**: 100%
- **主要カバレッジ**: ゲームロジック、消去判定、連鎖処理

**[⬆ back to top](#構成)**

### 開発

#### 開発サーバーの起動

```bash
# iOS シミュレータで起動
npm run ios

# Android エミュレータで起動
npm run android

# Web ブラウザで起動
npm run web
```

#### コード品質チェック

```bash
# ESLint でコードをチェック
npm run lint

# ESLint で自動修正
npm run lint:fix

# Prettier でフォーマット
npm run format

# フォーマットチェック
npm run format:check

# 全てのチェックを実行（lint + format + test）
npm run check

# 依存関係のチェック
npm run check:deps

# セキュリティ監査
npm run check:audit

# 全てのチェックを実行（品質・依存関係・セキュリティ）
npm run check:all
```

#### TDD サイクル

このプロジェクトは Test-Driven Development (TDD) で開発されています。

1. **Red（失敗）**: 最もシンプルな失敗するテストを書く
2. **Green（成功）**: テストを通す最小限のコードを実装
3. **Refactor（改善）**: テストが通った後でのみリファクタリング

**テスト実行例**

```bash
# 全テストを実行
npm test

# 特定のテストファイルを実行
npm test -- useGameState.test.ts

# ウォッチモードで実行（開発中に便利）
npm run test:watch
```

**[⬆ back to top](#構成)**

## 参照

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [RELEASE_NOTES.md](./RELEASE_NOTES.md) - リリースノート
