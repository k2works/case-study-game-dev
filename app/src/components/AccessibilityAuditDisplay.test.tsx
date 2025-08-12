import React from 'react'
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  cleanup,
} from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import AccessibilityAuditDisplay from './AccessibilityAuditDisplay'
import { accessibilityAuditor } from '../utils/accessibilityAuditor'

// AccessibilityAuditorのモック
vi.mock('../utils/accessibilityAuditor', () => ({
  accessibilityAuditor: {
    auditGameSpecific: vi.fn(),
    generateTextReport: vi.fn(),
  },
}))

const mockAccessibilityAuditor = vi.mocked(accessibilityAuditor)

// URL.createObjectURLとrevokeObjectURLのモック
const mockCreateObjectURL = vi.fn(() => 'mock-url')
const mockRevokeObjectURL = vi.fn()

Object.defineProperty(URL, 'createObjectURL', {
  value: mockCreateObjectURL,
  writable: true,
})

Object.defineProperty(URL, 'revokeObjectURL', {
  value: mockRevokeObjectURL,
  writable: true,
})

describe('AccessibilityAuditDisplay', () => {
  const mockOnClose = vi.fn()

  const mockReport = {
    score: 85,
    violations: [
      {
        id: 'test-violation',
        impact: 'serious' as const,
        description: 'テスト違反の説明',
        help: 'テスト違反のヘルプ',
        helpUrl: 'https://example.com/help',
        nodes: [
          { html: '<div>test</div>', target: ['div'] },
          { html: '<span>test2</span>', target: ['span'] },
        ],
      },
    ],
    passes: 15,
    incomplete: 2,
    inapplicable: 5,
    timestamp: new Date('2024-01-01T12:00:00Z'),
    url: 'https://example.com/test',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  describe('表示制御', () => {
    it('isOpenがfalseの場合は表示されない', () => {
      render(<AccessibilityAuditDisplay isOpen={false} onClose={mockOnClose} />)
      expect(screen.queryByText('アクセシビリティ監査')).not.toBeInTheDocument()
    })

    it('isOpenがtrueの場合は表示される', () => {
      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)
      expect(screen.getByText('アクセシビリティ監査')).toBeInTheDocument()
    })
  })

  describe('基本UI要素', () => {
    beforeEach(() => {
      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)
    })

    it('タイトルが表示される', () => {
      expect(screen.getByText('アクセシビリティ監査')).toBeInTheDocument()
    })

    it('閉じるボタンが表示される', () => {
      const closeButton =
        screen.getByLabelText('アクセシビリティ監査画面を閉じる')
      expect(closeButton).toBeInTheDocument()
    })

    it('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
      const closeButton =
        screen.getByLabelText('アクセシビリティ監査画面を閉じる')
      fireEvent.click(closeButton)
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('初期状態で監査実行ボタンが表示される', () => {
      expect(screen.getByText('監査を実行')).toBeInTheDocument()
    })

    it('説明文が表示される', () => {
      expect(
        screen.getByText('このゲームのアクセシビリティを監査します。')
      ).toBeInTheDocument()
      expect(
        screen.getByText('WCAG 2.1 AA基準に基づいて評価を実行します。')
      ).toBeInTheDocument()
    })
  })

  describe('監査実行', () => {
    it('監査実行ボタンをクリックすると監査が開始される', async () => {
      // より長い遅延でローディング状態をテストできるようにする
      let resolvePromise: (value: typeof mockReport) => void
      const auditPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      mockAccessibilityAuditor.auditGameSpecific.mockReturnValue(auditPromise)

      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)

      const runButton = screen.getByText('監査を実行')
      fireEvent.click(runButton)

      // ローディング状態を確認
      expect(
        screen.getByText('アクセシビリティを監査中...')
      ).toBeInTheDocument()
      expect(mockAccessibilityAuditor.auditGameSpecific).toHaveBeenCalledTimes(
        1
      )

      // Promiseを解決してクリーンアップ
      await act(async () => {
        resolvePromise!(mockReport)
      })
    })

    it('監査成功時にレポートが表示される', async () => {
      mockAccessibilityAuditor.auditGameSpecific.mockResolvedValue(mockReport)

      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)

      const runButton = screen.getByText('監査を実行')

      await act(async () => {
        fireEvent.click(runButton)
      })

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument()
      })

      expect(screen.getByText('アクセシビリティスコア')).toBeInTheDocument()
      expect(screen.getByText('15')).toBeInTheDocument() // 合格数
      expect(screen.getByText('1')).toBeInTheDocument() // 違反数
      expect(screen.getByText('2')).toBeInTheDocument() // 未完了数
    })

    it('監査エラー時にエラーメッセージが表示される', async () => {
      const error = new Error('監査エラー')
      mockAccessibilityAuditor.auditGameSpecific.mockRejectedValue(error)

      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)

      const runButton = screen.getByText('監査を実行')

      await act(async () => {
        fireEvent.click(runButton)
      })

      // エラー状態になるまで待機（ローディング状態は省略し、最終結果を確認）
      await waitFor(() => {
        expect(screen.getByText('エラーが発生しました')).toBeInTheDocument()
      })

      expect(screen.getByText('監査エラー')).toBeInTheDocument()
      expect(screen.getByText('再試行')).toBeInTheDocument()
      expect(mockAccessibilityAuditor.auditGameSpecific).toHaveBeenCalledTimes(
        1
      )
    })
  })

  describe('レポート表示', () => {
    beforeEach(async () => {
      mockAccessibilityAuditor.auditGameSpecific.mockResolvedValue(mockReport)

      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)

      const runButton = screen.getByText('監査を実行')

      await act(async () => {
        fireEvent.click(runButton)
      })

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument()
      })
    })

    it('スコアが正しく表示される', () => {
      expect(screen.getByText('85')).toBeInTheDocument()
      expect(screen.getByText('/100')).toBeInTheDocument()
    })

    it('統計情報が表示される', () => {
      expect(screen.getByText('15')).toBeInTheDocument() // 合格
      expect(screen.getByText('1')).toBeInTheDocument() // 違反
      expect(screen.getByText('2')).toBeInTheDocument() // 未完了
      expect(screen.getByText('合格')).toBeInTheDocument()
      expect(screen.getByText('違反')).toBeInTheDocument()
      expect(screen.getByText('未完了')).toBeInTheDocument()
    })

    it('違反詳細が表示される', () => {
      expect(screen.getByText('違反項目')).toBeInTheDocument()
      expect(screen.getByText('テスト違反のヘルプ')).toBeInTheDocument()
      expect(screen.getByText('テスト違反の説明')).toBeInTheDocument()
      expect(screen.getByText('2個の要素が該当')).toBeInTheDocument()
      expect(screen.getByText('serious')).toBeInTheDocument()
    })

    it('違反リンクが正しく設定される', () => {
      const link = screen.getByRole('link', { name: '詳細を確認 →' })
      expect(link).toHaveAttribute('href', 'https://example.com/help')
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('アクションボタンが表示される', () => {
      expect(screen.getByText('レポートをダウンロード')).toBeInTheDocument()
      expect(screen.getByText('再実行')).toBeInTheDocument()
    })

    it('メタデータが表示される', () => {
      expect(
        screen.getByText(/実行日時: 2024\/1\/1 21:00:00/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/監査対象: https:\/\/example\.com\/test/)
      ).toBeInTheDocument()
    })
  })

  describe('レポートダウンロード', () => {
    it('ダウンロードボタンをクリックするとテキストレポートがダウンロードされる', async () => {
      mockAccessibilityAuditor.auditGameSpecific.mockResolvedValue(mockReport)
      mockAccessibilityAuditor.generateTextReport.mockReturnValue(
        'Mock text report'
      )

      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)

      // DOM操作のモック
      const mockClick = vi.fn()

      // HTMLAnchorElementのモック
      const mockAnchor = document.createElement('a')
      mockAnchor.click = mockClick

      const originalCreateElement = document.createElement.bind(document)
      vi.spyOn(document, 'createElement').mockImplementation(
        (tagName: string) => {
          if (tagName === 'a') {
            return mockAnchor
          }
          return originalCreateElement(tagName)
        }
      )

      const originalAppendChild = document.body.appendChild
      const originalRemoveChild = document.body.removeChild
      document.body.appendChild = vi.fn()
      document.body.removeChild = vi.fn()

      const runButton = screen.getByText('監査を実行')

      await act(async () => {
        fireEvent.click(runButton)
      })

      await waitFor(() => {
        expect(screen.getByText('85')).toBeInTheDocument()
      })

      const downloadButton = screen.getByText('レポートをダウンロード')
      fireEvent.click(downloadButton)

      expect(mockAccessibilityAuditor.generateTextReport).toHaveBeenCalledWith(
        mockReport
      )
      expect(mockCreateObjectURL).toHaveBeenCalled()
      expect(mockClick).toHaveBeenCalled()
      expect(mockRevokeObjectURL).toHaveBeenCalled()

      // クリーンアップ
      document.body.appendChild = originalAppendChild
      document.body.removeChild = originalRemoveChild
      vi.restoreAllMocks()
    })
  })

  describe('違反なしケース', () => {
    it('違反がない場合は成功メッセージが表示される', async () => {
      const perfectReport = {
        ...mockReport,
        score: 100,
        violations: [],
      }

      mockAccessibilityAuditor.auditGameSpecific.mockResolvedValue(
        perfectReport
      )

      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)

      const runButton = screen.getByText('監査を実行')

      await act(async () => {
        fireEvent.click(runButton)
      })

      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument()
      })

      expect(screen.getByText('🎉 素晴らしい結果です！')).toBeInTheDocument()
      expect(
        screen.getByText('アクセシビリティ要件をすべて満たしています。')
      ).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    beforeEach(() => {
      render(<AccessibilityAuditDisplay isOpen={true} onClose={mockOnClose} />)
    })

    it('dialogロールが設定されている', () => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toBeInTheDocument()
    })

    it('aria-labelledbyが正しく設定されている', () => {
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute(
        'aria-labelledby',
        'accessibility-audit-title'
      )
    })

    it('閉じるボタンに適切なaria-labelが設定されている', () => {
      const closeButton =
        screen.getByLabelText('アクセシビリティ監査画面を閉じる')
      expect(closeButton).toBeInTheDocument()
    })
  })
})
