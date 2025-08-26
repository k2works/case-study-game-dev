/**
 * ModelVersionManager コンポーネントのテスト
 */
import { describe, expect, it, vi } from 'vitest'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type {
  ABTestResult,
  ModelPerformance,
} from '../../../domain/models/learning/ModelPerformanceMetrics'
import { ModelVersionManager } from './ModelVersionManager'

// モックデータ
const mockModels: ModelPerformance[] = [
  {
    modelId: 'model-1',
    modelVersion: '1.0.0',
    timestamp: new Date('2023-01-01'),
    trainingMetrics: {
      epochs: 100,
      finalLoss: 0.2,
      finalAccuracy: 0.9,
      convergenceEpoch: 80,
      trainingTime: 3600000,
      lossHistory: [1.0, 0.8, 0.6, 0.4, 0.2],
      accuracyHistory: [0.5, 0.6, 0.7, 0.8, 0.9],
    },
    validationMetrics: {
      validationLoss: 0.25,
      validationAccuracy: 0.88,
      overfittingScore: 0.1,
      stabilityScore: 0.95,
    },
    testMetrics: {
      testLoss: 0.3,
      testAccuracy: 0.85,
      gamePerformanceScore: 8500,
      chainEvaluationScore: 7.5,
      operationScore: 8.2,
      strategyScore: 7.8,
    },
    resourceMetrics: {
      modelSize: 1024 * 1024 * 5, // 5MB
      inferenceTime: 50,
      memoryUsage: 256 * 1024 * 1024, // 256MB
      gpuUtilization: 0.7,
    },
  },
  {
    modelId: 'model-2',
    modelVersion: '2.0.0',
    timestamp: new Date('2023-01-02'),
    trainingMetrics: {
      epochs: 120,
      finalLoss: 0.15,
      finalAccuracy: 0.92,
      convergenceEpoch: 90,
      trainingTime: 4200000,
      lossHistory: [1.0, 0.7, 0.5, 0.3, 0.15],
      accuracyHistory: [0.5, 0.65, 0.75, 0.85, 0.92],
    },
    validationMetrics: {
      validationLoss: 0.18,
      validationAccuracy: 0.91,
      overfittingScore: 0.05,
      stabilityScore: 0.98,
    },
    testMetrics: {
      testLoss: 0.2,
      testAccuracy: 0.89,
      gamePerformanceScore: 9200,
      chainEvaluationScore: 8.1,
      operationScore: 8.8,
      strategyScore: 8.3,
    },
    resourceMetrics: {
      modelSize: 1024 * 1024 * 7, // 7MB
      inferenceTime: 45,
      memoryUsage: 300 * 1024 * 1024, // 300MB
      gpuUtilization: 0.8,
    },
  },
]

const mockABTests: ABTestResult[] = [
  {
    testId: 'test-1',
    testName: 'Model v1 vs v2',
    startDate: new Date('2023-01-01'),
    endDate: new Date('2023-01-31'),
    modelA: mockModels[0],
    modelB: mockModels[1],
    comparison: {
      baselineModel: mockModels[0],
      comparisonModel: mockModels[1],
      improvementMetrics: {
        accuracyImprovement: 0.03,
        lossReduction: 0.07,
        gamePerformanceImprovement: 700,
        trainingSpeedImprovement: -0.167,
        modelSizeChange: 2 * 1024 * 1024,
      },
      significance: {
        pValue: 0.01,
        confidenceInterval: [0.01, 0.05],
        isSignificant: true,
        sampleSize: 200,
      },
    },
    winnerModel: 'model-2',
    confidenceLevel: 0.95,
  },
]

// モック関数
const mockOnModelSelect = vi.fn()
const mockOnStartABTest = vi.fn()
const mockOnStopABTest = vi.fn()
const mockOnCompareModels = vi.fn()

describe('ModelVersionManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('基本レンダリング', () => {
    it('コンポーネントが正常にレンダリングされる', () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={mockABTests}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      expect(screen.getByText('Model Version Manager')).toBeInTheDocument()
      expect(screen.getByText('Available Models')).toBeInTheDocument()
      expect(screen.getByText('A/B Tests')).toBeInTheDocument()
    })

    it('モデルが存在しない場合は空状態を表示する', () => {
      render(
        <ModelVersionManager
          models={[]}
          activeModelId=""
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      expect(screen.getByText('No Models Available')).toBeInTheDocument()
      expect(
        screen.getByText('Train your first model to get started'),
      ).toBeInTheDocument()
    })
  })

  describe('モデル表示', () => {
    it('全てのモデルが表示される', () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      expect(screen.getByText('model-1')).toBeInTheDocument()
      expect(screen.getByText('model-2')).toBeInTheDocument()
      expect(screen.getByText('v1.0.0')).toBeInTheDocument()
      expect(screen.getByText('v2.0.0')).toBeInTheDocument()
    })

    it('アクティブなモデルが正しく表示される', () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      // アクティブなモデルにはActiveラベルが表示される
      const activeLabels = screen.getAllByText('Active')
      expect(activeLabels).toHaveLength(2) // ラベルとボタンの2つ
    })

    it('モデル情報が正しく表示される', () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      // トレーニング精度
      expect(screen.getByText('Acc: 90.00%')).toBeInTheDocument()
      // バリデーション精度
      expect(screen.getByText('Acc: 88.00%')).toBeInTheDocument()
      // モデルサイズ
      expect(screen.getByText('Size: 5.0 MB')).toBeInTheDocument()
      // 推論時間
      expect(screen.getByText('Inference: 50ms')).toBeInTheDocument()
    })
  })

  describe('モデル選択機能', () => {
    it('モデル選択ボタンをクリックするとコールバックが呼ばれる', async () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      const selectButtons = screen.getAllByText('Select')
      fireEvent.click(selectButtons[0])

      await waitFor(() => {
        expect(mockOnModelSelect).toHaveBeenCalledWith('model-2')
      })
    })

    it('アクティブなモデルの選択ボタンは無効化される', () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      const activeButtons = screen
        .getAllByText('Active')
        .filter((button) => button.tagName === 'BUTTON')
      expect(activeButtons[0]).toBeDisabled()
    })
  })

  describe('モデル比較機能', () => {
    it('比較ボタンをクリックすると比較状態になる', async () => {
      mockOnCompareModels.mockResolvedValue({
        baselineModel: mockModels[0],
        comparisonModel: mockModels[1],
        improvementMetrics: {
          accuracyImprovement: 0.03,
          lossReduction: 0.07,
          gamePerformanceImprovement: 700,
          trainingSpeedImprovement: -0.167,
          modelSizeChange: 2 * 1024 * 1024,
        },
        significance: {
          pValue: 0.01,
          confidenceInterval: [0.01, 0.05],
          isSignificant: true,
          sampleSize: 200,
        },
      })

      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      const compareButtons = screen.getAllByText('Compare')

      // 最初のモデルを選択
      fireEvent.click(compareButtons[0])

      await waitFor(() => {
        expect(
          screen.getByText('Select another model to compare with model-2'),
        ).toBeInTheDocument()
      })

      // 2番目のモデルを選択して比較実行
      fireEvent.click(compareButtons[1])

      await waitFor(() => {
        expect(mockOnCompareModels).toHaveBeenCalledWith('model-2', 'model-1')
      })
    })
  })

  describe('A/Bテスト機能', () => {
    it('新しいA/Bテストフォームを表示/非表示できる', () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      const newTestButton = screen.getByText('New A/B Test')
      fireEvent.click(newTestButton)

      expect(screen.getByText('Create New A/B Test')).toBeInTheDocument()
      expect(screen.getByText('Test Name')).toBeInTheDocument()
      expect(screen.getByText('Model A')).toBeInTheDocument()
      expect(screen.getByText('Model B')).toBeInTheDocument()
    })

    it('A/Bテストを作成できる', async () => {
      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      // フォームを開く
      fireEvent.click(screen.getByText('New A/B Test'))

      // フォームに入力
      fireEvent.change(screen.getByPlaceholderText('Enter test name...'), {
        target: { value: 'Test Comparison' },
      })

      const modelASelect = screen.getByLabelText('Model A')
      const modelBSelect = screen.getByLabelText('Model B')

      fireEvent.change(modelASelect, { target: { value: 'model-1' } })
      fireEvent.change(modelBSelect, { target: { value: 'model-2' } })

      // テストを開始
      fireEvent.click(screen.getByText('Start Test'))

      await waitFor(() => {
        expect(mockOnStartABTest).toHaveBeenCalledWith(
          'model-1',
          'model-2',
          'Test Comparison',
        )
      })
    })

    it('アクティブなA/Bテストを表示する', () => {
      const activeTest = {
        ...mockABTests[0],
        startDate: new Date(Date.now() - 86400000), // 昨日開始
        endDate: new Date(Date.now() + 86400000), // 明日終了
      }

      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[activeTest]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      expect(screen.getByText('Model v1 vs v2')).toBeInTheDocument()
      expect(screen.getByText('model-1 vs model-2')).toBeInTheDocument()
      expect(screen.getByText('Winner: model-2')).toBeInTheDocument()
      expect(screen.getByText('Stop Test')).toBeInTheDocument()
    })

    it('A/Bテストを停止できる', async () => {
      const activeTest = {
        ...mockABTests[0],
        startDate: new Date(Date.now() - 86400000), // 昨日開始
        endDate: new Date(Date.now() + 86400000), // 明日終了
      }

      render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[activeTest]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
        />,
      )

      const stopButton = screen.getByText('Stop Test')
      fireEvent.click(stopButton)

      await waitFor(() => {
        expect(mockOnStopABTest).toHaveBeenCalledWith('test-1')
      })
    })
  })

  describe('プロップス処理', () => {
    it('カスタムクラス名を適用する', () => {
      const { container } = render(
        <ModelVersionManager
          models={mockModels}
          activeModelId="model-1"
          abTests={[]}
          onModelSelect={mockOnModelSelect}
          onStartABTest={mockOnStartABTest}
          onStopABTest={mockOnStopABTest}
          onCompareModels={mockOnCompareModels}
          className="custom-manager"
        />,
      )

      const managerElement = container.querySelector('.custom-manager')
      expect(managerElement).toBeInTheDocument()
    })
  })
})
