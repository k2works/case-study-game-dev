/**
 * 戦略設定コンポーネント
 * AI戦略の選択、作成、編集、削除機能を提供
 */
import { useState } from 'react'

import type {
  CreateStrategyRequest,
  StrategyService,
} from '../../application/services/StrategyService'
import type {
  StrategyConfig,
  StrategyParameters,
} from '../../domain/models/ai/StrategyConfig'
import { useStrategy } from '../hooks/useStrategy'

interface StrategySettingsProps {
  strategyService: StrategyService
}

interface CreateStrategyFormData {
  name: string
  description: string
  parameters: StrategyParameters
}

/**
 * 戦略設定コンポーネント
 */
export function StrategySettings({ strategyService }: StrategySettingsProps) {
  const {
    strategies,
    activeStrategy,
    isLoading,
    error,
    setActiveStrategy,
    createCustomStrategy,
    deleteStrategy,
  } = useStrategy(strategyService)

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [strategyToDelete, setStrategyToDelete] =
    useState<StrategyConfig | null>(null)
  const [createFormData, setCreateFormData] = useState<CreateStrategyFormData>({
    name: '',
    description: '',
    parameters: {
      chainPriority: 50,
      speedPriority: 50,
      defensePriority: 50,
      riskTolerance: 50,
      heightControl: 50,
      centerPriority: 50,
    },
  })

  /**
   * 戦略をアクティブに設定
   */
  const handleSetActiveStrategy = async (strategyId: string) => {
    await setActiveStrategy(strategyId)
  }

  /**
   * カスタム戦略作成処理
   */
  const handleCreateStrategy = async () => {
    try {
      const request: CreateStrategyRequest = {
        name: createFormData.name.trim(),
        description: createFormData.description.trim(),
        parameters: createFormData.parameters,
      }

      await createCustomStrategy(request)

      // フォームをリセットしてモーダルを閉じる
      setCreateFormData({
        name: '',
        description: '',
        parameters: {
          chainPriority: 50,
          speedPriority: 50,
          defensePriority: 50,
          riskTolerance: 50,
          heightControl: 50,
          centerPriority: 50,
        },
      })
      setIsCreateModalOpen(false)
    } catch (error) {
      console.error('カスタム戦略の作成に失敗:', error)
    }
  }

  /**
   * 戦略削除確認
   */
  const handleDeleteConfirm = (strategy: StrategyConfig) => {
    setStrategyToDelete(strategy)
    setIsDeleteModalOpen(true)
  }

  /**
   * 戦略削除実行
   */
  const handleDeleteStrategy = async () => {
    if (!strategyToDelete) return

    try {
      await deleteStrategy(strategyToDelete.id)
      setIsDeleteModalOpen(false)
      setStrategyToDelete(null)
    } catch (error) {
      console.error('戦略の削除に失敗:', error)
    }
  }

  /**
   * パラメータ値の変更
   */
  const handleParameterChange = (
    key: keyof StrategyParameters,
    value: number,
  ) => {
    setCreateFormData((prev) => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [key]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-600">戦略を読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <div className="text-red-600">戦略の読み込みに失敗しました</div>
        <div className="text-sm text-gray-500 mt-1">{error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">AI戦略設定</h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          カスタム戦略を作成
        </button>
      </div>

      <div className="space-y-2">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            data-testid="strategy-item"
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              activeStrategy?.id === strategy.id
                ? 'bg-blue-100 border-blue-300'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => handleSetActiveStrategy(strategy.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-800">{strategy.name}</h4>
                  {strategy.isDefault && (
                    <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded">
                      デフォルト
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {strategy.description}
                </p>

                {/* パラメータ表示 */}
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>連鎖優先度: {strategy.parameters.chainPriority}</div>
                  <div>スピード優先度: {strategy.parameters.speedPriority}</div>
                  <div>防御優先度: {strategy.parameters.defensePriority}</div>
                  <div>リスク許容度: {strategy.parameters.riskTolerance}</div>
                  <div>高さ制御: {strategy.parameters.heightControl}</div>
                  <div>中央重視: {strategy.parameters.centerPriority}</div>
                </div>
              </div>

              {!strategy.isDefault && (
                <button
                  data-testid="delete-strategy"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteConfirm(strategy)
                  }}
                  className="ml-2 p-1 text-red-600 hover:text-red-800"
                  title="戦略を削除"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* カスタム戦略作成モーダル */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">新しいカスタム戦略</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  戦略名
                </label>
                <input
                  data-testid="strategy-name-input"
                  type="text"
                  placeholder="戦略名を入力"
                  value={createFormData.name}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  説明
                </label>
                <textarea
                  data-testid="strategy-description-input"
                  placeholder="戦略の説明を入力"
                  value={createFormData.description}
                  onChange={(e) =>
                    setCreateFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  rows={3}
                />
              </div>

              {/* パラメータ設定 */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">パラメータ設定</h4>

                {Object.entries({
                  chainPriority: '連鎖優先度',
                  speedPriority: 'スピード優先度',
                  defensePriority: '防御優先度',
                  riskTolerance: 'リスク許容度',
                  heightControl: '高さ制御',
                  centerPriority: '中央重視',
                }).map(([key, label]) => (
                  <div key={key}>
                    <label
                      className="block text-sm text-gray-600 mb-1"
                      htmlFor={`param-${key}`}
                    >
                      {label}:{' '}
                      {
                        createFormData.parameters[
                          key as keyof StrategyParameters
                        ]
                      }
                    </label>
                    <input
                      id={`param-${key}`}
                      type="range"
                      min="0"
                      max="100"
                      value={
                        createFormData.parameters[
                          key as keyof StrategyParameters
                        ]
                      }
                      onChange={(e) =>
                        handleParameterChange(
                          key as keyof StrategyParameters,
                          parseInt(e.target.value),
                        )
                      }
                      className="w-full"
                      aria-label={label}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2 mt-6">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreateStrategy}
                disabled={
                  !createFormData.name.trim() ||
                  !createFormData.description.trim()
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {isDeleteModalOpen && strategyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">戦略を削除</h3>
            <p className="text-gray-600 mb-4">
              「{strategyToDelete.name}
              」を削除しますか？この操作は取り消せません。
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteStrategy}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
