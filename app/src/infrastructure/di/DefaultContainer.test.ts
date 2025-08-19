/**
 * DefaultContainerのテスト
 */
import { describe, expect, test } from 'vitest'

import type { AIPort } from '../../application/ports/AIPort'
import type { GamePort } from '../../application/ports/GamePort'
import type { InputPort } from '../../application/ports/InputPort'
import type { PerformancePort } from '../../application/ports/PerformancePort'
import type { PerformanceAnalysisService } from '../../application/services/PerformanceAnalysisService'
import { DefaultContainer, defaultContainer } from './DefaultContainer'

describe('DefaultContainer', () => {
  describe('サービス登録', () => {
    test('必要なサービスがすべて登録されている', () => {
      // Arrange
      const container = DefaultContainer.create()

      // Act & Assert
      expect(container.has('StoragePort')).toBe(true)
      expect(container.has('TimerPort')).toBe(true)
      expect(container.has('ChainDetectionService')).toBe(true)
      expect(container.has('PuyoSpawningService')).toBe(true)
      expect(container.has('GamePort')).toBe(true)
      expect(container.has('InputPort')).toBe(true)
      expect(container.has('AIPort')).toBe(true)
      expect(container.has('PerformancePort')).toBe(true)
      expect(container.has('PerformanceAnalysisService')).toBe(true)
    })

    test('サービスが正しく解決される', () => {
      // Arrange
      const container = DefaultContainer.create()

      // Act
      const gamePort = container.resolve<GamePort>('GamePort')
      const inputPort = container.resolve<InputPort>('InputPort')
      const aiPort = container.resolve<AIPort>('AIPort')
      const performancePort =
        container.resolve<PerformancePort>('PerformancePort')
      const performanceService = container.resolve<PerformanceAnalysisService>(
        'PerformanceAnalysisService',
      )

      // Assert
      expect(gamePort).toBeDefined()
      expect(inputPort).toBeDefined()
      expect(aiPort).toBeDefined()
      expect(performancePort).toBeDefined()
      expect(performanceService).toBeDefined()
    })

    test('シングルトンサービスが同じインスタンスを返す', () => {
      // Arrange
      const container = DefaultContainer.create()

      // Act
      const gamePort1 = container.resolve<GamePort>('GamePort')
      const gamePort2 = container.resolve<GamePort>('GamePort')
      const performanceService1 = container.resolve<PerformanceAnalysisService>(
        'PerformanceAnalysisService',
      )
      const performanceService2 = container.resolve<PerformanceAnalysisService>(
        'PerformanceAnalysisService',
      )

      // Assert
      expect(gamePort1).toBe(gamePort2)
      expect(performanceService1).toBe(performanceService2)
    })
  })

  describe('DefaultContainerWrapper', () => {
    test('getGameServiceが正しく動作する', () => {
      // Act
      const gameService = defaultContainer.getGameService()

      // Assert
      expect(gameService).toBeDefined()
    })

    test('getInputServiceが正しく動作する', () => {
      // Act
      const inputService = defaultContainer.getInputService()

      // Assert
      expect(inputService).toBeDefined()
    })

    test('getAIServiceが正しく動作する', () => {
      // Act
      const aiService = defaultContainer.getAIService()

      // Assert
      expect(aiService).toBeDefined()
    })

    test('getPerformanceAnalysisServiceが正しく動作する', () => {
      // Act
      const performanceService =
        defaultContainer.getPerformanceAnalysisService()

      // Assert
      expect(performanceService).toBeDefined()
    })

    test('同じサービスインスタンスを返す', () => {
      // Act
      const gameService1 = defaultContainer.getGameService()
      const gameService2 = defaultContainer.getGameService()
      const performanceService1 =
        defaultContainer.getPerformanceAnalysisService()
      const performanceService2 =
        defaultContainer.getPerformanceAnalysisService()

      // Assert
      expect(gameService1).toBe(gameService2)
      expect(performanceService1).toBe(performanceService2)
    })
  })
})
