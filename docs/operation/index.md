# 運用ドキュメント

## 概要

このセクションでは、ゲーム開発のケーススタディプロジェクトの運用に関する情報を提供します。

## ドキュメント一覧

- [セットアップ](./セットアップ.md) - 開発環境のセットアップ手順
- [CI/CD設定](./ci-cd設定.md) - GitHub Actions + Vercelを使用したCI/CDパイプライン設定手順
- [MkDocs GitHub Actions設定](./MkDocs_GitHub_Actions設定.md) - GitHub ActionsでMkDocsを自動化する手順

## 運用関連情報

### 開発環境

プロジェクトの開発環境は以下の技術スタックで構成されています：

- **ドキュメンテーション**: MkDocs + Material テーマ
- **アプリケーション**: TypeScript + Vite + Vitest
- **コンテナ化**: Docker + Docker Compose
- **タスクランナー**: Gulp
- **図表**: Mermaid + PlantUML
- **CI/CD**: GitHub Actions + Vercel/GitHub Pages

### 運用フロー

1. **環境構築**: [セットアップ](./セットアップ.md)を参照
2. **開発**: アプリケーション開発・ドキュメント編集
3. **確認**: ローカル環境でのテスト・プレビュー
4. **CI/CD設定**: 
   - [CI/CD設定](./ci-cd設定.md) - アプリケーション用
   - [MkDocs GitHub Actions設定](./MkDocs_GitHub_Actions設定.md) - ドキュメント用
5. **デプロイ**: GitHub Actionsによる自動デプロイ

### 関連リンク

- [開発ドキュメント](../development/)
- [要件定義](../requirements/)
- [アーキテクチャ決定ログ](../adr/)