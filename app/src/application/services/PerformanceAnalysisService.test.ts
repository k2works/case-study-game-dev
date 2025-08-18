/**
 * パフォーマンス分析サービスのテスト
 */
import { describe, expect, test, vi } from 'vitest'

import type { GameSession } from '../../domain/models/ai/types'
import type { PerformancePort } from '../ports/PerformancePort'
import { PerformanceAnalysisService } from './PerformanceAnalysisService'

describe('PerformanceAnalysisService', () => {
  describe('基本機能', () => {
    test('セッションデータを記録できる', () => {
      // Arrange
      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn(),
        getAverageScore: vi.fn(),
        getAverageChain: vi.fn(),
        getChainSuccessRate: vi.fn(),
        getAveragePlayTime: vi.fn(),
        generateComparisonReport: vi.fn(),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn(),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      const sessionData = {
        gameId: 'game-123',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:05:00Z'),
        finalScore: 1500,
        maxChain: 6,
        totalMoves: 35,
        aiEnabled: true,
      }

      // Act
      service.recordGameSession(sessionData)

      // Assert
      expect(mockPerformancePort.addSession).toHaveBeenCalledWith({
        id: 'game-123',
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        finalScore: 1500,
        maxChain: 6,
        totalMoves: 35,
        aiEnabled: true,
        playerType: 'ai',
      })
    })

    test('人間プレイヤーのセッションを記録できる', () => {
      // Arrange
      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn(),
        getAverageScore: vi.fn(),
        getAverageChain: vi.fn(),
        getChainSuccessRate: vi.fn(),
        getAveragePlayTime: vi.fn(),
        generateComparisonReport: vi.fn(),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn(),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      const sessionData = {
        gameId: 'human-game-123',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:08:00Z'),
        finalScore: 800,
        maxChain: 3,
        totalMoves: 25,
        aiEnabled: false,
      }

      // Act
      service.recordGameSession(sessionData)

      // Assert
      expect(mockPerformancePort.addSession).toHaveBeenCalledWith({
        id: 'human-game-123',
        startTime: sessionData.startTime,
        endTime: sessionData.endTime,
        finalScore: 800,
        maxChain: 3,
        totalMoves: 25,
        aiEnabled: false,
        playerType: 'human',
      })
    })

    test('パフォーマンス統計を取得できる', () => {
      // Arrange
      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn().mockReturnValue({
          totalGames: 10,
          totalScore: 15000,
          totalChains: 50,
          sessions: [],
        }),
        getAverageScore: vi.fn().mockReturnValue(1500),
        getAverageChain: vi.fn().mockReturnValue(5.0),
        getChainSuccessRate: vi.fn().mockReturnValue(0.8),
        getAveragePlayTime: vi.fn().mockReturnValue(300000),
        generateComparisonReport: vi.fn(),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn(),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      // Act
      const stats = service.getPerformanceStatistics()

      // Assert
      expect(stats).toEqual({
        totalGames: 10,
        averageScore: 1500,
        averageChain: 5.0,
        chainSuccessRate: 0.8,
        averagePlayTime: 300000,
        gameResults: [],
      })
    })

    test('比較レポートを生成できる', () => {
      // Arrange
      const mockReport = {
        ai: {
          avgScore: 2000,
          avgChain: 7,
          gamesPlayed: 5,
          avgPlayTime: 250000,
          chainSuccessRate: 0.9,
        },
        human: {
          avgScore: 1000,
          avgChain: 4,
          gamesPlayed: 5,
          avgPlayTime: 400000,
          chainSuccessRate: 0.6,
        },
        comparison: {
          scoreRatio: 2.0,
          chainRatio: 1.75,
          playTimeRatio: 0.625,
        },
      }

      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn(),
        getAverageScore: vi.fn(),
        getAverageChain: vi.fn(),
        getChainSuccessRate: vi.fn(),
        getAveragePlayTime: vi.fn(),
        generateComparisonReport: vi.fn().mockReturnValue(mockReport),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn(),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      // Act
      const report = service.getAIvsHumanComparison()

      // Assert
      expect(report).toEqual(mockReport)
      expect(mockPerformancePort.generateComparisonReport).toHaveBeenCalled()
    })

    test('期間でフィルタリングした統計を取得できる', () => {
      // Arrange
      const startDate = new Date('2025-01-01T00:00:00Z')
      const endDate = new Date('2025-01-31T23:59:59Z')
      const mockSessions: GameSession[] = [
        {
          id: 'session-1',
          startTime: new Date('2025-01-15T10:00:00Z'),
          endTime: new Date('2025-01-15T10:05:00Z'),
          finalScore: 1200,
          maxChain: 5,
          totalMoves: 30,
          aiEnabled: true,
          playerType: 'ai',
        },
        {
          id: 'session-2',
          startTime: new Date('2025-01-20T14:00:00Z'),
          endTime: new Date('2025-01-20T14:08:00Z'),
          finalScore: 800,
          maxChain: 3,
          totalMoves: 25,
          aiEnabled: false,
          playerType: 'human',
        },
      ]

      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn(),
        getAverageScore: vi.fn(),
        getAverageChain: vi.fn(),
        getChainSuccessRate: vi.fn(),
        getAveragePlayTime: vi.fn(),
        generateComparisonReport: vi.fn(),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn().mockReturnValue(mockSessions),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      // Act
      const filteredStats = service.getPerformanceInPeriod(startDate, endDate)

      // Assert
      expect(filteredStats.sessions).toHaveLength(2)
      expect(filteredStats.sessions[0].id).toBe('session-1')
      expect(filteredStats.sessions[1].id).toBe('session-2')
      expect(mockPerformancePort.getSessionsInPeriod).toHaveBeenCalledWith(
        startDate,
        endDate,
      )
    })

    test('データをリセットできる', () => {
      // Arrange
      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn(),
        getAverageScore: vi.fn(),
        getAverageChain: vi.fn(),
        getChainSuccessRate: vi.fn(),
        getAveragePlayTime: vi.fn(),
        generateComparisonReport: vi.fn(),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn(),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      // Act
      service.resetPerformanceData()

      // Assert
      expect(mockPerformancePort.clearData).toHaveBeenCalled()
    })
  })

  describe('エラーハンドリング', () => {
    test('統計データが不十分な場合にデフォルト値を返す', () => {
      // Arrange
      const mockPerformancePort: PerformancePort = {
        addSession: vi.fn(),
        getPerformanceData: vi.fn().mockReturnValue({
          totalGames: 0,
          totalScore: 0,
          totalChains: 0,
          sessions: [],
        }),
        getAverageScore: vi.fn().mockImplementation(() => {
          throw new Error('データが不十分です')
        }),
        getAverageChain: vi.fn().mockImplementation(() => {
          throw new Error('データが不十分です')
        }),
        getChainSuccessRate: vi.fn().mockImplementation(() => {
          throw new Error('データが不十分です')
        }),
        getAveragePlayTime: vi.fn().mockImplementation(() => {
          throw new Error('データが不十分です')
        }),
        generateComparisonReport: vi.fn(),
        clearData: vi.fn(),
        getSessionsInPeriod: vi.fn(),
      }

      const service = new PerformanceAnalysisService(mockPerformancePort)

      // Act
      const stats = service.getPerformanceStatistics()

      // Assert
      expect(stats).toEqual({
        totalGames: 0,
        averageScore: 0,
        averageChain: 0,
        chainSuccessRate: 0,
        averagePlayTime: 0,
        gameResults: [],
      })
    })
  })
})
