# Zod スキーマ定義

このディレクトリには、アプリケーションで使用するデータ構造の Zod スキーマ定義が含まれています。

## Zod とは

Zod は TypeScript 向けのスキーマバリデーションライブラリです。以下の特徴があります：

- **型安全性**: スキーマから TypeScript 型を自動生成
- **ランタイムバリデーション**: 実行時にデータの妥当性を検証
- **軽量**: 依存関係なしの小さなライブラリ

## 使用例

### 基本的なスキーマ定義

```typescript
import { z } from 'zod'

// スキーマ定義
const UserSchema = z.object({
  name: z.string(),
  age: z.number().min(0).max(120),
  email: z.string().email()
})

// TypeScript 型を自動生成
type User = z.infer<typeof UserSchema>

// バリデーション
const user = UserSchema.parse({ name: 'Alice', age: 25, email: 'alice@example.com' })
```

### ゲーム開発での活用例

```typescript
import { z } from 'zod'

// ぷよの色定義
export const PuyoColorSchema = z.enum(['red', 'blue', 'green', 'yellow', 'purple'])
export type PuyoColor = z.infer<typeof PuyoColorSchema>

// ゲーム設定
export const GameConfigSchema = z.object({
  cellSize: z.number().positive(),
  cols: z.number().int().positive(),
  rows: z.number().int().positive()
})
export type GameConfig = z.infer<typeof GameConfigSchema>

// セーブデータ
export const SaveDataSchema = z.object({
  score: z.number().int().nonnegative(),
  level: z.number().int().positive(),
  timestamp: z.string().datetime()
})
export type SaveData = z.infer<typeof SaveDataSchema>
```

## ディレクトリ構造

```
schemas/
├── README.md          # このファイル
├── example.test.ts    # Zod の動作確認テスト
└── game/              # ゲーム関連のスキーマ（今後追加予定）
```

## ベストプラクティス

1. **スキーマと型を一緒に定義**: `z.infer` を使って TypeScript 型を生成
2. **厳密なバリデーション**: 可能な限り具体的な制約を定義
3. **エラーハンドリング**: `parse()` ではなく `safeParse()` を使用して安全に処理
4. **再利用**: 共通のスキーマは別ファイルに分離して再利用

## 参考リンク

- [Zod 公式ドキュメント](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
