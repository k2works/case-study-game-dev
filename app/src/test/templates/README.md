# テストテンプレート集

このディレクトリには、様々な種類のテストを効率的に作成するためのテンプレートが含まれています。

## 📂 テンプレート一覧

### 1. domain.test.template.ts

**ドメインモデルテストテンプレート**

ドメインロジックやビジネスルールのテストに使用します。

- **使用場面:**
  - エンティティクラスのテスト
  - 値オブジェクトのテスト
  - ドメインサービスのテスト
  - ビジネスロジックの検証

- **主な機能:**
  - 3A（Arrange-Act-Assert）パターン
  - 正常系・異常系・境界値テスト
  - 状態遷移テスト
  - プロパティベーステスト

### 2. component.test.template.tsx

**Reactコンポーネントテストテンプレート**

UIコンポーネントの振る舞いとレンダリングのテストに使用します。

- **使用場面:**
  - プレゼンテーションコンポーネント
  - コンテナコンポーネント
  - フォームコンポーネント
  - 条件付きレンダリング

- **主な機能:**
  - レンダリングテスト
  - ユーザーインタラクション
  - 状態管理のテスト
  - 非同期処理のテスト
  - アクセシビリティテスト

### 3. hook.test.template.ts

**React Hooksテストテンプレート**

カスタムフックの動作テストに使用します。

- **使用場面:**
  - カスタムフック
  - 状態管理フック
  - 副作用フック
  - 非同期処理フック

- **主な機能:**
  - 初期状態のテスト
  - 状態更新のテスト
  - 副作用のテスト
  - タイマー処理のテスト
  - メモ化のテスト

### 4. integration.test.template.tsx

**統合テストテンプレート**

複数のコンポーネントやシステムの連携をテストします。

- **使用場面:**
  - エンドツーエンドシナリオ
  - コンポーネント間の連携
  - 外部APIとの統合
  - ユーザーフローの検証

- **主な機能:**
  - シナリオベーステスト
  - 複数コンポーネントの連携
  - 非同期フローのテスト
  - エラーリカバリーテスト

## 🚀 使い方

### 基本的な使用手順

1. **テンプレートを選択**

   ```bash
   # 例: ドメインモデルのテストを作成する場合
   cp src/test/templates/domain.test.template.ts src/domain/MyModel.test.ts
   ```

2. **プレースホルダーを置換**
   - `[ModelName]`, `[ComponentName]`, `[useHookName]`, `[FeatureName]`を実際の名前に置換
   - 不要なテストケースを削除
   - 必要なテストケースを追加

3. **インポートを調整**

   ```typescript
   // Before
   // import { [ModelName] } from './[ModelName]'

   // After
   import { User } from './User'
   ```

4. **テストケースを実装**

   ```typescript
   // Before
   it('期待される動作の説明', () => {
     // Arrange
     // const input = 'input'
     // ...
   })

   // After
   it('ユーザー名を正しく設定できる', () => {
     // Arrange
     const userName = 'John Doe'

     // Act
     const user = new User(userName)

     // Assert
     expect(user.name).toBe(userName)
   })
   ```

## 💡 ベストプラクティス

### テスト作成のガイドライン

1. **小さく始める**
   - 最初は仮実装から始める
   - 徐々に実装を一般化する（三角測量）

2. **明確な名前付け**
   - テストケース名は日本語でも可
   - 何をテストしているか明確に記述

3. **3Aパターンの徹底**

   ```typescript
   it('明確なテスト名', () => {
     // Arrange（準備）
     const input = prepareTestData()

     // Act（実行）
     const result = executeFunction(input)

     // Assert（検証）
     expect(result).toBe(expected)
   })
   ```

4. **act()警告の回避**

   ```typescript
   // React状態更新を含む操作は必ずact()でラップ
   await act(async () => {
     fireEvent.click(button)
   })
   ```

5. **適切なクリーンアップ**
   ```typescript
   afterEach(() => {
     vi.clearAllMocks()
     // タイマーのクリーンアップ
     act(() => {
       vi.runOnlyPendingTimers()
     })
   })
   ```

## 📊 テストカバレッジの目標

- **ドメインロジック:** 100%
- **コンポーネント:** 90%以上
- **統合テスト:** 主要なユーザーフローをカバー
- **E2Eテスト:** クリティカルパスをカバー

## 🔧 便利なユーティリティ

### テストデータビルダー

```typescript
// テスト用のデータを簡単に作成
const createTestUser = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
})
```

### カスタムマッチャー

```typescript
// 独自のアサーションを追加
expect.extend({
  toBeValidEmail(received) {
    const pass = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(received)
    return {
      pass,
      message: () => `expected ${received} to be a valid email`,
    }
  },
})
```

### モックヘルパー

```typescript
// APIモックの簡単な作成
const mockApi = (data, delay = 0) => {
  return vi
    .fn()
    .mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(data), delay))
    )
}
```

## 📚 参考資料

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [テスト駆動開発](https://www.amazon.co.jp/dp/4274217884)
- [Clean Code](https://www.amazon.co.jp/dp/4048860690)

## 🤝 コントリビューション

テンプレートの改善提案は歓迎します！
新しいパターンやベストプラクティスを見つけた場合は、テンプレートを更新してください。

---

_これらのテンプレートは継続的に改善されます。フィードバックをお寄せください。_
