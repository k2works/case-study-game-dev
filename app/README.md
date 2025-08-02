# ぷよぷよゲーム

## 概要

TypeScriptとViteを使用して開発されたぷよぷよゲームです。テスト駆動開発（TDD）によりクリーンで保守性の高いコードを実現しています。

### 目的

- AI プログラミング学習の一環としてのゲーム開発実践
- テスト駆動開発（TDD）の体験と習得
- モダンなWebフロントエンド技術の実践
- 継続的インテグレーション/継続的デプロイメント（CI/CD）の実装

### 前提

| ソフトウェア | バージョン   | 備考 |
| :----------- |:--------| :--- |
| Node.js      | 20.x, 22.x | アプリケーション実行に必要 |
| npm          | 最新     | パッケージ管理に必要 |
| TypeScript   | 5.8.x    | アプリケーション開発言語 |
| Vite         | 7.x      | ビルドツール |
| Vitest       | 3.x      | テスティングフレームワーク |

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

#### 開発環境セットアップ

```bash
# 依存関係のインストールと初期セットアップ
npm run setup

# 開発サーバーの起動（ファイル監視付き）
npm run dev

# テストの実行
npm run test

# テストの監視実行
npm run test:watch

# プロダクションビルド
npm run build

# プロダクションビルドのプレビュー
npm run preview
```

**[⬆ back to top](#構成)**

### 配置

#### ローカルビルド

```bash
# TypeScriptコンパイル + Viteビルド
npm run build

# 生成されたファイルは dist/ ディレクトリに出力されます
```

#### CI/CDデプロイ

GitHub Actionsによる自動デプロイが設定されています：

- プッシュ/プルリクエスト時の自動テスト実行
- case-2ブランチへのプッシュ時にVercelへ自動デプロイ
- Node.js 20.x, 22.x でのマトリックステスト

**[⬆ back to top](#構成)**

### 運用

#### 品質管理コマンド

| コマンド | 説明 |
| :------- | :--- |
| `npm run lint` | ESLintによるコード解析 |
| `npm run lint:fix` | ESLintによる自動修正 |
| `npm run format` | Prettierによるコードフォーマット |
| `npm run format:check` | フォーマットチェック |
| `npm run test:coverage` | テストカバレッジの確認 |
| `npm run check` | 総合品質チェック（lint + format + test） |

#### Gulpタスク

| コマンド | 説明 |
| :------- | :--- |
| `npm run gulp` | Gulpタスクランナー起動 |
| `npm run watch` | ファイル監視 |
| `npm run guard` | 自動品質チェック（ファイル変更時） |

#### 技術スタック

- **フロントエンド**: TypeScript, Vite, HTML5 Canvas
- **テスト**: Vitest, jsdom
- **品質管理**: ESLint, Prettier, c8 (コードカバレッジ)
- **タスクランナー**: Gulp
- **CI/CD**: GitHub Actions, Vercel

**[⬆ back to top](#構成)**

### 開発

#### ゲーム機能（予定）

プレイヤーは以下の操作でぷよぷよを楽しむことができます：

- **基本操作**
  - 左右矢印キー: ぷよの移動
  - 上矢印キー: ぷよの回転
  - 下矢印キー: ぷよの高速落下

- **ゲームルール**
  - 同じ色のぷよを4つ以上つなげると消去
  - 連鎖反応による高得点獲得
  - 全消しボーナス
  - ゲームオーバー判定とリスタート機能

#### 開発フロー

1. **テスト駆動開発（TDD）**
   ```bash
   # テスト作成 → 実装 → リファクタリングのサイクル
   npm run test:watch  # テスト監視モード
   ```

2. **品質チェック**
   ```bash
   # コミット前の品質チェック
   npm run check
   ```

3. **自動品質管理**
   ```bash
   # ファイル変更時の自動チェック
   npm run guard
   ```

#### アーキテクチャ

```
src/
├── Game.ts          # ゲームコアロジック
├── Game.test.ts     # ゲームのテスト
├── main.ts          # エントリーポイント
├── style.css        # スタイル
└── vite-env.d.ts    # 型定義
```

#### コーディング規約

- **ESLint**: TypeScript推奨ルール + 循環的複雑度7以下
- **Prettier**: 統一されたコードフォーマット
- **型安全**: TypeScript strictモード

**[⬆ back to top](#構成)**

## 参照

- [プロジェクトドキュメント](../docs/)
- [要件定義](../docs/requirements/要件.md)
- [GitHub Repository](https://github.com/k2works/ai-programing-exercise)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)
- [Vite公式ドキュメント](https://vitejs.dev/)
- [Vitest公式ドキュメント](https://vitest.dev/)