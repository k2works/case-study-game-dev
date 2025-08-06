/**
 * テンプレート使用例
 * ドメインモデルテストテンプレートから作成されたサンプル
 */

import { describe, it, expect } from 'vitest'

class SampleUser {
  constructor(public name: string, public email: string) {}
  
  validate(): boolean {
    return this.name.length > 0 && this.email.includes('@')
  }
  
  changeEmail(newEmail: string): void {
    if (!newEmail.includes('@')) {
      throw new Error('Invalid email')
    }
    this.email = newEmail
  }
}

describe('SampleUser', () => {
  describe('インスタンス生成', () => {
    it('新しいユーザーを作成できる', () => {
      // Arrange（準備）
      const name = 'John Doe'
      const email = 'john@example.com'

      // Act（実行）
      const user = new SampleUser(name, email)

      // Assert（検証）
      expect(user).toBeDefined()
      expect(user.name).toBe(name)
      expect(user.email).toBe(email)
    })
  })

  describe('バリデーション', () => {
    describe('正常系', () => {
      it('有効なユーザーはバリデーションを通過する', () => {
        // Arrange
        const user = new SampleUser('John', 'john@example.com')

        // Act
        const isValid = user.validate()

        // Assert
        expect(isValid).toBe(true)
      })
    })

    describe('異常系', () => {
      it('名前が空の場合はバリデーションが失敗する', () => {
        // Arrange
        const user = new SampleUser('', 'john@example.com')

        // Act
        const isValid = user.validate()

        // Assert
        expect(isValid).toBe(false)
      })

      it('無効なメールアドレスでバリデーションが失敗する', () => {
        // Arrange
        const user = new SampleUser('John', 'invalid-email')

        // Act
        const isValid = user.validate()

        // Assert
        expect(isValid).toBe(false)
      })
    })
  })

  describe('メール変更', () => {
    it('有効なメールアドレスに変更できる', () => {
      // Arrange
      const user = new SampleUser('John', 'old@example.com')
      const newEmail = 'new@example.com'

      // Act
      user.changeEmail(newEmail)

      // Assert
      expect(user.email).toBe(newEmail)
    })

    it('無効なメールアドレスの場合エラーが投げられる', () => {
      // Arrange
      const user = new SampleUser('John', 'old@example.com')
      const invalidEmail = 'invalid-email'

      // Act & Assert
      expect(() => user.changeEmail(invalidEmail)).toThrow('Invalid email')
    })
  })
})