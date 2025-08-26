/**
 * モデルバージョン管理コンポーネント
 * 機械学習モデルのバージョン管理とA/Bテスト機能を提供
 */
import { useState } from 'react'

import type {
  ABTestResult,
  ModelComparison,
  ModelPerformance,
} from '../../../domain/models/learning/ModelPerformanceMetrics'

interface ModelVersionManagerProps {
  models: ModelPerformance[]
  activeModelId: string
  abTests: ABTestResult[]
  onModelSelect: (modelId: string) => void
  onStartABTest: (modelAId: string, modelBId: string, testName: string) => void
  onStopABTest: (testId: string) => void
  onCompareModels: (
    modelAId: string,
    modelBId: string,
  ) => Promise<ModelComparison | null>
  className?: string
}

interface ModelCardProps {
  model: ModelPerformance
  isActive: boolean
  onSelect: () => void
  onCompare: () => void
}

/**
 * モデル情報カードコンポーネント
 */
function ModelCard({ model, isActive, onSelect, onCompare }: ModelCardProps) {
  const formatMetric = (value: number, unit = '', decimals = 2) => {
    return `${value.toFixed(decimals)}${unit}`
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div
      className={`
      p-4 border rounded-lg transition-all cursor-pointer
      ${
        isActive
          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }
    `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h4 className="font-semibold text-gray-900">{model.modelId}</h4>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
              v{model.modelVersion}
            </span>
            {isActive && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                Active
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 mb-3">
            {model.timestamp.toLocaleDateString('ja-JP')}{' '}
            {model.timestamp.toLocaleTimeString('ja-JP')}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Training</p>
              <p className="font-medium">
                Acc:{' '}
                {formatMetric(model.trainingMetrics.finalAccuracy * 100, '%')}
              </p>
              <p className="font-medium">
                Loss: {formatMetric(model.trainingMetrics.finalLoss)}
              </p>
            </div>

            <div>
              <p className="text-gray-600">Validation</p>
              <p className="font-medium">
                Acc:{' '}
                {formatMetric(
                  model.validationMetrics.validationAccuracy * 100,
                  '%',
                )}
              </p>
              <p className="font-medium">
                Loss: {formatMetric(model.validationMetrics.validationLoss)}
              </p>
            </div>
          </div>

          <div className="mt-3 text-sm">
            <div className="flex items-center justify-between text-gray-600">
              <span>Size: {formatSize(model.resourceMetrics.modelSize)}</span>
              <span>
                Inference: {formatTime(model.resourceMetrics.inferenceTime)}
              </span>
            </div>
          </div>

          {model.testMetrics && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <p className="text-gray-600 mb-1">Game Performance</p>
              <p className="font-medium">
                Score: {formatMetric(model.testMetrics.gamePerformanceScore)}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={onSelect}
          disabled={isActive}
          className={`
            px-3 py-1 text-sm rounded transition-colors
            ${
              isActive
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {isActive ? 'Active' : 'Select'}
        </button>
        <button
          onClick={onCompare}
          className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
        >
          Compare
        </button>
      </div>
    </div>
  )
}

/**
 * A/Bテスト管理セクション
 */
function ABTestSection({
  models,
  activeTests,
  onStartTest,
  onStopTest,
}: {
  models: ModelPerformance[]
  activeTests: ABTestResult[]
  onStartTest: (modelAId: string, modelBId: string, testName: string) => void
  onStopTest: (testId: string) => void
}) {
  const [showCreateTest, setShowCreateTest] = useState(false)
  const [testName, setTestName] = useState('')
  const [modelA, setModelA] = useState('')
  const [modelB, setModelB] = useState('')

  const handleCreateTest = () => {
    if (testName && modelA && modelB && modelA !== modelB) {
      onStartTest(modelA, modelB, testName)
      setTestName('')
      setModelA('')
      setModelB('')
      setShowCreateTest(false)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">A/B Tests</h3>
        <button
          onClick={() => setShowCreateTest(!showCreateTest)}
          className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
        >
          New A/B Test
        </button>
      </div>

      {showCreateTest && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">
            Create New A/B Test
          </h4>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Name
              </label>
              <input
                type="text"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                placeholder="Enter test name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model A
                </label>
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select model...</option>
                  {models.map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                      {model.modelId} v{model.modelVersion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model B
                </label>
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select model...</option>
                  {models.map((model) => (
                    <option key={model.modelId} value={model.modelId}>
                      {model.modelId} v{model.modelVersion}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleCreateTest}
              disabled={!testName || !modelA || !modelB || modelA === modelB}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Start Test
            </button>
            <button
              onClick={() => setShowCreateTest(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {activeTests.length > 0 ? (
        <div className="space-y-3">
          {activeTests.map((test) => (
            <div
              key={test.testId}
              className="p-4 border border-orange-200 bg-orange-50 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{test.testName}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {test.modelA.modelId} vs {test.modelB.modelId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started: {test.startDate.toLocaleDateString('ja-JP')}
                  </p>
                  {test.comparison.significance.isSignificant && (
                    <div className="mt-2 text-sm">
                      <span
                        className={`px-2 py-1 rounded ${
                          test.winnerModel === test.modelA.modelId
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        Winner: {test.winnerModel}
                      </span>
                      <span className="ml-2 text-gray-600">
                        (p-value:{' '}
                        {test.comparison.significance.pValue.toFixed(3)})
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onStopTest(test.testId)}
                  className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                >
                  Stop Test
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No active A/B tests</p>
        </div>
      )}
    </div>
  )
}

/**
 * 比較選択状態を管理するヘルパーフック
 */
function useModelComparison(
  onCompareModels: ModelVersionManagerProps['onCompareModels'],
) {
  const [selectedForComparison, setSelectedForComparison] = useState<
    string | null
  >(null)
  const [comparisonResult, setComparisonResult] =
    useState<ModelComparison | null>(null)

  const handleCompareModel = async (modelId: string) => {
    if (selectedForComparison && selectedForComparison !== modelId) {
      const result = await onCompareModels(selectedForComparison, modelId)
      setComparisonResult(result)
      setSelectedForComparison(null)
    } else {
      setSelectedForComparison(modelId)
      setComparisonResult(null)
    }
  }

  return {
    selectedForComparison,
    comparisonResult,
    handleCompareModel,
    setSelectedForComparison,
  }
}

/**
 * 比較結果表示コンポーネント
 */
function ComparisonResults({
  comparisonResult,
}: {
  comparisonResult: ModelComparison
}) {
  return (
    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
      <h4 className="font-medium text-gray-900 mb-3">
        Model Comparison Results
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <ComparisonMetric
          label="Accuracy Improvement"
          value={comparisonResult.improvementMetrics.accuracyImprovement}
          formatter={(val) => `${val > 0 ? '+' : ''}${(val * 100).toFixed(2)}%`}
        />
        <ComparisonMetric
          label="Loss Reduction"
          value={comparisonResult.improvementMetrics.lossReduction}
          formatter={(val) =>
            `${val > 0 ? '-' : '+'}${Math.abs(val).toFixed(3)}`
          }
        />
        <div>
          <p className="text-gray-600">Statistical Significance</p>
          <p
            className={`font-medium ${
              comparisonResult.significance.isSignificant
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {comparisonResult.significance.isSignificant
              ? 'Significant'
              : 'Not Significant'}
            <span className="text-xs text-gray-500 ml-1">
              (p={comparisonResult.significance.pValue.toFixed(3)})
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 比較メトリック表示コンポーネント
 */
function ComparisonMetric({
  label,
  value,
  formatter,
}: {
  label: string
  value: number
  formatter: (value: number) => string
}) {
  return (
    <div>
      <p className="text-gray-600">{label}</p>
      <p
        className={`font-medium ${value > 0 ? 'text-green-600' : 'text-red-600'}`}
      >
        {formatter(value)}
      </p>
    </div>
  )
}

/**
 * モデル一覧セクション
 */
function ModelsSection({
  models,
  activeModelId,
  selectedForComparison,
  onModelSelect,
  onCompareModel,
  onCancelComparison,
}: {
  models: ModelPerformance[]
  activeModelId: string
  selectedForComparison: string | null
  onModelSelect: (modelId: string) => void
  onCompareModel: (modelId: string) => void
  onCancelComparison: () => void
}) {
  const sortedModels = models.sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
  )

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Available Models
      </h3>
      {selectedForComparison && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Select another model to compare with {selectedForComparison}
          </p>
          <button
            onClick={onCancelComparison}
            className="text-xs text-blue-600 hover:text-blue-800 underline mt-1"
          >
            Cancel comparison
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedModels.map((model) => (
          <ModelCard
            key={model.modelId}
            model={model}
            isActive={model.modelId === activeModelId}
            onSelect={() => onModelSelect(model.modelId)}
            onCompare={() => onCompareModel(model.modelId)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * モデルバージョン管理メインコンポーネント
 */
export function ModelVersionManager(props: ModelVersionManagerProps) {
  const {
    models,
    activeModelId,
    abTests,
    onModelSelect,
    onStartABTest,
    onStopABTest,
    onCompareModels,
    className = '',
  } = props

  const {
    selectedForComparison,
    comparisonResult,
    handleCompareModel,
    setSelectedForComparison,
  } = useModelComparison(onCompareModels)

  const activeTests = abTests.filter((test) => {
    const now = new Date()
    return test.startDate <= now && test.endDate >= now
  })

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold text-gray-900">
          Model Version Manager
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage AI models, compare performance, and run A/B tests
        </p>
      </div>

      <div className="p-6">
        {models.length > 0 ? (
          <>
            <ModelsSection
              models={models}
              activeModelId={activeModelId}
              selectedForComparison={selectedForComparison}
              onModelSelect={onModelSelect}
              onCompareModel={handleCompareModel}
              onCancelComparison={() => setSelectedForComparison(null)}
            />

            {comparisonResult && (
              <ComparisonResults comparisonResult={comparisonResult} />
            )}

            <ABTestSection
              models={models}
              activeTests={activeTests}
              onStartTest={onStartABTest}
              onStopTest={onStopABTest}
            />
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium">No Models Available</p>
            <p className="text-sm mt-2">
              Train your first model to get started
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
