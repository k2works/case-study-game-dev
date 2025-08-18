/**
 * パフォーマンスメトリクスのテスト
 */
import { describe, expect, test } from 'vitest'

import { PerformanceMetrics } from './PerformanceMetrics'
import type { GameSession } from './types'

describe('PerformanceMetrics', () => {
  describe('基本機能', () => {
    test('初期状態でパフォーマンスデータが空である', () => {
      // Arrange
      const metrics = new PerformanceMetrics()

      // Act
      const data = metrics.getPerformanceData()

      // Assert
      expect(data.totalGames).toBe(0)
      expect(data.totalScore).toBe(0)
      expect(data.totalChains).toBe(0)
      expect(data.sessions).toHaveLength(0)
    })

    test('ゲームセッションを追加できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session: GameSession = {
        id: 'session-1',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:05:00Z'),
        finalScore: 1200,
        maxChain: 5,
        totalMoves: 30,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(session)
      const data = metrics.getPerformanceData()

      // Assert
      expect(data.totalGames).toBe(1)
      expect(data.totalScore).toBe(1200)
      expect(data.totalChains).toBe(5)
      expect(data.sessions).toHaveLength(1)
      expect(data.sessions[0]).toEqual(session)
    })

    test('複数のセッションを累積できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session1: GameSession = {
        id: 'session-1',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:05:00Z'),
        finalScore: 1200,
        maxChain: 5,
        totalMoves: 30,
        aiEnabled: true,
        playerType: 'ai',
      }
      const session2: GameSession = {
        id: 'session-2',
        startTime: new Date('2025-01-01T11:00:00Z'),
        endTime: new Date('2025-01-01T11:03:00Z'),
        finalScore: 800,
        maxChain: 3,
        totalMoves: 20,
        aiEnabled: false,
        playerType: 'human',
      }

      // Act
      metrics.addSession(session1)
      metrics.addSession(session2)
      const data = metrics.getPerformanceData()

      // Assert
      expect(data.totalGames).toBe(2)
      expect(data.totalScore).toBe(2000)
      expect(data.totalChains).toBe(8)
      expect(data.sessions).toHaveLength(2)
    })
  })

  describe('統計計算', () => {
    test('平均スコアを計算できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session1: GameSession = {
        id: 'session-1',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 1000,
        maxChain: 4,
        totalMoves: 25,
        aiEnabled: true,
        playerType: 'ai',
      }
      const session2: GameSession = {
        id: 'session-2',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 2000,
        maxChain: 6,
        totalMoves: 35,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(session1)
      metrics.addSession(session2)
      const avgScore = metrics.getAverageScore()

      // Assert
      expect(avgScore).toBe(1500)
    })

    test('平均連鎖数を計算できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session1: GameSession = {
        id: 'session-1',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 1000,
        maxChain: 4,
        totalMoves: 25,
        aiEnabled: true,
        playerType: 'ai',
      }
      const session2: GameSession = {
        id: 'session-2',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 2000,
        maxChain: 8,
        totalMoves: 35,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(session1)
      metrics.addSession(session2)
      const avgChain = metrics.getAverageChain()

      // Assert
      expect(avgChain).toBe(6)
    })

    test('連鎖成功率を計算できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session1: GameSession = {
        id: 'session-1',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 1000,
        maxChain: 5, // 5連鎖成功
        totalMoves: 10,
        aiEnabled: true,
        playerType: 'ai',
      }
      const session2: GameSession = {
        id: 'session-2',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 500,
        maxChain: 1, // 連鎖失敗
        totalMoves: 10,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(session1)
      metrics.addSession(session2)
      const successRate = metrics.getChainSuccessRate()

      // Assert
      expect(successRate).toBe(0.5) // 50% (1/2)
    })

    test('平均プレイ時間を計算できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session1: GameSession = {
        id: 'session-1',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:05:00Z'), // 5分
        finalScore: 1000,
        maxChain: 4,
        totalMoves: 25,
        aiEnabled: true,
        playerType: 'ai',
      }
      const session2: GameSession = {
        id: 'session-2',
        startTime: new Date('2025-01-01T11:00:00Z'),
        endTime: new Date('2025-01-01T11:03:00Z'), // 3分
        finalScore: 800,
        maxChain: 3,
        totalMoves: 20,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(session1)
      metrics.addSession(session2)
      const avgDuration = metrics.getAveragePlayTime()

      // Assert
      expect(avgDuration).toBe(240000) // 4分 = 240秒 = 240000ミリ秒
    })
  })

  describe('比較機能', () => {
    test('AIと人間の比較レポートを生成できる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()

      // AIセッション
      const aiSession: GameSession = {
        id: 'ai-session',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 2000,
        maxChain: 8,
        totalMoves: 40,
        aiEnabled: true,
        playerType: 'ai',
      }

      // 人間セッション
      const humanSession: GameSession = {
        id: 'human-session',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 1000,
        maxChain: 4,
        totalMoves: 30,
        aiEnabled: false,
        playerType: 'human',
      }

      // Act
      metrics.addSession(aiSession)
      metrics.addSession(humanSession)
      const report = metrics.generateComparisonReport()

      // Assert
      expect(report).toMatchObject({
        ai: {
          avgScore: 2000,
          avgChain: 8,
          gamesPlayed: 1,
        },
        human: {
          avgScore: 1000,
          avgChain: 4,
          gamesPlayed: 1,
        },
        comparison: {
          scoreRatio: 2, // AI/Human
          chainRatio: 2,
        },
      })
    })

    test('データが不十分な場合のエラーハンドリング', () => {
      // Arrange
      const metrics = new PerformanceMetrics()

      // Act & Assert
      expect(() => metrics.getAverageScore()).toThrow('データが不十分です')
      expect(() => metrics.getAverageChain()).toThrow('データが不十分です')
      expect(() => metrics.getChainSuccessRate()).toThrow('データが不十分です')
    })
  })

  describe('データ管理', () => {
    test('データをクリアできる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const session: GameSession = {
        id: 'session-1',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 1000,
        maxChain: 4,
        totalMoves: 25,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(session)
      metrics.clearData()
      const data = metrics.getPerformanceData()

      // Assert
      expect(data.totalGames).toBe(0)
      expect(data.sessions).toHaveLength(0)
    })

    test('期間でフィルタリングできる', () => {
      // Arrange
      const metrics = new PerformanceMetrics()
      const oldSession: GameSession = {
        id: 'old-session',
        startTime: new Date('2024-12-01T10:00:00Z'),
        endTime: new Date('2024-12-01T10:05:00Z'),
        finalScore: 500,
        maxChain: 2,
        totalMoves: 15,
        aiEnabled: true,
        playerType: 'ai',
      }
      const recentSession: GameSession = {
        id: 'recent-session',
        startTime: new Date('2025-01-15T10:00:00Z'),
        endTime: new Date('2025-01-15T10:05:00Z'),
        finalScore: 1500,
        maxChain: 7,
        totalMoves: 35,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      metrics.addSession(oldSession)
      metrics.addSession(recentSession)
      const filteredData = metrics.getSessionsInPeriod(
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-31T23:59:59Z'),
      )

      // Assert
      expect(filteredData).toHaveLength(1)
      expect(filteredData[0].id).toBe('recent-session')
    })
  })
})
