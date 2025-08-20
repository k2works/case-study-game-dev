/**
 * mayah AI評価結果表示コンポーネント
 * Phase 4a-4c段階的検証用UI
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

/**
 * mayah AI評価表示コンポーネント
 */
export const MayahAIEvaluationDisplay: React.FC<
  MayahAIEvaluationDisplayProps
> = ({ evaluationResult, candidateMoves, currentPhase }) => {
  const [showDetails, setShowDetails] = useState(false)
  const [selectedMove, setSelectedMove] = useState<number>(0)

  // フェーズ別の機能説明
  const phaseDescriptions = {
    'Phase 4a': '基本評価システム: 中央重視・位置ベース評価',
    'Phase 4b': '高度機能: RensaHandTree・パターンマッチング対応',
    'Phase 4c': '最適化統合: パフォーマンス向上・UI統合完成',
  }

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
                  {Math.round(evaluationResult.score)}
                </span>
                <span className="score-label">総合スコア</span>
              </div>
              <div className="confidence-display">
                <span className="confidence-value">
                  {Math.round(evaluationResult.confidence * 100)}%
                </span>
                <span className="confidence-label">信頼度</span>
              </div>
            </div>
            <div className="evaluation-reason">
              <strong>評価理由:</strong> {evaluationResult.reason}
            </div>
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
                    {Math.round(candidate.evaluation.score)}
                  </div>
                  {showDetails && (
                    <div className="candidate-details">
                      <div className="detail-item">
                        <span>フェーズ:</span>
                        <span>{candidate.evaluation.phase}</span>
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
                <span className="progress-status">基本評価</span>
              </div>
              <div
                className={`progress-item ${currentPhase >= 'Phase 4b' ? 'completed' : 'pending'}`}
              >
                <span className="progress-label">Phase 4b</span>
                <span className="progress-status">高度機能</span>
              </div>
              <div
                className={`progress-item ${currentPhase >= 'Phase 4c' ? 'completed' : 'pending'}`}
              >
                <span className="progress-label">Phase 4c</span>
                <span className="progress-status">最適化</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="no-evaluation">
          <p>AI評価を実行してください</p>
          <div className="phase-info">
            <strong>現在のフェーズ:</strong> {currentPhase}
            <br />
            <strong>機能:</strong> {phaseDescriptions[currentPhase]}
          </div>
        </div>
      )}
    </div>
  )
}
