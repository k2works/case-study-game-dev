import { describe, expect, it, vi } from 'vitest'

import { fireEvent, render, screen } from '@testing-library/react'

import type { AISettings } from '../../../domain/models/ai'
import { AIControlPanel } from './AIControlPanel'

describe('AIControlPanel', () => {
  const mockSettings: AISettings = {
    enabled: false,
    thinkingSpeed: 1000,
  }

  describe('基本表示', () => {
    it('AIコントロールパネルが正しくレンダリングされる', () => {
      // Arrange & Act
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={mockSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      expect(screen.getByText('🤖 AI自動プレイ')).toBeInTheDocument()
      expect(screen.getByText('AI自動プレイ')).toBeInTheDocument()
      expect(screen.getByText('思考速度')).toBeInTheDocument()
      expect(screen.getByText('1000ms')).toBeInTheDocument()
    })

    it('AI有効時に状態表示が表示される', () => {
      // Arrange & Act
      render(
        <AIControlPanel
          aiEnabled={true}
          aiSettings={mockSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      expect(
        screen.getByText('🤖 AI が自動でぷよを操作します'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('🔄 ゲームオーバー後も自動で再開します'),
      ).toBeInTheDocument()
    })

    it('AI無効時に状態表示が非表示になる', () => {
      // Arrange & Act
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={mockSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      expect(
        screen.queryByText('🤖 AI が自動でぷよを操作します'),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('🔄 ゲームオーバー後も自動で再開します'),
      ).not.toBeInTheDocument()
    })
  })

  describe('操作', () => {
    it('AIトグルボタンをクリックしてコールバックが呼ばれる', () => {
      // Arrange
      const mockToggle = vi.fn()
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={mockSettings}
          onToggleAI={mockToggle}
          onSettingsChange={vi.fn()}
        />,
      )

      // Act
      const toggleButton = screen.getByRole('button')
      fireEvent.click(toggleButton)

      // Assert
      expect(mockToggle).toHaveBeenCalledTimes(1)
    })

    it('思考速度スライダーを変更してコールバックが呼ばれる', () => {
      // Arrange
      const mockSettingsChange = vi.fn()
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={mockSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={mockSettingsChange}
        />,
      )

      // Act
      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '1500' } })

      // Assert
      expect(mockSettingsChange).toHaveBeenCalledWith({
        ...mockSettings,
        thinkingSpeed: 1500,
      })
    })

    it('異なる思考速度が正しく表示される', () => {
      // Arrange
      const customSettings: AISettings = {
        enabled: false,
        thinkingSpeed: 2000,
      }

      // Act
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={customSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      expect(screen.getByText('2000ms')).toBeInTheDocument()
      expect(screen.queryByText('1000ms')).not.toBeInTheDocument()
    })
  })

  describe('視覚的状態', () => {
    it('AI有効時にトグルボタンのスタイルが変わる', () => {
      // Arrange & Act
      render(
        <AIControlPanel
          aiEnabled={true}
          aiSettings={mockSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveClass('bg-blue-600')
    })

    it('AI無効時にトグルボタンのスタイルが正しい', () => {
      // Arrange & Act
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={mockSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      const toggleButton = screen.getByRole('button')
      expect(toggleButton).toHaveClass('bg-gray-600')
    })

    it('スライダーの値が正しく設定される', () => {
      // Arrange
      const customSettings: AISettings = {
        enabled: false,
        thinkingSpeed: 1500,
      }

      // Act
      render(
        <AIControlPanel
          aiEnabled={false}
          aiSettings={customSettings}
          onToggleAI={vi.fn()}
          onSettingsChange={vi.fn()}
        />,
      )

      // Assert
      const slider = screen.getByRole('slider') as HTMLInputElement
      expect(slider.value).toBe('1500')
    })
  })
})
