import {
  type ABTestResult,
  type ModelPerformance,
  ModelPerformanceMetrics,
  type ResourceMetrics,
  type TestMetrics,
  type TrainingMetrics,
  type ValidationMetrics,
} from './ModelPerformanceMetrics'

describe('ModelPerformanceMetrics', () => {
  let metrics: ModelPerformanceMetrics

  beforeEach(() => {
    metrics = new ModelPerformanceMetrics()
  })

  afterEach(() => {
    metrics.clearData()
  })

  const createMockModelPerformance = (
    modelId: string,
    accuracy: number,
    loss: number,
    timestamp: Date = new Date(),
  ): ModelPerformance => ({
    modelId,
    modelVersion: '1.0.0',
    timestamp,
    trainingMetrics: {
      epochs: 10,
      finalLoss: loss,
      finalAccuracy: accuracy,
      convergenceEpoch: 8,
      trainingTime: 1000,
      lossHistory: [0.9, 0.8, 0.7, 0.6, loss],
      accuracyHistory: [0.1, 0.2, 0.3, 0.4, accuracy],
    } as TrainingMetrics,
    validationMetrics: {
      validationLoss: loss + 0.1,
      validationAccuracy: accuracy - 0.05,
      overfittingScore: 0.15,
      stabilityScore: 0.85,
    } as ValidationMetrics,
    testMetrics: {
      testLoss: loss + 0.05,
      testAccuracy: accuracy - 0.02,
      gamePerformanceScore: accuracy * 100,
      chainEvaluationScore: 85,
      operationScore: 90,
      strategyScore: 88,
    } as TestMetrics,
    resourceMetrics: {
      modelSize: 1024 * 1024,
      inferenceTime: 50,
      memoryUsage: 512 * 1024 * 1024,
      gpuUtilization: 0.75,
    } as ResourceMetrics,
  })

  describe('性能データの管理', () => {
    test('性能データを追加できる', () => {
      // Arrange: 性能データの準備
      const performance = createMockModelPerformance('model-1', 0.85, 0.3)

      // Act: 性能データの追加
      metrics.addPerformance(performance)

      // Assert: データが正しく追加されていることを確認
      const latest = metrics.getLatestPerformance('model-1')
      expect(latest).toEqual(performance)
    })

    test('複数の性能データを追加できる', () => {
      // Arrange: 複数の性能データを準備
      const performance1 = createMockModelPerformance(
        'model-1',
        0.8,
        0.4,
        new Date('2025-01-01'),
      )
      const performance2 = createMockModelPerformance(
        'model-1',
        0.85,
        0.3,
        new Date('2025-01-02'),
      )

      // Act: 複数データの追加
      metrics.addPerformance(performance1)
      metrics.addPerformance(performance2)

      // Assert: 最新のデータが返されることを確認
      const latest = metrics.getLatestPerformance('model-1')
      expect(latest).toEqual(performance2)
    })

    test('存在しないモデルの最新性能はnullを返す', () => {
      // Act: 存在しないモデルの性能データを取得
      const latest = metrics.getLatestPerformance('non-existent-model')

      // Assert: nullが返されることを確認
      expect(latest).toBeNull()
    })

    test('性能履歴を時系列順に取得できる', () => {
      // Arrange: 時系列データを準備
      const performance1 = createMockModelPerformance(
        'model-1',
        0.8,
        0.4,
        new Date('2025-01-02'),
      )
      const performance2 = createMockModelPerformance(
        'model-1',
        0.85,
        0.3,
        new Date('2025-01-01'),
      )
      const performance3 = createMockModelPerformance(
        'model-1',
        0.9,
        0.2,
        new Date('2025-01-03'),
      )

      // Act: データを順不同で追加
      metrics.addPerformance(performance1)
      metrics.addPerformance(performance2)
      metrics.addPerformance(performance3)

      // Assert: 時系列順に取得されることを確認
      const history = metrics.getPerformanceHistory('model-1')
      expect(history).toHaveLength(3)
      expect(history[0]).toEqual(performance2) // 2025-01-01
      expect(history[1]).toEqual(performance1) // 2025-01-02
      expect(history[2]).toEqual(performance3) // 2025-01-03
    })
  })

  describe('モデル比較機能', () => {
    test('2つのモデルを比較できる', () => {
      // Arrange: 比較用モデルデータを準備
      const modelA = createMockModelPerformance('model-a', 0.8, 0.4)
      const modelB = createMockModelPerformance('model-b', 0.85, 0.3)

      metrics.addPerformance(modelA)
      metrics.addPerformance(modelB)

      // Act: モデル比較を実行
      const comparison = metrics.compareModels('model-a', 'model-b')

      // Assert: 比較結果が正しく生成されることを確認
      expect(comparison).not.toBeNull()
      expect(comparison!.baselineModel).toEqual(modelA)
      expect(comparison!.comparisonModel).toEqual(modelB)
      expect(comparison!.improvementMetrics).toBeDefined()
      expect(comparison!.significance).toBeDefined()
    })

    test('存在しないモデルの比較はnullを返す', () => {
      // Act: 存在しないモデル同士の比較
      const comparison = metrics.compareModels('model-a', 'model-b')

      // Assert: nullが返されることを確認
      expect(comparison).toBeNull()
    })

    test('改善メトリクスが正しく計算される', () => {
      // Arrange: ベースラインと比較モデルを準備
      const baseline = createMockModelPerformance('baseline', 0.8, 0.4)
      const improved = createMockModelPerformance('improved', 0.85, 0.3)

      // Act: 改善メトリクスを計算
      const improvement = metrics.calculateImprovement(baseline, improved)

      // Assert: 改善値が正しく計算されることを確認
      expect(improvement.accuracyImprovement).toBeCloseTo(0.05, 2) // validation accuracy差 (0.80 - 0.05) vs (0.85 - 0.05)
      expect(improvement.lossReduction).toBeCloseTo(0.1, 2) // loss reduction (0.4 + 0.1) vs (0.3 + 0.1)
      expect(improvement.gamePerformanceImprovement).toBeCloseTo(5, 1) // game score差 (88-83=5)
      expect(improvement.trainingSpeedImprovement).toBe(0) // 同じ訓練時間
      expect(improvement.modelSizeChange).toBe(0) // 同じモデルサイズ
    })
  })

  describe('統計的有意性検定', () => {
    test('統計的有意性を正しく計算できる', () => {
      // Arrange: 統計的に有意な差がある2つのグループを準備
      const baselineScores = [0.8, 0.82, 0.79, 0.81, 0.8]
      const comparisonScores = [0.85, 0.87, 0.84, 0.86, 0.85]

      // Act: 統計的有意性を計算
      const significance = metrics.calculateStatisticalSignificance(
        baselineScores,
        comparisonScores,
      )

      // Assert: 統計的有意性の結果を確認
      expect(significance.pValue).toBeLessThanOrEqual(1.0)
      expect(significance.pValue).toBeGreaterThanOrEqual(0.0)
      expect(significance.confidenceInterval).toHaveLength(2)
      expect(significance.confidenceInterval[0]).toBeLessThanOrEqual(
        significance.confidenceInterval[1],
      )
      expect(significance.sampleSize).toBe(10)
      expect(typeof significance.isSignificant).toBe('boolean')
    })

    test('同じ値のグループは有意差なしとなる', () => {
      // Arrange: 同じ値のグループを準備
      const identicalScores = [0.8, 0.8, 0.8, 0.8, 0.8]

      // Act: 統計的有意性を計算
      const significance = metrics.calculateStatisticalSignificance(
        identicalScores,
        identicalScores,
      )

      // Assert: 有意差がないことを確認
      expect(significance.isSignificant).toBe(false)
      expect(significance.pValue).toBeGreaterThan(0.05)
    })
  })

  describe('学習曲線生成', () => {
    test('学習曲線を正しく生成できる', () => {
      // Arrange: 学習データを準備
      const performance = createMockModelPerformance('model-1', 0.85, 0.3)

      // Act: 学習曲線を生成
      const learningCurve = metrics.generateLearningCurve(performance)

      // Assert: 学習曲線データを確認
      expect(learningCurve.epochs).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      expect(learningCurve.trainLoss).toEqual(
        performance.trainingMetrics.lossHistory,
      )
      expect(learningCurve.trainAccuracy).toEqual(
        performance.trainingMetrics.accuracyHistory,
      )
      expect(learningCurve.validationLoss).toEqual(
        performance.trainingMetrics.lossHistory,
      ) // Would need separate validation history in production
      expect(learningCurve.validationAccuracy).toEqual(
        performance.trainingMetrics.accuracyHistory,
      ) // Would need separate validation history in production
    })
  })

  describe('性能トレンド分析', () => {
    test('性能トレンドを正しく生成できる', () => {
      // Arrange: 複数の時系列性能データを準備
      const performance1 = createMockModelPerformance(
        'model-1',
        0.8,
        0.4,
        new Date('2025-01-01'),
      )
      const performance2 = createMockModelPerformance(
        'model-1',
        0.85,
        0.3,
        new Date('2025-01-02'),
      )
      const performance3 = createMockModelPerformance(
        'model-1',
        0.9,
        0.2,
        new Date('2025-01-03'),
      )

      metrics.addPerformance(performance1)
      metrics.addPerformance(performance2)
      metrics.addPerformance(performance3)

      // Act: 性能トレンドを取得
      const trend = metrics.getPerformanceTrend('model-1')

      // Assert: トレンドデータを確認
      expect(trend.timePoints).toHaveLength(3)
      expect(trend.accuracyTrend[0]).toBeCloseTo(0.75, 2)
      expect(trend.accuracyTrend[1]).toBeCloseTo(0.8, 2)
      expect(trend.accuracyTrend[2]).toBeCloseTo(0.85, 2)
      expect(trend.lossTrend[0]).toBeCloseTo(0.5, 2)
      expect(trend.lossTrend[1]).toBeCloseTo(0.4, 2)
      expect(trend.lossTrend[2]).toBeCloseTo(0.3, 2)
      expect(trend.gameScoreTrend).toEqual([80, 85, 90]) // testAccuracy * 100
      expect(trend.modelSizeTrend).toEqual([1048576, 1048576, 1048576]) // same model size
    })

    test('データがないモデルは空のトレンドを返す', () => {
      // Act: 存在しないモデルのトレンドを取得
      const trend = metrics.getPerformanceTrend('non-existent-model')

      // Assert: 空のトレンドが返されることを確認
      expect(trend.timePoints).toEqual([])
      expect(trend.accuracyTrend).toEqual([])
      expect(trend.lossTrend).toEqual([])
      expect(trend.gameScoreTrend).toEqual([])
      expect(trend.modelSizeTrend).toEqual([])
    })
  })

  describe('A/Bテスト機能', () => {
    test('A/Bテスト結果を追加できる', () => {
      // Arrange: A/Bテスト結果を準備
      const modelA = createMockModelPerformance('model-a', 0.8, 0.4)
      const modelB = createMockModelPerformance('model-b', 0.85, 0.3)

      const abTestResult: ABTestResult = {
        testId: 'test-001',
        testName: 'Model A vs Model B Performance Test',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-07'),
        modelA,
        modelB,
        comparison: {
          baselineModel: modelA,
          comparisonModel: modelB,
          improvementMetrics: metrics.calculateImprovement(modelA, modelB),
          significance: metrics.calculateStatisticalSignificance(
            [0.8, 0.82, 0.79],
            [0.85, 0.87, 0.84],
          ),
        },
        winnerModel: 'model-b',
        confidenceLevel: 0.95,
      }

      // Act: A/Bテスト結果を追加
      metrics.addABTestResult(abTestResult)

      // Assert: A/Bテスト結果が正しく保存されることを確認
      const results = metrics.getABTestResults()
      expect(results).toHaveLength(1)
      expect(results[0]).toEqual(abTestResult)
    })

    test('アクティブなA/Bテストを取得できる', () => {
      // Arrange: 現在日時とA/Bテストを準備
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)

      const modelA = createMockModelPerformance('model-a', 0.8, 0.4)
      const modelB = createMockModelPerformance('model-b', 0.85, 0.3)

      // アクティブなテスト
      const activeTest: ABTestResult = {
        testId: 'active-test',
        testName: 'Active Test',
        startDate: yesterday,
        endDate: tomorrow,
        modelA,
        modelB,
        comparison: {
          baselineModel: modelA,
          comparisonModel: modelB,
          improvementMetrics: metrics.calculateImprovement(modelA, modelB),
          significance: metrics.calculateStatisticalSignificance([0.8], [0.85]),
        },
        winnerModel: 'model-b',
        confidenceLevel: 0.95,
      }

      // 終了したテスト
      const completedTest: ABTestResult = {
        ...activeTest,
        testId: 'completed-test',
        testName: 'Completed Test',
        startDate: new Date(now.getTime() - 48 * 60 * 60 * 1000),
        endDate: yesterday,
      }

      metrics.addABTestResult(activeTest)
      metrics.addABTestResult(completedTest)

      // Act: アクティブなテストを取得
      const activeTests = metrics.getActiveABTests()

      // Assert: アクティブなテストのみが返されることを確認
      expect(activeTests).toHaveLength(1)
      expect(activeTests[0].testId).toBe('active-test')
    })
  })

  describe('データ管理', () => {
    test('データをクリアできる', () => {
      // Arrange: データを追加
      const performance = createMockModelPerformance('model-1', 0.85, 0.3)
      const abTest: ABTestResult = {
        testId: 'test-001',
        testName: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        modelA: performance,
        modelB: performance,
        comparison: {
          baselineModel: performance,
          comparisonModel: performance,
          improvementMetrics: metrics.calculateImprovement(
            performance,
            performance,
          ),
          significance: metrics.calculateStatisticalSignificance([0.8], [0.8]),
        },
        winnerModel: 'model-a',
        confidenceLevel: 0.95,
      }

      metrics.addPerformance(performance)
      metrics.addABTestResult(abTest)

      // Act: データをクリア
      metrics.clearData()

      // Assert: データが削除されることを確認
      expect(metrics.getLatestPerformance('model-1')).toBeNull()
      expect(metrics.getABTestResults()).toHaveLength(0)
    })
  })

  describe('エラーハンドリング', () => {
    test('不正なデータでもクラッシュしない', () => {
      // Arrange: 不正なデータを準備
      const invalidPerformance = {
        ...createMockModelPerformance('invalid', 0.85, 0.3),
        trainingMetrics: {
          ...createMockModelPerformance('invalid', 0.85, 0.3).trainingMetrics,
          epochs: -1, // 不正な値
          lossHistory: [], // 空の履歴
          accuracyHistory: [],
        },
      }

      // Act & Assert: エラーなく処理されることを確認
      expect(() => {
        metrics.addPerformance(invalidPerformance)
        const curve = metrics.generateLearningCurve(invalidPerformance)
        expect(curve.epochs).toEqual([]) // 負のエポックの場合は空配列
      }).not.toThrow()
    })

    test('空の配列での統計計算は適切に処理される', () => {
      // Act & Assert: 空配列でもクラッシュしないことを確認
      expect(() => {
        const significance = metrics.calculateStatisticalSignificance([], [])
        expect(significance.sampleSize).toBe(0)
      }).not.toThrow()
    })
  })
})
