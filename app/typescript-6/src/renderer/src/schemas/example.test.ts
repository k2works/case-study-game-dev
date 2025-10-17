import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe('Zod スキーマバリデーション', () => {
  it('基本的な文字列スキーマが動作する', () => {
    const schema = z.string()

    expect(schema.parse('hello')).toBe('hello')
    expect(() => schema.parse(123)).toThrow()
  })

  it('オブジェクトスキーマが動作する', () => {
    const UserSchema = z.object({
      name: z.string(),
      age: z.number().min(0)
    })

    const validUser = { name: 'Alice', age: 25 }
    expect(UserSchema.parse(validUser)).toEqual(validUser)

    const invalidUser = { name: 'Bob', age: -1 }
    expect(() => UserSchema.parse(invalidUser)).toThrow()
  })

  it('配列スキーマが動作する', () => {
    const schema = z.array(z.number())

    expect(schema.parse([1, 2, 3])).toEqual([1, 2, 3])
    expect(() => schema.parse([1, '2', 3])).toThrow()
  })

  it('オプショナルなフィールドが動作する', () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional()
    })

    expect(schema.parse({ required: 'test' })).toEqual({ required: 'test' })
    expect(schema.parse({ required: 'test', optional: 'value' })).toEqual({
      required: 'test',
      optional: 'value'
    })
  })
})
