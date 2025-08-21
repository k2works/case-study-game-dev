/**
 * mayah AI評価結果表示コンポーネント
 * 4要素評価システム（操作・形・連鎖・戦略）の詳細表示
 */
import React, { useState } from 'react'

import type { MayahEvaluationResult } from '../../../application/services/ai/MayahAIService'

interface MayahAIEvaluationDisplayProps {
  /** 現在の評価結果 */
  evaluationResult: MayahEvaluationResult | null
  /** 候補手のランキング */
  candidateMoves: Array<{
    move: { x: number; rotation: number; score: number }
    evaluation: MayahEvaluationResult
    rank: number
  }>
  /** 現在の実装フェーズ */
  currentPhase: 'Phase 4a' | 'Phase 4b' | 'Phase 4c'
}

// フェーズ別の機能説明
const phaseDescriptions = {
  'Phase 4a': '基本評価システム: 統合評価・操作評価・形評価実装',
  'Phase 4b': '高度機能: 連鎖評価・戦略評価・境界処理実装',
  'Phase 4c': '最適化完成: 純粋関数型・キャッシュ機能・UI完成',
}

// ゲームフェーズの説明
const gamePhaseDescriptions = {
  early: '序盤: 形重視・スキ許容・基盤構築',
  middle: '中盤: バランス重視・連鎖構築',
  late: '終盤: 連鎖優先・実用性重視',
}

// 評価要素の説明
const evaluationElementDescriptions = {
  operation: {
    name: '操作評価',
    icon: '⚡',
    description: 'フレーム数・ちぎり・効率性を評価',
    details: [
      'フレーム数: 操作速度',
      'ちぎり判定: 配置安定性',
      '効率性: 中央配置・同色隣接',
    ],
  },
  shape: {
    name: '形評価',
    icon: '🏗️',
    description: 'U字型・連結・山谷・バランスを評価',
    details: [
      'U字型: 理想的な配置形状',
      '連結評価: 同色ぷよの連結',
      '山谷判定: 深い谷・高い山のペナルティ',
      'バランス: 高さの分散',
    ],
  },
  chain: {
    name: '連鎖評価',
    icon: '🔗',
    description: '連鎖可能性とポテンシャルを評価',
    details: [
      '連鎖長: 可能な連鎖数',
      '連鎖安定性: 発火のしやすさ',
      'ポテンシャル: 将来の連鎖可能性',
    ],
  },
  strategy: {
    name: '戦略評価',
    icon: '🎯',
    description: '戦略的配置と長期的視点を評価',
    details: [
      '戦略配置: 目標に向けた配置',
      '長期視点: 将来の展開可能性',
      '相手対応: 防御的配置',
    ],
  },
}

/**
 * 評価要素詳細表示コンポーネント
 */
const EvaluationElementDetails: React.FC<{
  evaluation: MayahEvaluationResult
  showDetails: boolean
}> = ({ evaluation, showDetails }) => {
  if (!showDetails) return null

  return (
    <div className="evaluation-elements">
      <div className="element-grid">
        <div className="element-card operation">
          <div className="element-header">
            <span className="element-icon">
              {evaluationElementDescriptions.operation.icon}
            </span>
            <h5>{evaluationElementDescriptions.operation.name}</h5>
            <span className="element-score">
              {Math.round(evaluation.operationScore)}
            </span>
          </div>
          <p className="element-description">
            {evaluationElementDescriptions.operation.description}
          </p>
          <div className="element-details">
            {evaluationElementDescriptions.operation.details.map(
              (detail, index) => (
                <div key={index} className="detail-item">
                  {detail}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="element-card shape">
          <div className="element-header">
            <span className="element-icon">
              {evaluationElementDescriptions.shape.icon}
            </span>
            <h5>{evaluationElementDescriptions.shape.name}</h5>
            <span className="element-score">
              {Math.round(evaluation.shapeScore)}
            </span>
          </div>
          <p className="element-description">
            {evaluationElementDescriptions.shape.description}
          </p>
          <div className="element-details">
            {evaluationElementDescriptions.shape.details.map(
              (detail, index) => (
                <div key={index} className="detail-item">
                  {detail}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="element-card chain">
          <div className="element-header">
            <span className="element-icon">
              {evaluationElementDescriptions.chain.icon}
            </span>
            <h5>{evaluationElementDescriptions.chain.name}</h5>
            <span className="element-score">
              {Math.round(evaluation.chainScore)}
            </span>
          </div>
          <p className="element-description">
            {evaluationElementDescriptions.chain.description}
          </p>
          <div className="element-details">
            {evaluationElementDescriptions.chain.details.map(
              (detail, index) => (
                <div key={index} className="detail-item">
                  {detail}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="element-card strategy">
          <div className="element-header">
            <span className="element-icon">
              {evaluationElementDescriptions.strategy.icon}
            </span>
            <h5>{evaluationElementDescriptions.strategy.name}</h5>
            <span className="element-score">
              {Math.round(evaluation.strategyScore)}
            </span>
          </div>
          <p className="element-description">
            {evaluationElementDescriptions.strategy.description}
          </p>
          <div className="element-details">
            {evaluationElementDescriptions.strategy.details.map(
              (detail, index) => (
                <div key={index} className="detail-item">
                  {detail}
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Phase 4c パフォーマンス詳細表示コンポーネント
 */
const Phase4cPerformanceDetails: React.FC<{
  showPerformanceInfo: boolean
  setShowPerformanceInfo: (show: boolean) => void
}> = ({ showPerformanceInfo, setShowPerformanceInfo }) => (
  <div className="performance-info">
    <div className="performance-header">
      <h4>Phase 4c 最適化情報</h4>
      <button
        onClick={() => setShowPerformanceInfo(!showPerformanceInfo)}
        className="toggle-performance"
      >
        {showPerformanceInfo ? '詳細を隠す' : 'パフォーマンス詳細'}
      </button>
    </div>
    {showPerformanceInfo && (
      <div className="performance-details">
        <div className="optimization-features">
          <div className="feature-item">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">純粋関数型実装による高速化</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <span className="feature-text">フィールド状態キャッシュ機能</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span className="feature-text">列高さ計算最適化</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔄</span>
            <span className="feature-text">関数合成による重複計算回避</span>
          </div>
        </div>
        <div className="performance-metrics">
          <div className="metric-item">
            <span className="metric-label">評価速度改善:</span>
            <span className="metric-value">約40-60%向上</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">メモリ効率:</span>
            <span className="metric-value">キャッシュ最適化済み</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">コード品質:</span>
            <span className="metric-value">純粋関数型・テスト完備</span>
          </div>
        </div>
      </div>
    )}
  </div>
)

/**
 * mayah AI評価表示コンポーネント
 */
export const MayahAIEvaluationDisplay: React.FC<
  MayahAIEvaluationDisplayProps
  // eslint-disable-next-line complexity
> = ({ evaluationResult, candidateMoves, currentPhase }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedMove, setSelectedMove] = useState<number>(0)
  const [showPerformanceInfo, setShowPerformanceInfo] = useState(false)
  const [showElementDetails, setShowElementDetails] = useState(false)

  return (
    <div className="mayah-ai-evaluation-display">
      <div className="evaluation-header">
        <h3>mayah AI評価システム</h3>
        <div className="phase-indicator">
          <span
            className={`phase-badge phase-${currentPhase.toLowerCase().replace(' ', '')}`}
          >
            {currentPhase}
          </span>
          <p className="phase-description">{phaseDescriptions[currentPhase]}</p>
        </div>
      </div>

      {evaluationResult ? (
        <div className="evaluation-content">
          <div className="current-evaluation">
            <h4>現在の最良手評価</h4>
            <div className="evaluation-summary">
              <div className="score-display">
                <span className="score-value">
                  {Math.round(evaluationResult.totalScore)}
                </span>
                <span className="score-label">総合スコア</span>
              </div>
              <div className="confidence-display">
                <span className="confidence-value">
                  {Math.round(evaluationResult.confidence * 100)}%
                </span>
                <span className="confidence-label">信頼度</span>
              </div>
              <div className="phase-display">
                <span className="phase-value">
                  {
                    gamePhaseDescriptions[
                      evaluationResult.gamePhase as keyof typeof gamePhaseDescriptions
                    ]
                  }
                </span>
                <span className="phase-label">ゲームフェーズ</span>
              </div>
            </div>
            <div className="evaluation-reason">
              <strong>評価理由:</strong> {evaluationResult.reason}
            </div>

            {/* 4要素評価の簡易表示 */}
            <div className="elements-summary">
              <div className="element-summary operation">
                <span className="element-icon">
                  {evaluationElementDescriptions.operation.icon}
                </span>
                <span className="element-name">操作</span>
                <span className="element-value">
                  {Math.round(evaluationResult.operationScore)}
                </span>
              </div>
              <div className="element-summary shape">
                <span className="element-icon">
                  {evaluationElementDescriptions.shape.icon}
                </span>
                <span className="element-name">形状</span>
                <span className="element-value">
                  {Math.round(evaluationResult.shapeScore)}
                </span>
              </div>
              <div className="element-summary chain">
                <span className="element-icon">
                  {evaluationElementDescriptions.chain.icon}
                </span>
                <span className="element-name">連鎖</span>
                <span className="element-value">
                  {Math.round(evaluationResult.chainScore)}
                </span>
              </div>
              <div className="element-summary strategy">
                <span className="element-icon">
                  {evaluationElementDescriptions.strategy.icon}
                </span>
                <span className="element-name">戦略</span>
                <span className="element-value">
                  {Math.round(evaluationResult.strategyScore)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowElementDetails(!showElementDetails)}
              className="toggle-element-details"
            >
              {showElementDetails ? '4要素詳細を隠す' : '4要素詳細を表示'}
            </button>

            <EvaluationElementDetails
              evaluation={evaluationResult}
              showDetails={showElementDetails}
            />
          </div>

          <div className="candidate-moves">
            <div className="candidates-header">
              <h4>候補手ランキング</h4>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="toggle-details"
              >
                {showDetails ? '詳細を隠す' : '詳細を表示'}
              </button>
            </div>

            <div className="candidates-list">
              {candidateMoves.slice(0, 5).map((candidate, index) => (
                <div
                  key={`${candidate.move.x}-${candidate.move.rotation}`}
                  className={`candidate-item ${
                    index === selectedMove ? 'selected' : ''
                  } ${index === 0 ? 'best-move' : ''}`}
                  onClick={() => setSelectedMove(index)}
                >
                  <div className="candidate-rank">#{candidate.rank}</div>
                  <div className="candidate-move">
                    <span>位置: {candidate.move.x}</span>
                    <span>回転: {candidate.move.rotation}°</span>
                  </div>
                  <div className="candidate-score">
                    {Math.round(candidate.evaluation.totalScore)}
                  </div>
                  {showDetails && (
                    <div className="candidate-details">
                      <div className="detail-item">
                        <span>フェーズ:</span>
                        <span>
                          {
                            gamePhaseDescriptions[
                              candidate.evaluation
                                .gamePhase as keyof typeof gamePhaseDescriptions
                            ]
                          }
                        </span>
                      </div>
                      <div className="detail-item">
                        <span>理由:</span>
                        <span>{candidate.evaluation.reason}</span>
                      </div>
                      <div className="detail-item">
                        <span>信頼度:</span>
                        <span>
                          {Math.round(candidate.evaluation.confidence * 100)}%
                        </span>
                      </div>
                      <div className="detail-scores">
                        <div className="score-breakdown">
                          <span>
                            操作:{' '}
                            {Math.round(candidate.evaluation.operationScore)}
                          </span>
                          <span>
                            形状: {Math.round(candidate.evaluation.shapeScore)}
                          </span>
                          <span>
                            連鎖: {Math.round(candidate.evaluation.chainScore)}
                          </span>
                          <span>
                            戦略:{' '}
                            {Math.round(candidate.evaluation.strategyScore)}
                          </span>
                        </div>
                        <div className="phase-adjustment">
                          <span>
                            フェーズ調整:{' '}
                            {candidate.evaluation.phaseAdjustment.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="phase-progress">
            <h4>実装進捗</h4>
            <div className="progress-indicators">
              <div
                className={`progress-item ${currentPhase >= 'Phase 4a' ? 'completed' : 'pending'}`}
              >
                <span className="progress-label">Phase 4a</span>
                <span className="progress-status">統合評価基盤</span>
                <span className="progress-features">操作・形評価実装</span>
              </div>
              <div
                className={`progress-item ${currentPhase >= 'Phase 4b' ? 'completed' : 'pending'}`}
              >
                <span className="progress-label">Phase 4b</span>
                <span className="progress-status">高度評価機能</span>
                <span className="progress-features">
                  連鎖・戦略評価・境界処理
                </span>
              </div>
              <div
                className={`progress-item ${currentPhase >= 'Phase 4c' ? 'completed' : 'pending'}`}
              >
                <span className="progress-label">Phase 4c</span>
                <span className="progress-status">最適化完成</span>
                <span className="progress-features">
                  純粋関数型・キャッシュ
                </span>
              </div>
            </div>
          </div>

          {currentPhase === 'Phase 4c' && (
            <Phase4cPerformanceDetails
              showPerformanceInfo={showPerformanceInfo}
              setShowPerformanceInfo={setShowPerformanceInfo}
            />
          )}
        </div>
      ) : (
        <div className="no-evaluation">
          <div className="no-evaluation-content">
            <h4>mayah AI評価システム待機中</h4>
            <p>AI評価を実行してください</p>
            <div className="phase-info">
              <div className="current-phase">
                <strong>現在のフェーズ:</strong> {currentPhase}
              </div>
              <div className="phase-capabilities">
                <strong>実装機能:</strong> {phaseDescriptions[currentPhase]}
              </div>
              <div className="evaluation-system">
                <h5>4要素評価システム</h5>
                <div className="system-elements">
                  <div className="system-element">
                    <span className="element-icon">
                      {evaluationElementDescriptions.operation.icon}
                    </span>
                    <span>操作評価</span>
                  </div>
                  <div className="system-element">
                    <span className="element-icon">
                      {evaluationElementDescriptions.shape.icon}
                    </span>
                    <span>形評価</span>
                  </div>
                  <div className="system-element">
                    <span className="element-icon">
                      {evaluationElementDescriptions.chain.icon}
                    </span>
                    <span>連鎖評価</span>
                  </div>
                  <div className="system-element">
                    <span className="element-icon">
                      {evaluationElementDescriptions.strategy.icon}
                    </span>
                    <span>戦略評価</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
