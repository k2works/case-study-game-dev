/**
 * mayah AI統合評価ドメインサービス
 * 4要素評価システムを統合し、総合的な評価を行う
 */
import type { AIGameState, PossibleMove } from '../../models/ai'

/**
 * ゲームフェーズ定義
 */
// @ts-expect-error const enumを使用してコンパイル時の最適化を行う
export const enum GamePhase {
  EARLY = 'early', // 序盤（ぷよ数 < 30）
  MIDDLE = 'middle', // 中盤（30 <= ぷよ数 < 60）
  LATE = 'late', // 終盤（ぷよ数 >= 60）
}

/**
 * フェーズ別調整パラメータ
 */
export interface PhaseAdjustments {
  /** スキ許容度 */
  gapTolerance: number
  /** 連鎖優先度 */
  chainPriority: number
  /** 形重視度 */
  shapePriority: number
  /** 操作評価の重み */
  operationWeight: number
  /** 形評価の重み */
  shapeWeight: number
  /** 連鎖評価の重み */
  chainWeight: number
  /** 戦略評価の重み */
  strategyWeight: number
}

/**
 * mayah型統合評価結果
 */
export interface MayahStyleEvaluation {
  /** 操作評価スコア */
  operationScore: number
  /** 形評価スコア */
  shapeScore: number
  /** 連鎖評価スコア */
  chainScore: number
  /** 戦略評価スコア */
  strategyScore: number
  /** 総合スコア */
  totalScore: number
  /** フェーズ調整係数 */
  phaseAdjustment: number
  /** 評価理由 */
  reason: string
  /** ゲームフェーズ */
  gamePhase: GamePhase
}

/**
 * 統合評価設定
 */
export interface IntegratedEvaluationSettings {
  /** 操作評価の基本重み */
  baseOperationWeight?: number
  /** 形評価の基本重み */
  baseShapeWeight?: number
  /** 連鎖評価の基本重み */
  baseChainWeight?: number
  /** 戦略評価の基本重み */
  baseStrategyWeight?: number
}

/**
 * ゲームフェーズを判定
 */
// eslint-disable-next-line complexity
export const getGamePhase = (gameState: AIGameState): GamePhase => {
  // フィールドの存在チェック
  if (!gameState?.field?.cells || !Array.isArray(gameState.field.cells)) {
    return GamePhase.EARLY // デフォルトは序盤
  }

  // フィールド上のぷよ数をカウント
  let puyoCount = 0
  for (let y = 0; y < gameState.field.height; y++) {
    const row = gameState.field.cells[y]
    if (!row || !Array.isArray(row)) {
      continue // 行が存在しない場合はスキップ
    }
    for (let x = 0; x < gameState.field.width; x++) {
      if (row[x] !== null) {
        puyoCount++
      }
    }
  }

  if (puyoCount < 30) {
    return GamePhase.EARLY
  } else if (puyoCount < 60) {
    return GamePhase.MIDDLE
  } else {
    return GamePhase.LATE
  }
}

/**
 * フェーズ別調整パラメータを取得
 */
export const getPhaseAdjustments = (phase: GamePhase): PhaseAdjustments => {
  switch (phase) {
    case GamePhase.EARLY:
      return {
        gapTolerance: 0.5, // スキ許容度高
        chainPriority: 0.7, // 連鎖優先度中
        shapePriority: 1.0, // 形重視
        operationWeight: 0.8,
        shapeWeight: 1.2,
        chainWeight: 0.7,
        strategyWeight: 0.5,
      }
    case GamePhase.MIDDLE:
      return {
        gapTolerance: 0.3, // スキ許容度中
        chainPriority: 1.0, // 連鎖優先度高
        shapePriority: 0.8, // 形重視維持
        operationWeight: 1.0,
        shapeWeight: 1.0,
        chainWeight: 1.0,
        strategyWeight: 0.8,
      }
    case GamePhase.LATE:
      return {
        gapTolerance: 0.1, // スキ許容度低
        chainPriority: 1.2, // 連鎖最優先
        shapePriority: 0.5, // 形より実用性
        operationWeight: 1.2,
        shapeWeight: 0.6,
        chainWeight: 1.3,
        strategyWeight: 1.0,
      }
  }
}

/**
 * 最高スコア要素の理由を追加
 */
const addHighScoreReasons = (
  reasons: string[],
  scores: { operation: number; shape: number; chain: number; strategy: number },
): void => {
  const maxScore = Math.max(
    scores.operation,
    scores.shape,
    scores.chain,
    scores.strategy,
  )

  if (scores.operation === maxScore) {
    reasons.push('効率的な操作')
  }
  if (scores.shape === maxScore) {
    reasons.push('良好な形状')
  }
  if (scores.chain === maxScore) {
    reasons.push('連鎖構築優位')
  }
  if (scores.strategy === maxScore) {
    reasons.push('戦略的配置')
  }
}

/**
 * 連鎖情報の理由を追加
 */
const addChainInfoReasons = (
  reasons: string[],
  chainInfo?: { chainLength?: number; triggerProbability?: number },
): void => {
  if (chainInfo?.chainLength && chainInfo.chainLength > 0) {
    reasons.push(`${chainInfo.chainLength}連鎖可能`)
  }
  if (chainInfo?.triggerProbability && chainInfo.triggerProbability > 0.7) {
    reasons.push('発火確率高')
  }
}

/**
 * 評価理由を生成
 */
const generateEvaluationReason = (
  scores: { operation: number; shape: number; chain: number; strategy: number },
  phase: GamePhase,
  chainInfo?: { chainLength?: number; triggerProbability?: number },
): string => {
  const reasons: string[] = []

  addHighScoreReasons(reasons, scores)
  addChainInfoReasons(reasons, chainInfo)

  // フェーズ情報を追加
  const phaseInfo = {
    [GamePhase.EARLY]: '序盤：形重視',
    [GamePhase.MIDDLE]: '中盤：バランス重視',
    [GamePhase.LATE]: '終盤：連鎖優先',
  }
  reasons.push(phaseInfo[phase])

  return reasons.join('、')
}

/**
 * 統合評価サービス（メイン関数）
 * 各評価サービスを統合し、mayah型4要素評価を実行
 */
export const evaluateWithIntegratedSystem = (
  _move: PossibleMove,
  gameState: AIGameState,
  evaluationResults: {
    operation: { totalScore: number }
    shape: { totalScore: number }
    chain?: {
      totalScore: number
      chainLength?: number
      triggerProbability?: number
    }
    strategy?: { totalScore: number }
  },
  settings?: IntegratedEvaluationSettings,
): MayahStyleEvaluation => {
  // デフォルト設定
  const defaultSettings: Required<IntegratedEvaluationSettings> = {
    baseOperationWeight: 1.0,
    baseShapeWeight: 1.0,
    baseChainWeight: 1.0,
    baseStrategyWeight: 1.0,
  }
  const finalSettings = { ...defaultSettings, ...settings }

  // ゲームフェーズを判定
  const gamePhase = getGamePhase(gameState)
  const phaseAdjustments = getPhaseAdjustments(gamePhase)

  // 各評価スコアを計算（フェーズ調整を適用）
  const operationScore =
    evaluationResults.operation.totalScore *
    finalSettings.baseOperationWeight *
    phaseAdjustments.operationWeight

  const shapeScore =
    evaluationResults.shape.totalScore *
    finalSettings.baseShapeWeight *
    phaseAdjustments.shapeWeight

  // 連鎖評価：実際の連鎖評価結果を使用、なければデフォルト値
  const chainScore =
    (evaluationResults.chain?.totalScore ?? 50) *
    finalSettings.baseChainWeight *
    phaseAdjustments.chainWeight

  const strategyScore =
    (evaluationResults.strategy?.totalScore ?? 50) *
    finalSettings.baseStrategyWeight *
    phaseAdjustments.strategyWeight

  // 総合スコアを計算
  const totalScore = operationScore + shapeScore + chainScore + strategyScore

  // 評価理由を生成（連鎖情報を含む）
  const reason = generateEvaluationReason(
    {
      operation: operationScore,
      shape: shapeScore,
      chain: chainScore,
      strategy: strategyScore,
    },
    gamePhase,
    evaluationResults.chain,
  )

  return {
    operationScore,
    shapeScore,
    chainScore,
    strategyScore,
    totalScore,
    phaseAdjustment:
      phaseAdjustments.operationWeight +
      phaseAdjustments.shapeWeight +
      phaseAdjustments.chainWeight +
      phaseAdjustments.strategyWeight,
    reason,
    gamePhase,
  }
}
