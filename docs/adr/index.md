# アーキテクチャ決定記録（ADR）

このディレクトリには、プロジェクトのアーキテクチャに関する重要な決定を記録しています。

## ADR一覧

- [ADR-0001: TypeScriptの採用](./0001-adopt-typescript.md)
- [ADR-0002: Vitestの採用](./0002-adopt-vitest.md)
- [ADR-0003: Canvas APIの採用](./0003-adopt-canvas-api.md)
- [ADR-0004: テスト駆動開発アプローチの採用](./0004-adopt-tdd-approach.md)
- [ADR-0005: GitHub Actionsの採用](./0005-adopt-github-actions.md)
- [ADR-0006: Vercelの採用](./0006-adopt-vercel.md)

## ADRとは

アーキテクチャ決定記録（Architecture Decision Record, ADR）は、プロジェクトのアーキテクチャに関する重要な決定を文書化したものです。

各ADRには以下の情報が含まれます：
- **ステータス**: 提案中、承認済み、却下、置き換え済みなど
- **コンテキスト**: 決定が必要となった背景や状況
- **決定**: 実際に下された決定
- **理由**: その決定を選択した理由
- **結果**: 決定による良い結果と悪い結果