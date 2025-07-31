# ぷよぷよゲーム

TypeScriptとテスト駆動開発で実装するぷよぷよゲーム

## 概要

このプロジェクトは、よいソフトウェア開発の原則に従って、段階的にぷよぷよゲームを実装します。

## 開発環境

- **言語**: TypeScript
- **テストフレームワーク**: Vitest
- **ビルドツール**: Vite
- **静的解析**: ESLint + Prettier
- **タスクランナー**: Gulp
- **CI/CD**: GitHub Actions

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm run test

# ビルド
npm run build
```

## 開発コマンド

| コマンド                | 説明                           |
| ----------------------- | ------------------------------ |
| `npm run dev`           | 開発サーバーを起動             |
| `npm run build`         | プロダクションビルド           |
| `npm run test`          | テストを実行                   |
| `npm run test:watch`    | テストを監視モードで実行       |
| `npm run test:coverage` | カバレッジ付きでテスト実行     |
| `npm run lint`          | ESLintによる静的解析           |
| `npm run lint:fix`      | ESLintによる自動修正           |
| `npm run format`        | Prettierによるフォーマット     |
| `npm run format:check`  | フォーマットチェック           |
| `npm run guard`         | ファイル変更を監視して自動実行 |

## プロジェクト構造

```
src/
├── domain/           # ドメイン層
│   ├── model/       # エンティティ・値オブジェクト
│   └── type/        # タイプ・戦略
├── application/      # アプリケーション層
├── infrastructure/   # インフラ層
│   ├── input/       # 入力処理
│   └── rendering/   # 描画処理
└── test/            # テスト
    ├── domain/
    ├── application/
    └── integration/
```

## デプロイ

このアプリケーションはVercelにデプロイされます。

### Vercel設定

以下の環境変数をGitHubリポジトリのSecretsに設定してください：

- `VERCEL_TOKEN`: Vercelアクセストークン
- `ORG_ID`: Vercel組織ID
- `PROJECT_ID`: VercelプロジェクトID

### 手動デプロイ

```bash
# Vercel CLIのインストール
npm i -g vercel

# デプロイ
vercel --prod
```

## 開発プロセス

1. **テスト駆動開発**: Red-Green-Refactorサイクル
2. **イテレーション開発**: 機能を段階的に実装
3. **継続的インテグレーション**: GitHubActionsによる自動化
4. **継続的デプロイ**: Vercelへの自動デプロイ

## 実装予定機能

### イテレーション1: ゲーム開始

- ゲームの初期化処理
- 画面表示
- ぷよ生成とゲームループ

### イテレーション2: ぷよの移動

- 自由落下
- 左右移動
- 着地判定

### イテレーション3: ぷよの回転

- 回転処理
- 壁キック処理

### イテレーション4: 高速落下

- 高速落下処理

### イテレーション5: ぷよ消去

- 4つ以上の連結判定
- 消去処理

### イテレーション6: 連鎖反応

- 連鎖判定とカウント
- スコア表示

### イテレーション7: 全消しボーナス

- 全消し判定と演出

### イテレーション8: ゲームオーバー

- ゲームオーバー判定
- リスタート機能

## ライセンス

ISC
