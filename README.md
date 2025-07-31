# ゲーム開発のケーススタディ

## 概要

AI プログラミング学習の一環として、ゲーム開発を題材にしたケーススタディプロジェクトです。

本プロジェクトでは、よいソフトウェアの原則に従ってぷよぷよゲームを段階的に開発します。

### 目的

- AIを活用したプログラミング手法の習得
- ゲーム開発における設計・実装・運用の実践
- ドキュメント駆動開発の体験
- テスト駆動開発とアジャイル開発の実践

### 前提

| ソフトウェア | バージョン   | 備考 |
| :----------- |:--------| :--- |
| Docker       | 最新     | 開発環境の構築に必要 |
| Docker Compose | 最新   | 複数コンテナの管理に必要 |
| Git          | 最新     | バージョン管理に必要 |
| Node.js      | 最新     | Gulpタスクの実行に必要 |
| npm          | 最新     | パッケージ管理に必要 |

## ぷよぷよゲーム

### 概要

TypeScriptとテスト駆動開発で実装するぷよぷよゲーム（`app/`ディレクトリ）

### 技術スタック

- **言語**: TypeScript
- **テスト**: Vitest + TDD
- **ビルド**: Vite
- **品質管理**: ESLint + Prettier
- **CI/CD**: GitHub Actions + Vercel

### クイックスタート

```bash
# ゲームアプリケーションディレクトリに移動
cd app

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ゲームは http://localhost:3000 でアクセス可能です。

詳細は [アプリケーションREADME](./app/README.md) を参照してください。

## 構成

- [ぷよぷよゲーム](#ぷよぷよゲーム)
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

**[⬆ back to top](#構成)**

### 開発

開発に関する詳細は以下のドキュメントを参照してください：

- [まずこれを読もうリスト](./docs/index.md) - プロジェクト全体の理解に必要なドキュメント
- [開発ドキュメント](./docs/development/) - 開発の具体的な手順やガイドライン
- [要件定義](./docs/requirements/) - システムの要件とユーザーストーリー
- [アーキテクチャ決定ログ](./docs/adr/) - 重要な技術的決定の記録

**[⬆ back to top](#構成)**

## 参照

- [プロジェクトドキュメント](./docs/)
- [開発日誌](./docs/journal/)
- [GitHub Repository](https://github.com/k2works/ai-programing-exercise)