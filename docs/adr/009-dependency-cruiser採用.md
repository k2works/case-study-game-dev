# ADR-009: dependency-cruiser採用によるアーキテクチャルール検証

## ステータス

承認済み

## コンテキスト

ヘキサゴナルアーキテクチャを採用するにあたり、設計意図に反する依存関係を防ぐ仕組みが必要である。特に以下の問題を解決する必要がある：

1. **レイヤー間の不正な依存関係**
   - ドメイン層からインフラ層への依存
   - アプリケーション層からプレゼンテーション層への依存

2. **循環依存の防止**
   - モジュール間の循環参照による保守性の低下

3. **アーキテクチャ違反の早期検出**
   - レビュー時ではなく開発時の自動検証

4. **チーム開発での一貫性確保**
   - 複数開発者による設計原則の統一

## 決定

**dependency-cruiserを採用し、アーキテクチャルールの自動検証を実装する。**

```javascript
// 主要なルール設定
- ドメイン層の依存制限（プレゼンテーション、インフラ、アプリケーション層への依存禁止）
- アプリケーション層の依存制限（プレゼンテーション層への依存禁止）
- 循環依存の禁止
- テストファイルへの本番コード依存禁止
- 未使用モジュール（orphan）の検出
```

## 選択肢の比較

### dependency-cruiser
- **メリット:**
  - TypeScript完全対応
  - 詳細な依存関係ルール設定
  - CI/CD統合が容易
  - グラフ可視化機能
  - ESLintとの共存可能

- **デメリット:**
  - 設定が複雑
  - 実行時間がやや長い

### ESLint + eslint-plugin-import
- **メリット:**
  - 既存のESLintと統合
  - 軽量

- **デメリット:**
  - アーキテクチャルール表現に限界
  - 複雑な依存関係検証には不十分

### Madge
- **メリット:**
  - シンプルな設定
  - 循環依存検出に特化

- **デメリット:**
  - TypeScript対応が限定的
  - 詳細なルール設定不可

## 実装内容

### 1. 設定ファイル

```javascript
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    // ヘキサゴナルアーキテクチャルール
    {
      name: 'no-domain-to-presentation',
      comment: 'ドメイン層はプレゼンテーション層に依存してはいけない',
      from: { path: '^src/domain' },
      to: { path: '^src/presentation' }
    },
    // 循環依存禁止
    {
      name: 'no-circular',
      comment: '循環依存は許可されない',
      from: {},
      to: { circular: true }
    }
  ]
}
```

### 2. NPMスクリプト統合

```json
{
  "scripts": {
    "depcruise": "depcruise src --config .dependency-cruiser.cjs",
    "depcruise:graph": "depcruise src --config .dependency-cruiser.cjs --output-type dot | dot -T svg > dependency-graph.svg"
  }
}
```

### 3. CI/CD統合（将来実装）

```yaml
# GitHub Actions
- name: Architecture validation
  run: npm run depcruise
```

## 期待される効果

### ポジティブな効果

1. **設計品質の向上**
   - アーキテクチャ違反の自動検出
   - 循環依存の早期発見

2. **保守性の向上**
   - 依存関係の可視化
   - リファクタリング時のリスク軽減

3. **チーム開発の効率化**
   - 設計レビューの自動化
   - 一貫した設計原則の適用

4. **技術的負債の削減**
   - 不正な依存関係の蓄積防止
   - アーキテクチャの劣化防止

### ネガティブな効果

1. **開発速度への一時的影響**
   - 初期設定の学習コスト
   - ビルド時間の増加（軽微）

2. **誤検知の可能性**
   - 設定調整が必要な場合がある
   - 例外ルールの管理が必要

## 測定指標

### 成功指標
- アーキテクチャ違反件数: 0件維持
- 循環依存件数: 0件維持
- 未使用モジュール: 最小限に抑制

### 監視方法
- CI/CDでの自動チェック
- 週次での依存関係グラフレビュー
- コードレビュー時の確認

## 実装タイムライン

1. **Phase 2（完了済み）**
   - dependency-cruiser導入
   - 基本ルール設定
   - NPMスクリプト設定

2. **Phase 3**
   - CI/CD統合
   - 詳細ルール調整
   - チーム向けドキュメント作成

## 参照

- [dependency-cruiser公式ドキュメント](https://github.com/sverweij/dependency-cruiser)
- [ヘキサゴナルアーキテクチャ設計](../design/アーキテクチャ設計.md)
- [サイクロマティック複雑度制限 ADR-008](./008-サイクロマティック複雑度制限.md)