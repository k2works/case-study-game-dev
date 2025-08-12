# ぷよぷよゲーム開発プロジェクト

🎮 **[デモプレイ](https://case-study-game-dev-5ltf-4266yz8xe-k2works-projects.vercel.app/)**

## 概要

このプロジェクトは、Clean Architectureとテスト駆動開発（TDD）の実践例として、TypeScript + Reactを使用してぷよぷよゲームを実装したケーススタディです。

## プロジェクトの目的

- **教育的価値**: よいソフトウェア開発の実践例を示す
- **技術的探求**: Clean Architecture、DDD、TDDの統合実装
- **品質基準**: 91.3点/100点（A評価）の高品質達成

## まずこれを読もうリスト

### 🎯 プロジェクト理解

- [開発日誌](./journal) - **New!** プロジェクトの全体的な流れと主要マイルストーンを時系列で把握
- [仕様定義](./requirements/仕様.md) - ユーザーストーリーとユースケースから要件を理解
- [リリース計画](./requirements/リリース計画.md) - 段階的リリース戦略と実績
- [評価レポート](./report/application-evaluation-report.md) - 総合品質評価（91.3点）と各品質指標の詳細

### 🏗️ アーキテクチャ・設計

- [アーキテクチャ設計](./design/アーキテクチャ.md) - Clean Architecture準拠の4層構造設計
- [実装詳細](./design/実装.md) - **New!** 各層の具体的な実装とコード例
- [データモデル](./design/データモデル.md) - **Updated!** ドメインモデルとデータ構造の詳細
- [ドメインモデル](./design/ドメインモデル.md) - DDD原則に基づくビジネスロジック設計
- [依存性注入設計](./design/依存性注入設計.md) - DIコンテナと依存関係管理

### 📝 技術的決定

- [アーキテクチャ決定記録（ADR）](./adr) - 重要な技術的決定の記録と根拠
- [技術スタック](./requirements/技術スタック.md) - 選定された技術とツールの詳細
- [テスト戦略](./requirements/テスト戦略.md) - 3層テスト戦略とTDD実践

### 🚀 開発・運用

- [開発ドキュメント](./development) - イテレーション完了報告と振り返り
- [運用ドキュメント](./operation) - セットアップ、CI/CD、デプロイ手順

## 技術スタック

### フロントエンド
- **TypeScript 5.5** - 型安全性とIDEサポート
- **React 18.3** - コンポーネントベースUI
- **Vite 5.3** - 高速ビルドツール

### テスティング
- **Vitest 2.0** - 単体・統合テスト
- **React Testing Library** - コンポーネントテスト
- **Playwright 1.45** - E2Eテスト

### 品質管理
- **ESLint** - 静的コード解析
- **Prettier** - コードフォーマット
- **dependency-cruiser** - アーキテクチャルール検証

## プロジェクト構造

```
case-study-game-dev/
├── app/                    # アプリケーション本体
│   ├── src/
│   │   ├── components/    # プレゼンテーション層
│   │   ├── application/   # アプリケーション層
│   │   ├── domain/        # ドメイン層
│   │   ├── services/      # サービス層
│   │   └── infrastructure/# インフラストラクチャ層
│   └── tests/             # テストコード
├── docs/                  # ドキュメント
│   ├── requirements/      # 要件定義
│   ├── design/           # 設計ドキュメント
│   ├── development/      # 開発記録
│   ├── operation/        # 運用手順
│   ├── adr/             # アーキテクチャ決定記録
│   ├── journal/         # 開発日誌
│   └── report/          # 評価レポート
└── README.md            # プロジェクト概要
```

## 主要な成果

### 品質指標

| 項目 | スコア | 評価 |
|------|--------|------|
| **総合評価** | 91.3/100 | A |
| テスト品質 | 95/100 | A+ |
| アーキテクチャ品質 | 98/100 | A+ |
| コード品質 | 92/100 | A |
| パフォーマンス | 88/100 | B+ |
| アクセシビリティ | 91/100 | A |

### 技術的達成

- **依存関係違反**: 0件（dependency-cruiser検証済み）
- **テストカバレッジ**: 75.12%（345テストケース）
- **型安全性**: TypeScript strict mode 100%準拠
- **Clean Architecture**: 完全準拠、4層分離実装

## クイックスタート

```bash
# リポジトリクローン
git clone https://github.com/your-org/case-study-game-dev.git
cd case-study-game-dev

# 依存関係インストール
cd app
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm run test
npm run test:e2e

# ビルド
npm run build
```

詳細な手順は[セットアップガイド](./operation/セットアップ.md)を参照してください。

## 参考資料

- [よいソフトウェアとは](./reference/よいソフトウェアとは.md)
- [開発ガイド](./reference/開発ガイド.md)
- [テスト駆動開発から始めるTypeScript入門](./reference/テスト駆動開発から始めるTypeScript入門1.md)

---

このプロジェクトは、実践的なソフトウェア開発プロセスの学習と、よいソフトウェア開発文化の確立を目的として実施されました。
