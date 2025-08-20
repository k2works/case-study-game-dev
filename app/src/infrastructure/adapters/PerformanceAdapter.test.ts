/**
 * パフォーマンスアダプターのテスト
 */
import { describe, expect, test } from 'vitest'

import type { GameSession } from '../../domain/models/ai/index'
import { PerformanceAdapter } from './PerformanceAdapter'

describe('PerformanceAdapter', () => {
  describe('基本機能', () => {
    test('ゲームセッションを追加してパフォーマンスデータを取得できる', () => {
      // Arrange
      const adapter = new PerformanceAdapter()
      const session: GameSession = {
        id: 'test-session',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:05:00Z'),
        finalScore: 1500,
        maxChain: 6,
        totalMoves: 35,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      adapter.addSession(session)
      const data = adapter.getPerformanceData()

      // Assert
      expect(data.totalGames).toBe(1)
      expect(data.totalScore).toBe(1500)
      expect(data.sessions).toHaveLength(1)
      expect(data.sessions[0]).toEqual(session)
    })

    test('統計計算機能が正常に動作する', () => {
      // Arrange
      const adapter = new PerformanceAdapter()
      const session1: GameSession = {
        id: 'session-1',
        startTime: new Date('2025-01-01T10:00:00Z'),
        endTime: new Date('2025-01-01T10:04:00Z'), // 4分
        finalScore: 1000,
        maxChain: 5,
        totalMoves: 30,
        aiEnabled: true,
        playerType: 'ai',
      }
      const session2: GameSession = {
        id: 'session-2',
        startTime: new Date('2025-01-01T11:00:00Z'),
        endTime: new Date('2025-01-01T11:02:00Z'), // 2分
        finalScore: 2000,
        maxChain: 3,
        totalMoves: 25,
        aiEnabled: false,
        playerType: 'human',
      }

      // Act
      adapter.addSession(session1)
      adapter.addSession(session2)

      // Assert
      expect(adapter.getAverageScore()).toBe(1500) // (1000 + 2000) / 2
      expect(adapter.getAverageChain()).toBe(4) // (5 + 3) / 2
      expect(adapter.getAveragePlayTime()).toBe(180000) // 3分 = 180000ms
      expect(adapter.getChainSuccessRate()).toBe(0.5) // 5連鎖以上は1つ、全体で2つ
    })

    test('比較レポート生成が正常に動作する', () => {
      // Arrange
      const adapter = new PerformanceAdapter()
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
      adapter.addSession(aiSession)
      adapter.addSession(humanSession)
      const report = adapter.generateComparisonReport()

      // Assert
      expect(report.ai.avgScore).toBe(2000)
      expect(report.ai.avgChain).toBe(8)
      expect(report.human.avgScore).toBe(1000)
      expect(report.human.avgChain).toBe(4)
      expect(report.comparison.scoreRatio).toBe(2)
      expect(report.comparison.chainRatio).toBe(2)
    })

    test('期間フィルタリング機能が正常に動作する', () => {
      // Arrange
      const adapter = new PerformanceAdapter()
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
      adapter.addSession(oldSession)
      adapter.addSession(recentSession)
      const filteredSessions = adapter.getSessionsInPeriod(
        new Date('2025-01-01T00:00:00Z'),
        new Date('2025-01-31T23:59:59Z'),
      )

      // Assert
      expect(filteredSessions).toHaveLength(1)
      expect(filteredSessions[0].id).toBe('recent-session')
    })

    test('データクリア機能が正常に動作する', () => {
      // Arrange
      const adapter = new PerformanceAdapter()
      const session: GameSession = {
        id: 'test-session',
        startTime: new Date(),
        endTime: new Date(),
        finalScore: 1000,
        maxChain: 4,
        totalMoves: 25,
        aiEnabled: true,
        playerType: 'ai',
      }

      // Act
      adapter.addSession(session)
      adapter.clearData()
      const data = adapter.getPerformanceData()

      // Assert
      expect(data.totalGames).toBe(0)
      expect(data.sessions).toHaveLength(0)
    })
  })

  describe('エラーハンドリング', () => {
    test('データが不十分な場合はデフォルト値を返す', () => {
      // Arrange
      const adapter = new PerformanceAdapter()

      // Act & Assert
      expect(adapter.getAverageScore()).toBe(0)
      expect(adapter.getAverageChain()).toBe(0)
      expect(adapter.getChainSuccessRate()).toBe(0)
      expect(adapter.getAveragePlayTime()).toBe(0)
    })
  })
})
