import { fireEvent, render, screen } from '@testing-library/react'

import type { LearningResult } from '../../../application/services/learning/LearningService'
import type { ModelPerformance } from '../../../domain/models/learning/ModelPerformanceMetrics'
import { LearningDashboard } from './LearningDashboard'

// モックデータ
const mockModelPerformance: ModelPerformance = {
  modelId: 'test-model-1',
  modelVersion: '1.0.0',
  timestamp: new Date('2025-01-01'),
  trainingMetrics: {
    epochs: 50,
    finalLoss: 0.15,
    finalAccuracy: 0.85,
    convergenceEpoch: 35,
    trainingTime: 120000,
    lossHistory: [0.9, 0.7, 0.5, 0.3, 0.15],
    accuracyHistory: [0.1, 0.3, 0.5, 0.7, 0.85],
  },
  validationMetrics: {
    validationLoss: 0.18,
    validationAccuracy: 0.82,
    overfittingScore: 0.12,
    stabilityScore: 0.88,
  },
  testMetrics: {
    testLoss: 0.16,
    testAccuracy: 0.83,
    gamePerformanceScore: 85,
    chainEvaluationScore: 82,
    operationScore: 88,
    strategyScore: 86,
  },
  resourceMetrics: {
    modelSize: 2048000,
    inferenceTime: 25,
    memoryUsage: 134217728,
    gpuUtilization: 0.75,
  },
}

const mockLearningHistory: LearningResult[] = [
  {
    success: true,
    modelPath: '/models/test-model-1',
    statistics: Object.freeze({
      totalSamples: 1000,
      trainingAccuracy: 0.85,
      validationAccuracy: 0.82,
      trainingTime: 120000,
      modelSize: 2048000,
    }),
  },
  {
    success: true,
    modelPath: '/models/test-model-2',
    statistics: Object.freeze({
      totalSamples: 1500,
      trainingAccuracy: 0.88,
      validationAccuracy: 0.84,
      trainingTime: 180000,
      modelSize: 2560000,
    }),
  },
]

const defaultProps = {
  isLearning: false,
  learningProgress: 0,
  currentModel: 'test-model',
  latestPerformance: mockModelPerformance,
  learningHistory: mockLearningHistory,
  onStartLearning: vi.fn(),
  onStopLearning: vi.fn(),
  onModelSelect: vi.fn(),
}

describe('LearningDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('コンポーネントのレンダリング', () => {
    test('基本的なコンポーネントが表示される', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: 主要な要素が表示されることを確認
      expect(screen.getByText('🧠 AI学習ダッシュボード')).toBeInTheDocument()
      expect(screen.getByText('現在のモデル:')).toBeInTheDocument()
      expect(screen.getByText('test-model')).toBeInTheDocument()
      expect(screen.getByText('⚙️ 学習設定')).toBeInTheDocument()
      expect(screen.getByText('📊 現在のモデル性能')).toBeInTheDocument()
    })

    test('学習していない状態では開始ボタンが表示される', () => {
      // Act: 学習停止状態でレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: 学習開始ボタンが表示されることを確認
      expect(screen.getByText('🚀 学習開始')).toBeInTheDocument()
      expect(screen.queryByText('⏹️ 学習停止')).not.toBeInTheDocument()
    })

    test('学習中は停止ボタンと進捗バーが表示される', () => {
      // Arrange: 学習中の状態を設定
      const learningProps = {
        ...defaultProps,
        isLearning: true,
        learningProgress: 45,
      }

      // Act: 学習中状態でレンダリング
      render(<LearningDashboard {...learningProps} />)

      // Assert: 学習停止ボタンと進捗表示が表示されることを確認
      expect(screen.getByText('⏹️ 学習停止')).toBeInTheDocument()
      expect(screen.queryByText('🚀 学習開始')).not.toBeInTheDocument()
      expect(screen.getByText('学習中')).toBeInTheDocument()
      expect(screen.getByText('45%')).toBeInTheDocument()
    })
  })

  describe('学習設定フォーム', () => {
    test('エポック数を変更できる', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Act: エポック数を変更
      const epochsInput = screen.getByDisplayValue('50')
      fireEvent.change(epochsInput, { target: { value: '100' } })

      // Assert: 値が変更されることを確認
      expect(epochsInput).toHaveValue(100)
    })

    test('学習率を変更できる', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Act: 学習率を変更
      const learningRateInput = screen.getByDisplayValue('0.001')
      fireEvent.change(learningRateInput, { target: { value: '0.01' } })

      // Assert: 値が変更されることを確認
      expect(learningRateInput).toHaveValue(0.01)
    })

    test('バッチサイズを選択できる', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Act: バッチサイズを変更
      const batchSizeSelect = screen.getByDisplayValue('32')
      fireEvent.change(batchSizeSelect, { target: { value: '64' } })

      // Assert: 値が変更されることを確認
      expect(batchSizeSelect).toHaveValue('64')
    })

    test('詳細設定を表示・非表示できる', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: 初期状態では詳細設定が非表示
      expect(screen.queryByText('検証用データ分割比率')).not.toBeInTheDocument()

      // Act: 詳細設定ボタンをクリック
      fireEvent.click(screen.getByText('詳細設定を表示'))

      // Assert: 詳細設定が表示される
      expect(screen.getByText('検証用データ分割比率')).toBeInTheDocument()
      expect(screen.getByText('モデルアーキテクチャ')).toBeInTheDocument()
      expect(screen.getByText('最大サンプル数')).toBeInTheDocument()

      // Act: 詳細設定を隠すボタンをクリック
      fireEvent.click(screen.getByText('詳細設定を隠す'))

      // Assert: 詳細設定が非表示になる
      expect(screen.queryByText('検証用データ分割比率')).not.toBeInTheDocument()
    })
  })

  describe('学習制御', () => {
    test('学習開始ボタンクリックでコールバックが呼ばれる', () => {
      // Arrange: モックコールバックを準備
      const onStartLearning = vi.fn()
      const props = { ...defaultProps, onStartLearning }

      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...props} />)

      // Act: 学習開始ボタンをクリック
      fireEvent.click(screen.getByText('🚀 学習開始'))

      // Assert: コールバックが正しい設定で呼ばれることを確認
      expect(onStartLearning).toHaveBeenCalledTimes(1)
      const calledConfig = onStartLearning.mock.calls[0][0]
      expect(calledConfig).toMatchObject({
        epochs: 50,
        learningRate: 0.001,
        batchSize: 32,
        validationSplit: 0.2,
        modelArchitecture: 'dense',
        maxSamples: 1000,
        shuffle: true,
        normalizeRewards: true,
      })
      expect(calledConfig.dataRange.startDate).toBeInstanceOf(Date)
      expect(calledConfig.dataRange.endDate).toBeInstanceOf(Date)
    })

    test('学習停止ボタンクリックでコールバックが呼ばれる', () => {
      // Arrange: 学習中の状態でモックコールバックを準備
      const onStopLearning = vi.fn()
      const props = {
        ...defaultProps,
        isLearning: true,
        onStopLearning,
      }

      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...props} />)

      // Act: 学習停止ボタンをクリック
      fireEvent.click(screen.getByText('⏹️ 学習停止'))

      // Assert: コールバックが呼ばれることを確認
      expect(onStopLearning).toHaveBeenCalledTimes(1)
    })

    test('学習中は設定項目が無効になる', () => {
      // Arrange: 学習中の状態を準備
      const learningProps = {
        ...defaultProps,
        isLearning: true,
      }

      // Act: 学習中状態でレンダリング
      render(<LearningDashboard {...learningProps} />)

      // Assert: フォーム要素が無効化されることを確認
      expect(screen.getByDisplayValue('50')).toBeDisabled() // エポック数
      expect(screen.getByDisplayValue('0.001')).toBeDisabled() // 学習率
      expect(screen.getByDisplayValue('32')).toBeDisabled() // バッチサイズ
    })
  })

  describe('パフォーマンスメトリクス表示', () => {
    test('モデル性能が正しく表示される', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: 学習メトリクスが表示される
      expect(screen.getByText('85.0%')).toBeInTheDocument() // 最終精度
      expect(screen.getByText('0.1500')).toBeInTheDocument() // 最終損失
      expect(screen.getByText('50')).toBeInTheDocument() // エポック数
      const trainingTimeElements = screen.getAllByText('120秒')
      expect(trainingTimeElements.length).toBeGreaterThanOrEqual(1) // 学習時間（複数箇所に表示される可能性）

      // Assert: 検証メトリクスが表示される
      const validationAccuracyElements = screen.getAllByText('82.0%')
      expect(validationAccuracyElements.length).toBeGreaterThanOrEqual(1) // 検証精度（複数箇所に表示される可能性）
      expect(screen.getByText('0.1800')).toBeInTheDocument() // 検証損失

      // Assert: リソースメトリクスが表示される
      expect(screen.getByText('2.0 MB')).toBeInTheDocument() // モデルサイズ
      expect(screen.getByText('25ms')).toBeInTheDocument() // 推論時間
      expect(screen.getByText('128.0 MB')).toBeInTheDocument() // メモリ使用量
      expect(screen.getByText('75.0%')).toBeInTheDocument() // GPU使用率
    })

    test('パフォーマンスデータがない場合メッセージが表示される', () => {
      // Arrange: パフォーマンスデータなしの状態
      const props = {
        ...defaultProps,
        latestPerformance: null,
      }

      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...props} />)

      // Assert: データなしメッセージが表示される
      expect(
        screen.getByText('モデル性能データがありません'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('学習を実行してモデル性能を確認してください'),
      ).toBeInTheDocument()
    })
  })

  describe('学習履歴表示', () => {
    test('学習履歴が正しく表示される', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: 履歴テーブルの内容が表示される
      expect(screen.getByText('test-model-1')).toBeInTheDocument()
      expect(screen.getByText('test-model-2')).toBeInTheDocument()
      const accuracyElements82 = screen.getAllByText('82.0%')
      expect(accuracyElements82.length).toBeGreaterThanOrEqual(1) // 最初のモデルの精度（複数箇所に表示される可能性）
      expect(screen.getByText('84.0%')).toBeInTheDocument() // 2番目のモデルの精度
      expect(screen.getByText('1,000')).toBeInTheDocument() // サンプル数
      expect(screen.getByText('1,500')).toBeInTheDocument() // サンプル数

      // Assert: 成功状態が表示される
      const successBadges = screen.getAllByText('成功')
      expect(successBadges).toHaveLength(2)
    })

    test('学習履歴がない場合メッセージが表示される', () => {
      // Arrange: 履歴なしの状態
      const props = {
        ...defaultProps,
        learningHistory: [],
      }

      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...props} />)

      // Assert: データなしメッセージが表示される
      expect(screen.getByText('学習履歴がありません')).toBeInTheDocument()
      expect(
        screen.getByText('学習を実行すると履歴が表示されます'),
      ).toBeInTheDocument()
    })
  })

  describe('アクセシビリティ', () => {
    test('フォーム要素に適切なラベルが設定されている', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: 各入力フィールドにラベルが関連付けられている
      expect(screen.getByLabelText('エポック数')).toBeInTheDocument()
      expect(screen.getByLabelText('学習率')).toBeInTheDocument()
      expect(screen.getByLabelText('バッチサイズ')).toBeInTheDocument()
    })

    test('ボタンにわかりやすいテキストが設定されている', () => {
      // Act: ダッシュボードをレンダリング
      render(<LearningDashboard {...defaultProps} />)

      // Assert: ボタンに説明的なテキストが設定されている
      expect(
        screen.getByRole('button', { name: '🚀 学習開始' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: '詳細設定を表示' }),
      ).toBeInTheDocument()
    })
  })
})
