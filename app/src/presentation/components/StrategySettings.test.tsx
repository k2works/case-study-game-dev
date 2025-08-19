/**
 * StrategySettingsコンポーネントのテスト
 */
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { StrategyService } from '../../application/services/ai/StrategyService'
import {
  DEFAULT_STRATEGIES,
  type StrategyParameters,
} from '../../domain/models/ai/StrategyConfig'
import { StrategySettings } from './StrategySettings'

// モックStrategyService
class MockStrategyService {
  private strategies = Object.values(DEFAULT_STRATEGIES)
  private activeStrategy = DEFAULT_STRATEGIES.balanced

  async getAllStrategies() {
    return this.strategies
  }

  async getActiveStrategy() {
    return this.activeStrategy
  }

  async setActiveStrategy(strategyId: string) {
    const strategy = this.strategies.find((s) => s.id === strategyId)
    if (strategy) {
      this.activeStrategy = strategy
    }
  }

  async createCustomStrategy(request: {
    name: string
    description: string
    parameters: StrategyParameters
  }) {
    const newStrategy = {
      id: `custom-${Date.now()}`,
      name: request.name,
      type: 'custom' as const,
      description: request.description,
      parameters: request.parameters,
      isDefault: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    this.strategies.push(newStrategy)
    return newStrategy
  }

  async updateStrategy(
    id: string,
    request: {
      name?: string
      description?: string
      parameters?: StrategyParameters
    },
  ) {
    const index = this.strategies.findIndex((s) => s.id === id)
    if (index >= 0) {
      this.strategies[index] = {
        ...this.strategies[index],
        ...request,
        updatedAt: new Date(),
      }
      return this.strategies[index]
    }
    throw new Error('Strategy not found')
  }

  async deleteStrategy(id: string) {
    const index = this.strategies.findIndex((s) => s.id === id)
    if (index >= 0) {
      this.strategies.splice(index, 1)
    }
  }
}

describe('StrategySettings', () => {
  let mockStrategyService: MockStrategyService

  beforeEach(() => {
    mockStrategyService = new MockStrategyService()
  })

  test('戦略一覧が表示される', async () => {
    // Arrange & Act
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText('攻撃型')).toBeInTheDocument()
      expect(screen.getByText('守備型')).toBeInTheDocument()
      expect(screen.getByText('バランス型')).toBeInTheDocument()
    })
  })

  test('アクティブ戦略が強調表示される', async () => {
    // Arrange & Act
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    // Assert
    await waitFor(() => {
      const balancedStrategy = screen
        .getByText('バランス型')
        .closest('[data-testid="strategy-item"]')
      expect(balancedStrategy).toHaveClass('bg-blue-100', 'border-blue-300')
    })
  })

  test('戦略を選択してアクティブに設定できる', async () => {
    // Arrange
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('攻撃型')).toBeInTheDocument()
    })

    // Act
    const aggressiveStrategy = screen
      .getByText('攻撃型')
      .closest('[data-testid="strategy-item"]')!
    fireEvent.click(aggressiveStrategy)

    // Assert
    await waitFor(() => {
      expect(aggressiveStrategy).toHaveClass('bg-blue-100', 'border-blue-300')
    })
  })

  test('戦略パラメータが表示される', async () => {
    // Arrange & Act
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    // Assert
    await waitFor(() => {
      expect(screen.getAllByText(/連鎖優先度:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/スピード優先度:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/防御優先度:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/リスク許容度:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/高さ制御:/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/中央重視:/).length).toBeGreaterThan(0)
    })
  })

  test('カスタム戦略作成ボタンが表示される', async () => {
    // Arrange & Act
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    // Assert
    await waitFor(() => {
      expect(screen.getByText('カスタム戦略を作成')).toBeInTheDocument()
    })
  })

  test('カスタム戦略作成モーダルが開く', async () => {
    // Arrange
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('カスタム戦略を作成')).toBeInTheDocument()
    })

    // Act
    fireEvent.click(screen.getByText('カスタム戦略を作成'))

    // Assert
    expect(screen.getByText('新しいカスタム戦略')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('戦略名を入力')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('戦略の説明を入力')).toBeInTheDocument()
  })

  test('カスタム戦略が作成できる', async () => {
    // Arrange
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('カスタム戦略を作成')).toBeInTheDocument()
    })

    // Act
    fireEvent.click(screen.getByText('カスタム戦略を作成'))

    // モーダル内でフォーム入力
    fireEvent.change(screen.getByPlaceholderText('戦略名を入力'), {
      target: { value: 'テストカスタム戦略' },
    })
    fireEvent.change(screen.getByPlaceholderText('戦略の説明を入力'), {
      target: { value: 'テスト用のカスタム戦略です' },
    })

    // パラメータ調整（連鎖優先度を80に設定）
    const chainSlider = screen.getByLabelText('連鎖優先度')
    fireEvent.change(chainSlider, { target: { value: '80' } })

    // 作成ボタンをクリック
    fireEvent.click(screen.getByText('作成'))

    // Assert
    await waitFor(() => {
      expect(screen.getByText('テストカスタム戦略')).toBeInTheDocument()
    })
  })

  test('カスタム戦略を削除できる', async () => {
    // Arrange
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    // 先にカスタム戦略を作成
    await waitFor(() => {
      expect(screen.getByText('カスタム戦略を作成')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('カスタム戦略を作成'))
    fireEvent.change(screen.getByPlaceholderText('戦略名を入力'), {
      target: { value: 'テストカスタム戦略' },
    })
    fireEvent.change(screen.getByPlaceholderText('戦略の説明を入力'), {
      target: { value: 'テスト用' },
    })
    fireEvent.click(screen.getByText('作成'))

    await waitFor(() => {
      expect(screen.getByText('テストカスタム戦略')).toBeInTheDocument()
    })

    // Act
    const customStrategyItem = screen
      .getByText('テストカスタム戦略')
      .closest('[data-testid="strategy-item"]')!
    const deleteButton = customStrategyItem.querySelector(
      '[data-testid="delete-strategy"]',
    )!
    fireEvent.click(deleteButton)

    // 削除確認ダイアログで確認
    fireEvent.click(screen.getByText('削除'))

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('テストカスタム戦略')).not.toBeInTheDocument()
    })
  })

  test('デフォルト戦略は削除できない', async () => {
    // Arrange & Act
    render(
      <StrategySettings
        strategyService={mockStrategyService as unknown as StrategyService}
      />,
    )

    // Assert
    await waitFor(() => {
      const balancedStrategy = screen
        .getByText('バランス型')
        .closest('[data-testid="strategy-item"]')!
      expect(
        balancedStrategy.querySelector('[data-testid="delete-strategy"]'),
      ).not.toBeInTheDocument()
    })
  })

  test('ローディング状態が表示される', () => {
    // Arrange
    const loadingService = {
      getAllStrategies: vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      ),
      getActiveStrategy: vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 1000)),
      ),
    } as unknown as StrategyService

    // Act
    render(<StrategySettings strategyService={loadingService} />)

    // Assert
    expect(screen.getByText('戦略を読み込み中...')).toBeInTheDocument()
  })

  test('エラー状態が表示される', async () => {
    // Arrange
    const errorService = {
      getAllStrategies: vi.fn().mockRejectedValue(new Error('Network error')),
      getActiveStrategy: vi.fn().mockRejectedValue(new Error('Network error')),
    } as unknown as StrategyService

    // Act
    render(<StrategySettings strategyService={errorService} />)

    // Assert
    await waitFor(() => {
      expect(
        screen.getByText('戦略の読み込みに失敗しました'),
      ).toBeInTheDocument()
    })
  })
})
