import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AccessibilityAuditor } from './accessibilityAuditor'
import * as axe from 'axe-core'

// axe-coreのモック
vi.mock('axe-core', () => ({
  run: vi.fn(),
}))

const mockAxe = vi.mocked(axe)

describe('AccessibilityAuditor', () => {
  let auditor: AccessibilityAuditor

  beforeEach(() => {
    vi.clearAllMocks()
    auditor = AccessibilityAuditor.getInstance()
  })

  describe('初期化', () => {
    it('シングルトンパターンで動作する', () => {
      const instance1 = AccessibilityAuditor.getInstance()
      const instance2 = AccessibilityAuditor.getInstance()
      expect(instance1).toBe(instance2)
    })
  })

  describe('監査実行', () => {
    it('成功時にレポートが返される', async () => {
      const mockAxeResult = {
        passes: [{ id: 'pass1' }, { id: 'pass2' }],
        violations: [],
        incomplete: [],
        inapplicable: [{ id: 'inapplicable1' }],
      }

      mockAxe.run.mockResolvedValue(mockAxeResult)

      const result = await auditor.auditPage()

      expect(result).toMatchObject({
        score: 100, // 違反なしなので満点
        violations: [],
        passes: 2,
        incomplete: 0,
        inapplicable: 1,
      })
      expect(result.timestamp).toBeInstanceOf(Date)
      expect(result.url).toBeDefined()
    })

    it('違反がある場合に適切なスコアが計算される', async () => {
      const mockAxeResult = {
        passes: [{ id: 'pass1' }],
        violations: [
          {
            id: 'violation1',
            impact: 'critical',
            description: 'Critical violation',
            help: 'Fix critical issue',
            helpUrl: 'https://example.com/help',
            nodes: [
              {
                html: '<div>test</div>',
                target: ['div'],
              },
            ],
          },
        ],
        incomplete: [],
        inapplicable: [],
      }

      mockAxe.run.mockResolvedValue(mockAxeResult)

      const result = await auditor.auditPage()

      expect(result.violations).toHaveLength(1)
      expect(result.violations[0]).toMatchObject({
        id: 'violation1',
        impact: 'critical',
        description: 'Critical violation',
        help: 'Fix critical issue',
        helpUrl: 'https://example.com/help',
        nodes: [
          {
            html: '<div>test</div>',
            target: ['div'],
          },
        ],
      })
      expect(result.score).toBeLessThan(100)
    })

    it('エラー時に例外が発生する', async () => {
      const error = new Error('Axe execution failed')
      mockAxe.run.mockRejectedValue(error)

      await expect(auditor.auditPage()).rejects.toThrow(
        'アクセシビリティ監査の実行に失敗しました'
      )
    })
  })

  describe('スコア計算', () => {
    it('違反なしの場合は100点', async () => {
      const mockAxeResult = {
        passes: [{ id: 'pass1' }, { id: 'pass2' }],
        violations: [],
        incomplete: [],
        inapplicable: [],
      }

      mockAxe.run.mockResolvedValue(mockAxeResult)
      const result = await auditor.auditPage()

      expect(result.score).toBe(100)
    })

    it('影響度別の重み付けでスコアが計算される', async () => {
      const mockAxeResult = {
        passes: [{ id: 'pass1' }],
        violations: [
          {
            id: 'minor-violation',
            impact: 'minor',
            description: 'Minor issue',
            help: 'Fix minor issue',
            helpUrl: 'https://example.com/minor',
            nodes: [{ html: '<div>minor</div>', target: ['div'] }],
          },
          {
            id: 'critical-violation',
            impact: 'critical',
            description: 'Critical issue',
            help: 'Fix critical issue',
            helpUrl: 'https://example.com/critical',
            nodes: [{ html: '<div>critical</div>', target: ['div'] }],
          },
        ],
        incomplete: [],
        inapplicable: [],
      }

      mockAxe.run.mockResolvedValue(mockAxeResult)
      const result = await auditor.auditPage()

      // 合格1 + 軽微違反1 + クリティカル違反1 = 合計3
      // 最大スコア = 3 * 4(クリティカル重み) = 12
      // 違反スコア = 1(軽微重み) + 4(クリティカル重み) = 5
      // 実際スコア = ((12 - 5) / 12) * 100 = 58.33... → 58
      expect(result.score).toBe(58)
    })
  })

  describe('テキストレポート生成', () => {
    it('違反なしのレポートが正しく生成される', () => {
      const report = {
        score: 100,
        violations: [],
        passes: 5,
        incomplete: 0,
        inapplicable: 2,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        url: 'https://example.com',
      }

      const textReport = auditor.generateTextReport(report)

      expect(textReport).toContain('スコア: 100/100')
      expect(textReport).toContain('合格: 5項目')
      expect(textReport).toContain('違反: 0項目')
      expect(textReport).toContain('違反は見つかりませんでした')
    })

    it('違反ありのレポートが正しく生成される', () => {
      const report = {
        score: 75,
        violations: [
          {
            id: 'test-violation',
            impact: 'serious' as const,
            description: 'Test violation description',
            help: 'Test help message',
            helpUrl: 'https://example.com/help',
            nodes: [
              { html: '<div>test1</div>', target: ['div:nth-child(1)'] },
              { html: '<div>test2</div>', target: ['div:nth-child(2)'] },
            ],
          },
        ],
        passes: 3,
        incomplete: 1,
        inapplicable: 0,
        timestamp: new Date('2024-01-01T12:00:00Z'),
        url: 'https://example.com',
      }

      const textReport = auditor.generateTextReport(report)

      expect(textReport).toContain('スコア: 75/100')
      expect(textReport).toContain('深刻: 1件')
      expect(textReport).toContain('Test help message')
      expect(textReport).toContain('該当要素: 2個')
    })
  })

  describe('ゲーム固有の監査', () => {
    it('ゲーム固有のルールで監査が実行される', async () => {
      const mockAxeResult = {
        passes: [],
        violations: [],
        incomplete: [],
        inapplicable: [],
      }

      mockAxe.run.mockResolvedValue(mockAxeResult)

      await auditor.auditGameSpecific()

      expect(mockAxe.run).toHaveBeenCalledWith(document, {
        tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
      })
    })
  })
})
