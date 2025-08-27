import React, { useCallback, useState } from 'react'

import type {
  LearningConfig,
  LearningResult,
  LearningService,
} from '../../application/services/learning/LearningService'
import type {
  ABTestResult,
  ModelComparison,
  ModelPerformance,
} from '../../domain/models/learning/ModelPerformanceMetrics'
import type { TrainingData } from '../../domain/models/training/TrainingData'

/**
 * A/Bテスト結果を作成するヘルパー関数
 */
function createABTestResult(
  models: ModelPerformance[],
  modelAId: string,
  modelBId: string,
  testName: string,
): ABTestResult | null {
  const modelA = models.find((m) => m.modelId === modelAId)
  const modelB = models.find((m) => m.modelId === modelBId)

  if (!modelA || !modelB) {
    console.error('Selected models not found')
    return null
  }

  return {
    testId: `test-${Date.now()}`,
    testName,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日間
    modelA,
    modelB,
    comparison: (() => {
      const comparison = createModelComparison(modelA, modelB)
      return {
        baselineModel: modelA,
        comparisonModel: modelB,
        improvementMetrics: comparison.improvementMetrics,
        significance: comparison.significance,
      }
    })(),
    winnerModel: Math.random() > 0.5 ? modelAId : modelBId,
    confidenceLevel: 0.95,
  }
}

/**
 * モデル比較結果を作成するヘルパー関数
 */
function createModelComparison(
  modelA: ModelPerformance,
  modelB: ModelPerformance,
) {
  return {
    improvementMetrics: {
      accuracyImprovement:
        modelB.validationMetrics.validationAccuracy -
        modelA.validationMetrics.validationAccuracy,
      lossReduction:
        modelA.validationMetrics.validationLoss -
        modelB.validationMetrics.validationLoss,
      gamePerformanceImprovement:
        (modelB.testMetrics?.gamePerformanceScore || 0) -
        (modelA.testMetrics?.gamePerformanceScore || 0),
      trainingSpeedImprovement:
        (modelA.trainingMetrics.trainingTime -
          modelB.trainingMetrics.trainingTime) /
        modelA.trainingMetrics.trainingTime,
      modelSizeChange:
        modelB.resourceMetrics.modelSize - modelA.resourceMetrics.modelSize,
    },
    significance: {
      pValue: Math.random() * 0.1, // モック値
      confidenceInterval: [0.01, 0.05] as [number, number],
      isSignificant: Math.random() > 0.5,
      sampleSize: 200,
    },
  }
}

/**
 * 学習システムの状態と操作を管理するカスタムフック
 */
export const useLearningSystem = (learningService: LearningService) => {
  // 学習システム状態管理
  const [currentTab, setCurrentTab] = useState<'game' | 'learning'>('game')
  const [isLearning, setIsLearning] = useState(false)
  const [learningProgress, setLearningProgress] = useState(0)
  const [currentModel, setCurrentModel] = useState('mayah-ai-v1')
  const [latestPerformance, setLatestPerformance] =
    useState<ModelPerformance | null>(null)
  const [learningHistory, setLearningHistory] = useState<
    readonly LearningResult[]
  >([])

  // 新機能の状態管理
  const [models, setModels] = useState<ModelPerformance[]>([])
  const [abTests, setAbTests] = useState<ABTestResult[]>([])

  // モックデータの生成（実際の実装では適切なデータソースから取得）
  const generateMockModels = useCallback(() => {
    const mockModels: ModelPerformance[] = [
      {
        modelId: 'mayah-ai-v1',
        modelVersion: '1.0.0',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7日前
        trainingMetrics: {
          epochs: 100,
          finalLoss: 0.25,
          finalAccuracy: 0.82,
          convergenceEpoch: 75,
          trainingTime: 3600000,
          lossHistory: [1.0, 0.8, 0.6, 0.4, 0.25],
          accuracyHistory: [0.5, 0.6, 0.7, 0.75, 0.82],
        },
        validationMetrics: {
          validationLoss: 0.3,
          validationAccuracy: 0.8,
          overfittingScore: 0.15,
          stabilityScore: 0.9,
        },
        testMetrics: {
          testLoss: 0.32,
          testAccuracy: 0.78,
          gamePerformanceScore: 7800,
          chainEvaluationScore: 7.2,
          operationScore: 7.8,
          strategyScore: 7.1,
        },
        resourceMetrics: {
          modelSize: 1024 * 1024 * 4, // 4MB
          inferenceTime: 60,
          memoryUsage: 200 * 1024 * 1024,
          gpuUtilization: 0.6,
        },
      },
      {
        modelId: 'mayah-ai-v2',
        modelVersion: '2.0.0',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2日前
        trainingMetrics: {
          epochs: 120,
          finalLoss: 0.18,
          finalAccuracy: 0.89,
          convergenceEpoch: 95,
          trainingTime: 4200000,
          lossHistory: [1.0, 0.7, 0.5, 0.3, 0.18],
          accuracyHistory: [0.5, 0.65, 0.75, 0.82, 0.89],
        },
        validationMetrics: {
          validationLoss: 0.22,
          validationAccuracy: 0.87,
          overfittingScore: 0.08,
          stabilityScore: 0.95,
        },
        testMetrics: {
          testLoss: 0.25,
          testAccuracy: 0.85,
          gamePerformanceScore: 8900,
          chainEvaluationScore: 8.5,
          operationScore: 8.7,
          strategyScore: 8.2,
        },
        resourceMetrics: {
          modelSize: 1024 * 1024 * 6, // 6MB
          inferenceTime: 45,
          memoryUsage: 280 * 1024 * 1024,
          gpuUtilization: 0.8,
        },
      },
    ]
    setModels(mockModels)

    if (mockModels.length > 0) {
      setLatestPerformance(mockModels[mockModels.length - 1])
    }
  }, [])

  // 学習システムハンドラー
  const handleStartLearning = useCallback(
    async (config: LearningConfig) => {
      try {
        setIsLearning(true)
        setLearningProgress(0)

        // 学習設定の詳細ログ出力
        console.log('useLearningSystem: Learning configuration', {
          config,
          dateRange: {
            start: config.dataRange.startDate.toISOString(),
            end: config.dataRange.endDate.toISOString(),
            daysDiff:
              (config.dataRange.endDate.getTime() -
                config.dataRange.startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          },
        })

        // 学習開始
        const result = await learningService.startLearning(config)

        if (result.success) {
          // 学習履歴を更新
          setLearningHistory((prev) => [...prev, result])

          // 最新の性能データを更新（モック）
          const mockPerformance: ModelPerformance = {
            modelId: currentModel,
            modelVersion: '1.0.0',
            timestamp: new Date(),
            trainingMetrics: {
              epochs: config.epochs,
              finalLoss: 0.15,
              finalAccuracy: 0.85,
              convergenceEpoch: Math.floor(config.epochs * 0.8),
              trainingTime: 120000,
              lossHistory: Array.from(
                { length: config.epochs },
                (_, i) => 0.9 - (i / config.epochs) * 0.75,
              ),
              accuracyHistory: Array.from(
                { length: config.epochs },
                (_, i) => 0.1 + (i / config.epochs) * 0.75,
              ),
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
          setLatestPerformance(mockPerformance)
        }
      } catch (error) {
        console.error('Learning failed:', error)
      } finally {
        setIsLearning(false)
        setLearningProgress(100)
      }
    },
    [learningService, currentModel],
  )

  const handleStopLearning = useCallback(() => {
    setIsLearning(false)
    setLearningProgress(0)
  }, [])

  const handleModelSelect = useCallback(
    (modelId: string) => {
      setCurrentModel(modelId)
      // 選択されたモデルの最新パフォーマンスを設定
      const selectedModel = models.find((m) => m.modelId === modelId)
      if (selectedModel) {
        setLatestPerformance(selectedModel)
      }
    },
    [models],
  )

  // 新機能のハンドラー
  const handleStartABTest = useCallback(
    (modelAId: string, modelBId: string, testName: string) => {
      const newTest = createABTestResult(models, modelAId, modelBId, testName)
      if (newTest) {
        setAbTests((prev) => [...prev, newTest])
      }
    },
    [models],
  )

  const handleStopABTest = useCallback((testId: string) => {
    setAbTests((prev) => prev.filter((test) => test.testId !== testId))
  }, [])

  const handleCompareModels = useCallback(
    async (
      modelAId: string,
      modelBId: string,
    ): Promise<ModelComparison | null> => {
      const modelA = models.find((m) => m.modelId === modelAId)
      const modelB = models.find((m) => m.modelId === modelBId)

      if (!modelA || !modelB) {
        return null
      }

      return {
        baselineModel: modelA,
        comparisonModel: modelB,
        improvementMetrics: {
          accuracyImprovement:
            modelB.validationMetrics.validationAccuracy -
            modelA.validationMetrics.validationAccuracy,
          lossReduction:
            modelA.validationMetrics.validationLoss -
            modelB.validationMetrics.validationLoss,
          gamePerformanceImprovement:
            (modelB.testMetrics?.gamePerformanceScore || 0) -
            (modelA.testMetrics?.gamePerformanceScore || 0),
          trainingSpeedImprovement:
            (modelA.trainingMetrics.trainingTime -
              modelB.trainingMetrics.trainingTime) /
            modelA.trainingMetrics.trainingTime,
          modelSizeChange:
            modelB.resourceMetrics.modelSize - modelA.resourceMetrics.modelSize,
        },
        significance: {
          pValue: Math.random() * 0.1, // モック値
          confidenceInterval: [0.01, 0.05],
          isSignificant: Math.random() > 0.5,
          sampleSize: 200,
        },
      }
    },
    [models],
  )

  // 初期化
  React.useEffect(() => {
    const initializeServices = async () => {
      try {
        // データベース初期化 - IndexedDBリポジトリを直接初期化
        const { IndexedDBTrainingDataRepository } = await import(
          '../../infrastructure/adapters/learning/IndexedDBRepository'
        )
        const repository = new IndexedDBTrainingDataRepository()
        await repository.initialize()

        console.log('Database initialized successfully')

        // 本番環境のみデータベースをクリアして新しいモックデータを生成
        if (typeof window !== 'undefined' && window.indexedDB) {
          await repository.clear()
          console.log('Database cleared for fresh start')

          // 学習用モックデータを生成して保存
          await generateAndSaveTrainingData(repository)

          const finalCount = await repository.count()
          console.log('Final data count in database:', finalCount)
        } else {
          console.log('IndexedDB not available - skipping data generation')
        }
      } catch (error) {
        console.warn('Failed to initialize database:', error)
        // データベース初期化失敗は警告として扱い、モックデータで継続
      }

      // モックデータの初期化
      generateMockModels()
    }

    initializeServices()
  }, [generateMockModels])

  /**
   * 学習用のモックデータを生成してIndexedDBに保存
   */
  const generateAndSaveTrainingData = async (repository: {
    count: () => Promise<number>
    save: (data: TrainingData) => Promise<void>
    clear: () => Promise<void>
  }) => {
    try {
      // 既存データの確認
      const existingCount = await repository.count()
      console.log('Existing training data count:', existingCount)

      // データベーススキーマが更新されたため、データを再生成
      if (existingCount > 0) {
        console.log('Clearing existing data to regenerate with new schema...')
        await repository.clear()
      }

      // モックデータ生成
      const { MockTrainingDataGenerator } = await import(
        '../../test/helpers/mockTrainingDataGenerator'
      )

      // 過去30日間のデータを生成（学習で使用するのは過去7日間だが、より多くのデータを用意）
      const endDate = new Date()
      const startDate = new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)

      console.log('Generating training data for date range:', {
        startDate,
        endDate,
      })

      const mockData = MockTrainingDataGenerator.generateDataForDateRange(
        startDate,
        endDate,
        20, // 1日あたり20サンプル = 合計600サンプル
      )

      console.log(`Generated ${mockData.length} training data samples`)

      // バッチで保存
      const batchSize = 50
      for (let i = 0; i < mockData.length; i += batchSize) {
        const batch = mockData.slice(i, i + batchSize)
        const savePromises = batch.map((data) => repository.save(data))
        await Promise.all(savePromises)
        console.log(
          `Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(mockData.length / batchSize)}`,
        )
      }

      console.log('Training data generation and saving completed')

      // 保存後の確認
      const finalCount = await repository.count()
      console.log('Final training data count:', finalCount)
    } catch (error) {
      console.error('Failed to generate training data:', error)
    }
  }

  return {
    // 状態
    currentTab,
    setCurrentTab,
    isLearning,
    learningProgress,
    currentModel,
    latestPerformance,
    learningHistory,
    models,
    abTests,
    // ハンドラー
    handleStartLearning,
    handleStopLearning,
    handleModelSelect,
    handleStartABTest,
    handleStopABTest,
    handleCompareModels,
  }
}
