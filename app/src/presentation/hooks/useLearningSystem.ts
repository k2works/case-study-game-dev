import { useCallback, useState } from 'react'
import type { LearningService, LearningConfig, LearningResult } from '../../application/services/learning/LearningService'
import type { ModelPerformance } from '../../domain/models/learning/ModelPerformanceMetrics'

/**
 * 学習システムの状態と操作を管理するカスタムフック
 */
export const useLearningSystem = (learningService: LearningService) => {
  // 学習システム状態管理
  const [currentTab, setCurrentTab] = useState<'game' | 'learning'>('game')
  const [isLearning, setIsLearning] = useState(false)
  const [learningProgress, setLearningProgress] = useState(0)
  const [currentModel, setCurrentModel] = useState('mayah-ai-v1')
  const [latestPerformance, setLatestPerformance] = useState<ModelPerformance | null>(null)
  const [learningHistory, setLearningHistory] = useState<readonly LearningResult[]>([])

  // 学習システムハンドラー
  const handleStartLearning = useCallback(
    async (config: LearningConfig) => {
      try {
        setIsLearning(true)
        setLearningProgress(0)

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

  const handleModelSelect = useCallback((modelId: string) => {
    setCurrentModel(modelId)
  }, [])

  return {
    // 状態
    currentTab,
    setCurrentTab,
    isLearning,
    learningProgress,
    currentModel,
    latestPerformance,
    learningHistory,
    // ハンドラー
    handleStartLearning,
    handleStopLearning,
    handleModelSelect,
  }
}