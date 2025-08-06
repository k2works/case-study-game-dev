# ぷよぷよゲーム

## 概要

テスト駆動開発の手法を用いて構築したぷよぷよパズルゲームです。
React + TypeScript + Viteの技術スタックを使用し、現代的なWeb開発のベストプラクティスを実践しています。

### 目的

- テスト駆動開発（TDD）の実践学習
- モダンなフロントエンド技術スタックの習得
- ゲーム開発を通じたドメイン駆動設計の理解
- CI/CDパイプラインの構築経験

### 前提

| ソフトウェア | バージョン | 備考           |
| :----------- | :--------- | :------------- |
| Node.js      | 20以上     | ランタイム環境 |
| npm          | 最新       | パッケージ管理 |
| Git          | 最新       | バージョン管理 |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### 構築

#### Quick Start

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:5173 にアクセス
```

#### プロジェクトセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd case-study-game-dev/app

# 依存関係のインストール
npm install

# 開発環境の確認
npm run check
```

**[⬆ back to top](#構成)**

### 配置

#### 本番ビルド

```bash
# 本番用ビルド
npm run build

# プレビュー
npm run preview
```

#### Vercelデプロイ

本プロジェクトはVercelにデプロイ設定済みです。

1. Vercelアカウントにプロジェクトをインポート
2. ビルド設定: `npm run build`
3. 出力ディレクトリ: `dist`
4. 自動デプロイが有効化されます

**[⬆ back to top](#構成)**

### 運用

#### CI/CDパイプライン

GitHub Actionsを使用して以下を自動化：

- コードフォーマット検証
- リンター実行
- テスト実行
- ビルド確認
- カバレッジレポート生成

#### 品質管理

```bash
# 全品質チェック実行
npm run check

# E2Eテストを含む完全チェック実行
npm run check:full

# 個別実行
npm run format:check  # フォーマット確認
npm run lint          # リンター実行
npm run test          # テスト実行
npm run build         # ビルド確認
```

**[⬆ back to top](#構成)**

### 開発

#### 開発環境

```bash
# 開発サーバー起動（ホットリロード有効）
npm run dev

# テストをウォッチモードで実行
npm run test:watch

# カバレッジ付きテスト実行
npm run test:coverage

# E2Eテスト実行
npm run test:e2e

# E2EテストをUIモードで実行
npm run test:e2e:ui

# E2Eテストレポート表示
npm run test:e2e:report
```

#### 技術スタック

- **フレームワーク**: React 18
- **言語**: TypeScript
- **ビルドツール**: Vite
- **テスティング**: Vitest + React Testing Library + Playwright
- **リンター**: ESLint
- **フォーマッター**: Prettier
- **デプロイ**: Vercel

#### アーキテクチャ

```
src/
├── components/     # Reactコンポーネント
├── domain/        # ドメインロジック
├── infrastructure/ # 外部システムとの連携
├── application/   # アプリケーションサービス
└── test/          # テスト設定とユーティリティ
```

#### 開発フロー

1. **Red**: 失敗するテストを作成
2. **Green**: テストを通す最小実装
3. **Refactor**: コードをリファクタリング
4. **Commit**: 機能単位でコミット

#### コミット規約

Angularスタイルのコミットメッセージを使用：

- `feat:` 新機能追加
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` フォーマット変更
- `refactor:` リファクタリング
- `test:` テストコード追加・修正
- `chore:` ビルド・設定変更

**[⬆ back to top](#構成)**

## 参照

- [要件定義](../docs/requirements/要件.md)
- [アーキテクチャ設計](../docs/design/アーキテクチャ.md)
- [テスト戦略](../docs/requirements/テスト戦略.md)
- [ADR (Architecture Decision Records)](../docs/adr/)
