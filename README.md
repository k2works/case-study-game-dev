# ゲーム開発のケーススタディ

[![codecov](https://codecov.io/gh/k2works/case-study-game-dev/branch/case-3/graph/badge.svg?token=PXJYRHMUWO)](https://codecov.io/gh/k2works/case-study-game-dev)

## 概要

AI プログラミング学習の一環として、ゲーム開発を題材にしたケーススタディプロジェクトです。

### 目的

- AIを活用したプログラミング手法の習得
- ゲーム開発における設計・実装・運用の実践
- ドキュメント駆動開発の体験

### 前提

| ソフトウェア | バージョン   | 備考 |
| :----------- |:--------| :--- |
| Docker       | 最新     | 開発環境の構築に必要 |
| Docker Compose | 最新   | 複数コンテナの管理に必要 |
| Git          | 最新     | バージョン管理に必要 |
| Node.js      | 最新     | Gulpタスクの実行に必要 |
| npm          | 最新     | パッケージ管理に必要 |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### 構築

#### Quick Start

```bash
# リポジトリのクローン
git clone https://github.com/k2works/ai-programing-exercise.git
cd case-study-game-dev

# 依存関係のインストール
npm install

# ドキュメントサーバーの起動
npm run docs:serve
```

ドキュメントは http://localhost:8000 でアクセス可能です。

#### アプリケーション起動

```bash
# アプリケーションディレクトリに移動
cd app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

アプリケーションは http://localhost:5173 でアクセス可能です。

詳細な手順は [セットアップドキュメント](./docs/operation/セットアップ.md) を参照してください。

**[⬆ back to top](#構成)**

### 配置

ドキュメントのビルドとデプロイ：

```bash
# ドキュメントのビルド
npm run docs:build

# 静的ファイルは site/ ディレクトリに生成されます
```

**[⬆ back to top](#構成)**

### 運用

プロジェクトの運用に関する情報は [運用ドキュメント](./docs/operation/) を参照してください。

利用可能なコマンド：

| コマンド | 説明 |
| :------- | :--- |
| `npm run journal` | 開発日誌の生成 |
| `npm run docs:serve` | ドキュメントサーバーの起動 |
| `npm run docs:stop` | ドキュメントサーバーの停止 |
| `npm run docs:build` | ドキュメントのビルド |

#### アプリケーション運用

アプリケーションの品質管理：

```bash
cd app

# 全品質チェック実行
npm run check

# CI/CDパイプライン
# GitHub Actionsで自動実行：
# - フォーマット検証
# - リンター実行  
# - テスト実行
# - ビルド確認
```

**[⬆ back to top](#構成)**

### 開発

開発に関する詳細は以下のドキュメントを参照してください：

- [まずこれを読もうリスト](./docs/index.md) - プロジェクト全体の理解に必要なドキュメント
- [開発ドキュメント](./docs/development/) - 開発の具体的な手順やガイドライン
- [要件定義](./docs/requirements/) - システムの要件とユーザーストーリー
- [アーキテクチャ決定ログ](./docs/adr/) - 重要な技術的決定の記録

#### アプリケーション開発

```bash
cd app

# テスト駆動開発サイクル
npm run test:watch    # テストウォッチモード
npm run dev          # 開発サーバー起動

# 品質管理
npm run format       # コードフォーマット
npm run lint         # リント実行
npm run test:coverage # カバレッジ付きテスト
```

技術スタック：
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **テスティング**: Vitest + React Testing Library
- **デプロイ**: Vercel

詳細は [アプリケーション README](./app/README.md) を参照してください。

**[⬆ back to top](#構成)**

## 参照

- [プロジェクトドキュメント](./docs/)
- [開発日誌](./docs/journal/)
- [GitHub Repository](https://github.com/k2works/ai-programing-exercise)