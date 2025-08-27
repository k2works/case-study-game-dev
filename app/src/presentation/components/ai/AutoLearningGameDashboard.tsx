import { useState } from 'react'

import type {
  AutoLearningGameConfig,
  LearningGameProcess,
} from '../../../application/services/ai/AutoLearningGameService'
import type { UseAutoLearningGameOptions } from '../../hooks/useAutoLearningGame'
import { useAutoLearningGame } from '../../hooks/useAutoLearningGame'

/**
 * 自動学習ゲームダッシュボードのProps
 */
export interface AutoLearningGameDashboardProps {
  autoLearningGameService: UseAutoLearningGameOptions['autoLearningGameService']
  className?: string
}

/**
 * プロセス状態の表示用設定
 */
const STATUS_CONFIG = {
  idle: { label: '待機中', color: '#6B7280', emoji: '⏸️' },
  playing: { label: 'ゲーム実行中', color: '#10B981', emoji: '🎮' },
  collecting: { label: 'データ収集中', color: '#3B82F6', emoji: '📊' },
  training: { label: '学習実行中', color: '#F59E0B', emoji: '🧠' },
  evaluating: { label: '評価中', color: '#8B5CF6', emoji: '📈' },
  completed: { label: '完了', color: '#10B981', emoji: '✅' },
  error: { label: 'エラー', color: '#EF4444', emoji: '❌' },
} as const

/**
 * 完全な自動学習ゲームシステムダッシュボード
 */
// eslint-disable-next-line complexity
export function AutoLearningGameDashboard({
  autoLearningGameService,
  className = '',
}: AutoLearningGameDashboardProps) {
  const autoLearningGame = useAutoLearningGame({
    autoLearningGameService,
    enabled: true,
    pollingInterval: 1000,
  })

  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false)
  const [tempConfig, setTempConfig] = useState<Partial<AutoLearningGameConfig>>(
    {},
  )

  /**
   * 設定の更新
   */
  const handleConfigUpdate = (updates: Partial<AutoLearningGameConfig>) => {
    autoLearningGame.updateConfig(updates)
    setTempConfig({})
  }

  /**
   * プロセスの進捗バー
   */
  const ProgressBar = ({ process }: { process: LearningGameProcess }) => {
    const statusInfo = STATUS_CONFIG[process.status]

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className="text-sm font-medium"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.emoji} {statusInfo.label}
          </span>
          <span className="text-sm text-white/60">
            {Math.round(process.progress)}%
          </span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${process.progress}%`,
              backgroundColor: statusInfo.color,
            }}
          />
        </div>
        {process.status === 'playing' && (
          <div className="text-xs text-white/70">
            ゲーム {process.currentGame}/{process.totalGames}
          </div>
        )}
      </div>
    )
  }

  /**
   * 統計カード
   */
  const StatsCard = ({
    title,
    value,
    unit = '',
    color = '#3B82F6',
    description,
  }: {
    title: string
    value: number | string
    unit?: string
    color?: string
    description?: string
  }) => (
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold" style={{ color }}>
          {typeof value === 'number' ? value.toFixed(2) : value}
          {unit}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  )

  /**
   * ゲーム状態表示
   */
  // eslint-disable-next-line complexity
  const GameStateView = ({ process }: { process: LearningGameProcess }) => {
    const gameState = process.currentGameState
    const lastMove = process.lastMove

    if (!gameState) return null

    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <h4 className="font-medium text-sm mb-2">🎮 現在のゲーム状態</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>スコア: {gameState.score}</div>
          <div>チェイン: {gameState.chainCount || 0}</div>
          <div>
            現在のぷよ: {gameState.currentPuyoPair?.primaryColor || 'なし'}-
            {gameState.currentPuyoPair?.secondaryColor || 'なし'}
          </div>
          <div>
            次のぷよ: {gameState.nextPuyoPair?.primaryColor || 'なし'}-{gameState.nextPuyoPair?.secondaryColor || 'なし'}
          </div>
        </div>
        {lastMove && (
          <div className="mt-2 pt-2 border-t">
            <div className="text-xs">
              最後の手: X={lastMove.x}, 回転={lastMove.rotation}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
        <h1 className="text-2xl font-bold text-white mb-2">
          🚀 完全AI自動学習システム
        </h1>
        <p className="text-white/80">
          AIが自動でぷよぷよをプレイしながらリアルタイムで学習データを生成・学習します
        </p>
      </div>

      {/* エラー表示 */}
      {autoLearningGame.error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <span className="text-red-800 font-medium">エラー:</span>
          </div>
          <p className="text-red-700 mt-1">{autoLearningGame.error}</p>
        </div>
      )}

      {/* コントロールパネル */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">🎛️ システム制御</h2>

        <div className="flex gap-3 mb-4">
          <button
            onClick={autoLearningGame.startAutoLearningGame}
            disabled={autoLearningGame.isRunning}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ▶️ 自動学習開始
          </button>

          <button
            onClick={autoLearningGame.stopAutoLearningGame}
            disabled={!autoLearningGame.isRunning}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ⏹️ 停止
          </button>

          <button
            onClick={autoLearningGame.clearHistory}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            🗑️ 履歴クリア
          </button>
        </div>

        <div className="text-sm text-white/80">
          状態: {autoLearningGame.isRunning ? '🟢 実行中' : '🔴 停止中'}
        </div>
      </div>

      {/* 現在のプロセス */}
      {autoLearningGame.currentProcess && (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">⚡ 現在のプロセス</h2>

          <ProgressBar process={autoLearningGame.currentProcess} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* ゲーム統計 */}
            <div>
              <h3 className="font-medium text-white mb-2">🎮 ゲーム実行状況</h3>
              <div className="space-y-1 text-sm text-white/90">
                <div>
                  完了ゲーム:{' '}
                  {autoLearningGame.currentProcess.gameStats.completedGames}
                </div>
                <div>
                  平均スコア:{' '}
                  {Math.round(
                    autoLearningGame.currentProcess.gameStats.averageScore,
                  )}
                </div>
                <div>
                  最高スコア:{' '}
                  {autoLearningGame.currentProcess.gameStats.bestScore}
                </div>
                <div>
                  平均チェイン:{' '}
                  {autoLearningGame.currentProcess.gameStats.averageChainLength.toFixed(
                    1,
                  )}
                </div>
                <div>
                  収集データ:{' '}
                  {
                    autoLearningGame.currentProcess.gameStats
                      .collectedDataPoints
                  }
                </div>
                <div>
                  成功率:{' '}
                  {(
                    autoLearningGame.currentProcess.gameStats.successRate * 100
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>

            {/* 学習統計 */}
            {autoLearningGame.currentProcess.learningStats && (
              <div>
                <h3 className="font-medium text-white mb-2">🧠 学習状況</h3>
                <div className="space-y-1 text-sm text-white/90">
                  <div>
                    精度:{' '}
                    {(
                      autoLearningGame.currentProcess.learningStats.accuracy *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div>
                    損失:{' '}
                    {autoLearningGame.currentProcess.learningStats.loss.toFixed(
                      4,
                    )}
                  </div>
                  <div>
                    訓練データサイズ:{' '}
                    {
                      autoLearningGame.currentProcess.learningStats
                        .trainingDataSize
                    }
                  </div>
                  {autoLearningGame.currentProcess.modelId && (
                    <div>
                      モデルID:{' '}
                      {autoLearningGame.currentProcess.modelId.slice(-8)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ゲーム状態表示 */}
          {autoLearningGame.currentProcess.status === 'playing' && (
            <div className="mt-4">
              <GameStateView process={autoLearningGame.currentProcess} />
            </div>
          )}
        </div>
      )}

      {/* 統計サマリー */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">📈 統計サマリー</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="総プロセス数"
            value={autoLearningGame.stats.totalProcesses}
            color="#3B82F6"
            description="実行したプロセス総数"
          />
          <StatsCard
            title="完了プロセス"
            value={autoLearningGame.stats.completedProcesses}
            color="#10B981"
            description="正常完了したプロセス数"
          />
          <StatsCard
            title="総ゲーム数"
            value={autoLearningGame.stats.totalGamesPlayed}
            color="#F59E0B"
            description="プレイしたゲーム総数"
          />
          <StatsCard
            title="平均精度"
            value={autoLearningGame.stats.averageAccuracy * 100}
            unit="%"
            color="#8B5CF6"
            description="学習モデルの平均精度"
          />
          <StatsCard
            title="平均スコア"
            value={Math.round(autoLearningGame.stats.averageScore)}
            color="#EF4444"
            description="ゲームの平均スコア"
          />
          <StatsCard
            title="最高スコア"
            value={autoLearningGame.stats.bestScore}
            color="#F97316"
            description="記録された最高スコア"
          />
          <StatsCard
            title="成功率"
            value={autoLearningGame.stats.successRate * 100}
            unit="%"
            color="#06B6D4"
            description="100点以上の成功率"
          />
          <StatsCard
            title="実行中"
            value={autoLearningGame.stats.runningProcesses}
            color={
              autoLearningGame.stats.runningProcesses > 0
                ? '#10B981'
                : '#6B7280'
            }
            description="現在実行中のプロセス数"
          />
        </div>
      </div>

      {/* 簡易設定パネル */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
        <h2 className="text-xl font-semibold text-white mb-4">⚙️ 設定</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              ゲーム数/セッション
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={tempConfig.gamesPerSession ?? 10}
              onChange={(e) =>
                setTempConfig((prev) => ({
                  ...prev,
                  gamesPerSession: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              思考速度 (ms)
            </label>
            <input
              type="number"
              min="0"
              max="5000"
              step="100"
              value={tempConfig.thinkingSpeed ?? 100}
              onChange={(e) =>
                setTempConfig((prev) => ({
                  ...prev,
                  thinkingSpeed: parseInt(e.target.value),
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              学習間隔 (分)
            </label>
            <input
              type="number"
              min="1"
              max="1440"
              value={Math.round(
                (tempConfig.learningInterval ?? 30 * 60 * 1000) / (60 * 1000),
              )}
              onChange={(e) =>
                setTempConfig((prev) => ({
                  ...prev,
                  learningInterval: parseInt(e.target.value) * 60 * 1000,
                }))
              }
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleConfigUpdate(tempConfig)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={Object.keys(tempConfig).length === 0}
          >
            設定を更新
          </button>

          <button
            onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {showAdvancedConfig ? '詳細設定を隠す' : '詳細設定を表示'}
          </button>
        </div>

        {/* 詳細設定 */}
        {showAdvancedConfig && (
          <div className="border-t border-white/20 pt-4">
            <h3 className="font-medium text-white mb-3">🔧 詳細設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  最小学習データサイズ
                </label>
                <input
                  type="number"
                  min="10"
                  max="10000"
                  value={tempConfig.minTrainingDataSize ?? 100}
                  onChange={(e) =>
                    setTempConfig((prev) => ({
                      ...prev,
                      minTrainingDataSize: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  エポック数
                </label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={tempConfig.epochs ?? 20}
                  onChange={(e) =>
                    setTempConfig((prev) => ({
                      ...prev,
                      epochs: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  バッチサイズ
                </label>
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={tempConfig.batchSize ?? 32}
                  onChange={(e) =>
                    setTempConfig((prev) => ({
                      ...prev,
                      batchSize: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">学習率</label>
                <input
                  type="number"
                  min="0.0001"
                  max="0.1"
                  step="0.0001"
                  value={tempConfig.learningRate ?? 0.001}
                  onChange={(e) =>
                    setTempConfig((prev) => ({
                      ...prev,
                      learningRate: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  検証分割比率
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="0.5"
                  step="0.1"
                  value={tempConfig.validationSplit ?? 0.2}
                  onChange={(e) =>
                    setTempConfig((prev) => ({
                      ...prev,
                      validationSplit: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  性能閾値
                </label>
                <input
                  type="number"
                  min="0.1"
                  max="1.0"
                  step="0.1"
                  value={tempConfig.performanceThreshold ?? 0.7}
                  onChange={(e) =>
                    setTempConfig((prev) => ({
                      ...prev,
                      performanceThreshold: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* プロセス履歴 */}
      {autoLearningGame.processHistory.length > 0 && (
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">📚 実行履歴</h2>

          <div className="space-y-3">
            {autoLearningGame.processHistory
              .slice(-5)
              .reverse()
              .map((process) => {
                const statusInfo = STATUS_CONFIG[process.status]
                const duration = process.endTime
                  ? Math.round(
                      (process.endTime.getTime() -
                        process.startTime.getTime()) /
                        1000,
                    )
                  : 0

                return (
                  <div key={process.id} className="border border-white/20 bg-white/5 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{statusInfo.emoji}</span>
                        <span className="font-medium text-white">
                          {process.id.slice(-8)}
                        </span>
                        <span
                          className="text-sm px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: `${statusInfo.color}20`,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-white/60">
                        {process.startTime.toLocaleString()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-white/90">
                      <div>完了ゲーム: {process.gameStats.completedGames}</div>
                      <div>
                        平均スコア: {Math.round(process.gameStats.averageScore)}
                      </div>
                      <div>
                        収集データ: {process.gameStats.collectedDataPoints}
                      </div>
                      <div>実行時間: {duration}秒</div>
                      {process.learningStats && (
                        <>
                          <div>
                            精度:{' '}
                            {(process.learningStats.accuracy * 100).toFixed(1)}%
                          </div>
                          <div>
                            損失: {process.learningStats.loss.toFixed(4)}
                          </div>
                        </>
                      )}
                    </div>

                    {process.error && (
                      <div className="mt-2 text-red-600 text-sm">
                        エラー: {process.error}
                      </div>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
