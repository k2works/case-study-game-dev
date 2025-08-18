/**
 * StrategyConfigドメインモデルのテスト
 */
import { describe, expect, test } from 'vitest'

import {
  DEFAULT_STRATEGIES,
  type StrategyConfig,
  type StrategyParameters,
  createStrategyConfig,
  isValidStrategyConfig,
  updateStrategyConfig,
  validateStrategyParameters,
} from './StrategyConfig'

describe('StrategyConfig', () => {
  describe('createStrategyConfig', () => {
    test('新しい戦略設定を作成できる', () => {
      // Arrange
      const name = 'テスト戦略'
      const description = 'テスト用の戦略設定'
      const parameters: StrategyParameters = {
        chainPriority: 70,
        speedPriority: 50,
        defensePriority: 80,
        riskTolerance: 40,
        heightControl: 60,
        centerPriority: 55,
      }

      // Act
      const result = createStrategyConfig(
        name,
        'custom',
        description,
        parameters,
      )

      // Assert
      expect(result.name).toBe(name)
      expect(result.type).toBe('custom')
      expect(result.description).toBe(description)
      expect(result.parameters).toEqual(parameters)
      expect(result.isDefault).toBe(false)
      expect(result.id).toMatch(/^strategy-\d+-[a-z0-9]+$/)
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe('updateStrategyConfig', () => {
    test('戦略設定を更新できる', () => {
      // Arrange
      const originalConfig = createStrategyConfig(
        '元の戦略',
        'custom',
        '元の説明',
        {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
      )
      const originalUpdatedAt = originalConfig.updatedAt

      const updates = {
        name: '更新された戦略',
        description: '更新された説明',
        parameters: {
          chainPriority: 80,
          speedPriority: 40,
          defensePriority: 60,
          riskTolerance: 70,
          heightControl: 30,
          centerPriority: 90,
        },
      }

      // Act
      const result = updateStrategyConfig(originalConfig, updates)

      // Assert
      expect(result.id).toBe(originalConfig.id)
      expect(result.name).toBe(updates.name)
      expect(result.description).toBe(updates.description)
      expect(result.parameters).toEqual(updates.parameters)
      expect(result.type).toBe(originalConfig.type)
      expect(result.isDefault).toBe(originalConfig.isDefault)
      expect(result.createdAt).toBe(originalConfig.createdAt)
      expect(result.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime(),
      )
    })

    test('部分的な更新ができる', () => {
      // Arrange
      const originalConfig = createStrategyConfig(
        '元の戦略',
        'custom',
        '元の説明',
        {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
      )

      const updates = {
        name: '新しい名前のみ',
      }

      // Act
      const result = updateStrategyConfig(originalConfig, updates)

      // Assert
      expect(result.name).toBe(updates.name)
      expect(result.description).toBe(originalConfig.description)
      expect(result.parameters).toEqual(originalConfig.parameters)
    })
  })

  describe('validateStrategyParameters', () => {
    test('有効なパラメータを検証できる', () => {
      // Arrange
      const validParameters: StrategyParameters = {
        chainPriority: 70,
        speedPriority: 50,
        defensePriority: 80,
        riskTolerance: 40,
        heightControl: 60,
        centerPriority: 55,
      }

      // Act & Assert
      expect(validateStrategyParameters(validParameters)).toBe(true)
    })

    test('境界値でのパラメータを検証できる', () => {
      // Arrange
      const minParameters: StrategyParameters = {
        chainPriority: 0,
        speedPriority: 0,
        defensePriority: 0,
        riskTolerance: 0,
        heightControl: 0,
        centerPriority: 0,
      }

      const maxParameters: StrategyParameters = {
        chainPriority: 100,
        speedPriority: 100,
        defensePriority: 100,
        riskTolerance: 100,
        heightControl: 100,
        centerPriority: 100,
      }

      // Act & Assert
      expect(validateStrategyParameters(minParameters)).toBe(true)
      expect(validateStrategyParameters(maxParameters)).toBe(true)
    })

    test('範囲外のパラメータを拒否する', () => {
      // Arrange
      const invalidParameters: StrategyParameters = {
        chainPriority: 101, // 範囲外
        speedPriority: 50,
        defensePriority: 80,
        riskTolerance: 40,
        heightControl: 60,
        centerPriority: 55,
      }

      const negativeParameters: StrategyParameters = {
        chainPriority: -1, // 負の値
        speedPriority: 50,
        defensePriority: 80,
        riskTolerance: 40,
        heightControl: 60,
        centerPriority: 55,
      }

      // Act & Assert
      expect(validateStrategyParameters(invalidParameters)).toBe(false)
      expect(validateStrategyParameters(negativeParameters)).toBe(false)
    })

    test('小数値のパラメータを拒否する', () => {
      // Arrange
      const floatParameters: StrategyParameters = {
        chainPriority: 70.5, // 小数値
        speedPriority: 50,
        defensePriority: 80,
        riskTolerance: 40,
        heightControl: 60,
        centerPriority: 55,
      }

      // Act & Assert
      expect(validateStrategyParameters(floatParameters)).toBe(false)
    })
  })

  describe('isValidStrategyConfig', () => {
    test('有効な戦略設定を検証できる', () => {
      // Arrange
      const validConfig = createStrategyConfig(
        'テスト戦略',
        'custom',
        'テスト用の戦略',
        {
          chainPriority: 70,
          speedPriority: 50,
          defensePriority: 80,
          riskTolerance: 40,
          heightControl: 60,
          centerPriority: 55,
        },
      )

      // Act & Assert
      expect(isValidStrategyConfig(validConfig)).toBe(true)
    })

    test('無効な戦略設定を拒否する', () => {
      // Arrange
      const invalidConfigs: Partial<StrategyConfig>[] = [
        {
          // IDがない
          name: 'テスト',
          type: 'custom',
          description: 'テスト',
          parameters: {
            chainPriority: 70,
            speedPriority: 50,
            defensePriority: 80,
            riskTolerance: 40,
            heightControl: 60,
            centerPriority: 55,
          },
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          // 名前が空
          id: 'test-id',
          name: '',
          type: 'custom',
          description: 'テスト',
          parameters: {
            chainPriority: 70,
            speedPriority: 50,
            defensePriority: 80,
            riskTolerance: 40,
            heightControl: 60,
            centerPriority: 55,
          },
          isDefault: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Act & Assert
      invalidConfigs.forEach((config) => {
        expect(isValidStrategyConfig(config as StrategyConfig)).toBe(false)
      })
    })
  })

  describe('DEFAULT_STRATEGIES', () => {
    test('すべてのデフォルト戦略が有効である', () => {
      // Act & Assert
      Object.values(DEFAULT_STRATEGIES).forEach((strategy) => {
        expect(isValidStrategyConfig(strategy)).toBe(true)
        expect(strategy.isDefault).toBe(true)
      })
    })

    test('攻撃型戦略の設定が適切である', () => {
      // Arrange
      const aggressive = DEFAULT_STRATEGIES.aggressive

      // Act & Assert
      expect(aggressive.type).toBe('aggressive')
      expect(aggressive.parameters.chainPriority).toBeGreaterThan(
        aggressive.parameters.speedPriority,
      )
      expect(aggressive.parameters.riskTolerance).toBeGreaterThan(50)
    })

    test('守備型戦略の設定が適切である', () => {
      // Arrange
      const defensive = DEFAULT_STRATEGIES.defensive

      // Act & Assert
      expect(defensive.type).toBe('defensive')
      expect(defensive.parameters.defensePriority).toBeGreaterThan(70)
      expect(defensive.parameters.heightControl).toBeGreaterThan(70)
      expect(defensive.parameters.riskTolerance).toBeLessThan(50)
    })

    test('バランス型戦略の設定が適切である', () => {
      // Arrange
      const balanced = DEFAULT_STRATEGIES.balanced

      // Act & Assert
      expect(balanced.type).toBe('balanced')
      // すべてのパラメータが中程度の値（40-80）であることを確認
      Object.values(balanced.parameters).forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(40)
        expect(value).toBeLessThanOrEqual(80)
      })
    })
  })
})
