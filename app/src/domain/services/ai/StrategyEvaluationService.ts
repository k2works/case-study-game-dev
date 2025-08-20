/**
 * 戦略評価サービス
 * mayah型AIの戦略評価システム実装（発火判断・凝視機能・リスク評価）
 */
import type { AIFieldState, AIGameState } from '../../models/ai/GameState'
import type {
  ChainEvaluation,
  GamePhase,
  MayahEvaluationSettings,
  RensaHandTree,
  StrategyEvaluation,
} from '../../models/ai/MayahEvaluation'
import {
  DEFAULT_MAYAH_SETTINGS,
  GamePhase as PHASE,
} from '../../models/ai/MayahEvaluation'

/**
 * 発火判断の結果
 */
export interface FireDecision {
  /** 発火すべきかどうか */
  shouldFire: boolean
  /** 発火の緊急度（0-1） */
  urgency: number
  /** 発火タイミングスコア */
  timingScore: number
  /** 推奨発火タイミング（フレーム数） */
  recommendedTiming: number
  /** 理由 */
  reason: string
}

/**
 * 凝視評価の結果
 */
export interface GazeEvaluation {
  /** 凝視スコア（相手への脅威度） */
  gazeScore: number
  /** 凝視対象の列 */
  targetColumns: number[]
  /** 凝視の効果的期間 */
  effectiveDuration: number
  /** 凝視による相手の制限度 */
  opponentConstraint: number
}

/**
 * リスク評価の結果
 */
export interface RiskAssessment {
  /** 総合リスクスコア（0-100） */
  totalRisk: number
  /** 相手の攻撃リスク */
  opponentAttackRisk: number
  /** 自分の防御力 */
  defenseCapability: number
  /** 発火失敗リスク */
  misfireRisk: number
  /** 時間切れリスク */
  timeoutRisk: number
  /** 推奨防御行動 */
  recommendedDefense: DefenseAction[]
}

/**
 * 防御行動
 */
export interface DefenseAction {
  /** 行動タイプ */
  type: 'build_chain' | 'counter_attack' | 'obstruct' | 'consolidate'
  /** 行動の優先度（0-1） */
  priority: number
  /** 実行にかかる推定フレーム数 */
  estimatedFrames: number
  /** 行動の説明 */
  description: string
}

/**
 * 戦略評価を実行
 */
export const evaluateStrategy = (
  myGameState: AIGameState,
  opponentGameState: AIGameState,
  myChainEvaluation: ChainEvaluation,
  opponentChainEvaluation: ChainEvaluation,
  rensaHandTree?: RensaHandTree,
  gamePhase: GamePhase = PHASE.MIDDLE,
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): StrategyEvaluation => {
  // 発火タイミング評価
  const fireDecision = evaluateFireTiming(
    myGameState,
    opponentGameState,
    myChainEvaluation,
    opponentChainEvaluation,
    rensaHandTree,
    gamePhase,
    settings,
  )

  // 凝視評価
  const gazeEvaluation = evaluateGaze(
    myGameState.field,
    opponentGameState.field,
    opponentChainEvaluation,
    settings,
  )

  // リスク評価
  const riskAssessment = assessRisk(
    myGameState,
    opponentGameState,
    myChainEvaluation,
    opponentChainEvaluation,
    gamePhase,
    settings,
  )

  // 総合スコア計算
  const timingScore = fireDecision.timingScore
  const gazeScore = gazeEvaluation.gazeScore
  const riskScore = Math.max(0, 100 - riskAssessment.totalRisk)
  const defenseScore = riskAssessment.defenseCapability

  const totalScore = Math.round(
    timingScore * 0.4 +
      gazeScore * 0.25 +
      riskScore * 0.2 +
      defenseScore * 0.15,
  )

  return {
    timingScore: Math.round(timingScore),
    gazeScore: Math.round(gazeScore),
    riskScore: Math.round(riskScore),
    defenseScore: Math.round(defenseScore),
    totalScore,
  }
}

/**
 * 発火タイミングを評価
 */
export const evaluateFireTiming = (
  myGameState: AIGameState,
  _opponentGameState: AIGameState,
  myChainEvaluation: ChainEvaluation,
  opponentChainEvaluation: ChainEvaluation,
  rensaHandTree?: RensaHandTree,
  gamePhase: GamePhase = PHASE.MIDDLE,
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): FireDecision => {
  const myFieldHeight = getMaxFieldHeight(myGameState.field)

  // 緊急時の判定
  const isEmergency = myFieldHeight >= settings.emergencyHeight
  const opponentThreat = opponentChainEvaluation.totalScore > 500

  // 基本発火スコア
  let timingScore = calculateBaseTimingScore(
    myChainEvaluation,
    opponentChainEvaluation,
    gamePhase,
  )

  // RensaHandTreeがある場合の補正
  if (rensaHandTree) {
    const treeBonus = Math.min(rensaHandTree.battleEvaluation / 10, 20)
    timingScore += treeBonus
  }

  // フェーズ別補正
  timingScore = applyPhaseModifier(timingScore, gamePhase, myChainEvaluation)

  // 発火判断を計算
  const fireDecisionResult = calculateFireDecision(
    isEmergency,
    opponentThreat,
    myChainEvaluation,
    opponentChainEvaluation,
    gamePhase,
    timingScore,
  )

  // 推奨タイミング（フレーム数）
  const recommendedTiming =
    rensaHandTree?.optimalTiming ||
    Math.max(1, Math.round(fireDecisionResult.urgency * 300))

  return {
    shouldFire: fireDecisionResult.shouldFire,
    urgency: Math.min(fireDecisionResult.urgency, 1.0),
    timingScore: Math.round(timingScore),
    recommendedTiming,
    reason: fireDecisionResult.reason,
  }
}

/**
 * 発火判断を計算
 */
const calculateFireDecision = (
  isEmergency: boolean,
  opponentThreat: boolean,
  myChainEvaluation: ChainEvaluation,
  opponentChainEvaluation: ChainEvaluation,
  gamePhase: GamePhase,
  timingScore: number,
): { shouldFire: boolean; urgency: number; reason: string } => {
  let urgency = 0
  let shouldFire = false
  let reason = ''

  if (isEmergency) {
    urgency = 0.9
    shouldFire = myChainEvaluation.totalScore > 100
    reason = 'フィールド高さ限界による緊急発火'
  } else if (
    opponentThreat &&
    myChainEvaluation.totalScore > opponentChainEvaluation.totalScore * 0.8
  ) {
    urgency = 0.7
    shouldFire = true
    reason = '相手の脅威に対する先制攻撃'
  } else if (myChainEvaluation.totalScore > 800 && gamePhase === PHASE.LATE) {
    urgency = 0.6
    shouldFire = true
    reason = '終盤の高スコア連鎖確定'
  } else if (timingScore > 75) {
    urgency = 0.5
    shouldFire = true
    reason = 'タイミングスコアによる発火推奨'
  } else {
    urgency = Math.max(0, (timingScore - 50) / 50)
    shouldFire = false
    reason = '連鎖構築継続推奨'
  }

  return { shouldFire, urgency, reason }
}

/**
 * 凝視機能を評価
 */
export const evaluateGaze = (
  _myField: AIFieldState,
  opponentField: AIFieldState,
  opponentChainEvaluation: ChainEvaluation,
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): GazeEvaluation => {
  // 相手の危険な列を特定
  const dangerousColumns = identifyDangerousColumns(
    opponentField,
    opponentChainEvaluation,
  )

  // 凝視ターゲット選定
  const targetColumns = selectGazeTargets(dangerousColumns, opponentField)

  // 凝視スコア計算
  const gazeScore = calculateGazeScore(
    targetColumns,
    opponentField,
    opponentChainEvaluation,
    settings,
  )

  // 効果的期間の推定
  const effectiveDuration = estimateGazeEffectiveDuration(
    targetColumns,
    opponentChainEvaluation,
  )

  // 相手への制限度
  const opponentConstraint = calculateOpponentConstraint(
    targetColumns,
    opponentField,
    opponentChainEvaluation,
  )

  return {
    gazeScore: Math.round(gazeScore),
    targetColumns,
    effectiveDuration,
    opponentConstraint: Math.round(opponentConstraint * 100) / 100,
  }
}

/**
 * リスクを評価
 */
export const assessRisk = (
  myGameState: AIGameState,
  opponentGameState: AIGameState,
  myChainEvaluation: ChainEvaluation,
  opponentChainEvaluation: ChainEvaluation,
  gamePhase: GamePhase,
  settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
): RiskAssessment => {
  // 相手の攻撃リスク
  const opponentAttackRisk = calculateOpponentAttackRisk(
    opponentGameState,
    opponentChainEvaluation,
    gamePhase,
    settings,
  )

  // 自分の防御力
  const defenseCapability = calculateDefenseCapability(
    myGameState,
    myChainEvaluation,
    gamePhase,
  )

  // 発火失敗リスク
  const misfireRisk = calculateMisfireRisk(myGameState.field, myChainEvaluation)

  // 時間切れリスク（ゲームフェーズ依存）
  const timeoutRisk = calculateTimeoutRisk(gamePhase, myChainEvaluation)

  // 総合リスク
  const totalRisk = Math.round(
    opponentAttackRisk * 0.4 +
      misfireRisk * 0.3 +
      timeoutRisk * 0.2 +
      (100 - defenseCapability) * 0.1,
  )

  // 推奨防御行動
  const recommendedDefense = generateDefenseRecommendations(
    myGameState,
    opponentGameState,
    myChainEvaluation,
    opponentChainEvaluation,
    totalRisk,
  )

  return {
    totalRisk: Math.min(totalRisk, 100),
    opponentAttackRisk: Math.round(opponentAttackRisk),
    defenseCapability: Math.round(defenseCapability),
    misfireRisk: Math.round(misfireRisk),
    timeoutRisk: Math.round(timeoutRisk),
    recommendedDefense,
  }
}

/**
 * フィールドの最大高さを取得
 */
const getMaxFieldHeight = (field: AIFieldState): number => {
  let maxHeight = 0
  for (let x = 0; x < field.width; x++) {
    for (let y = 0; y < field.height; y++) {
      if (field.cells[y][x] !== null) {
        maxHeight = Math.max(maxHeight, field.height - y)
        break
      }
    }
  }
  return maxHeight
}

/**
 * 基本発火タイミングスコアを計算
 */
const calculateBaseTimingScore = (
  myChainEvaluation: ChainEvaluation,
  opponentChainEvaluation: ChainEvaluation,
  _gamePhase: GamePhase,
): number => {
  const myScore = myChainEvaluation.totalScore
  const opponentScore = opponentChainEvaluation.totalScore
  const scoreDiff = myScore - opponentScore

  let baseScore = getBaseScoreFromDiff(scoreDiff)

  // 自分の連鎖品質による補正
  baseScore += getQualityBonus(myChainEvaluation)

  return baseScore
}

/**
 * スコア差から基本スコアを取得
 */
const getBaseScoreFromDiff = (scoreDiff: number): number => {
  if (scoreDiff > 200) {
    return 80 // 有利
  } else if (scoreDiff > 0) {
    return 60 // やや有利
  } else if (scoreDiff > -200) {
    return 40 // やや不利
  } else {
    return 20 // 不利
  }
}

/**
 * 連鎖品質ボーナスを取得
 */
const getQualityBonus = (chainEvaluation: ChainEvaluation): number => {
  let bonus = 0
  if (chainEvaluation.feasibilityScore > 70) {
    bonus += 15
  }
  if (chainEvaluation.stabilityScore > 70) {
    bonus += 10
  }
  return bonus
}

/**
 * フェーズ別修正を適用
 */
const applyPhaseModifier = (
  baseScore: number,
  gamePhase: GamePhase,
  myChainEvaluation: ChainEvaluation,
): number => {
  switch (gamePhase) {
    case PHASE.EARLY:
      // 序盤は連鎖構築を重視、早期発火を抑制
      return baseScore * 0.7
    case PHASE.MIDDLE:
      // 中盤は標準評価
      return baseScore
    case PHASE.LATE: {
      // 終盤は発火を促進、特に高スコア連鎖は積極的
      const lateBonus = myChainEvaluation.totalScore > 500 ? 1.3 : 1.1
      return baseScore * lateBonus
    }
    case PHASE.EMERGENCY:
      // 緊急時は即座発火
      return Math.max(baseScore * 1.5, 90)
    default:
      return baseScore
  }
}

/**
 * 危険な列を特定
 */
const identifyDangerousColumns = (
  opponentField: AIFieldState,
  opponentChainEvaluation: ChainEvaluation,
): Array<{ column: number; threat: number }> => {
  const dangerousColumns: Array<{ column: number; threat: number }> = []

  // 各列の脅威度を評価
  for (let x = 0; x < opponentField.width; x++) {
    const threat = calculateColumnThreat(
      x,
      opponentField,
      opponentChainEvaluation,
    )

    if (threat > 30) {
      dangerousColumns.push({ column: x, threat: Math.round(threat) })
    }
  }

  return dangerousColumns.sort((a, b) => b.threat - a.threat)
}

/**
 * 列の脅威度を計算
 */
const calculateColumnThreat = (
  x: number,
  opponentField: AIFieldState,
  opponentChainEvaluation: ChainEvaluation,
): number => {
  const columnHeight = getColumnHeight(opponentField, x)
  const spaceRemaining = opponentField.height - columnHeight

  let threat = 0

  // 高さによる脅威度
  if (spaceRemaining <= 2) {
    threat += 80 // 危険な高さ
  } else if (spaceRemaining <= 4) {
    threat += 50 // 注意が必要
  } else {
    threat += Math.max(0, 30 - spaceRemaining * 3) // 余裕がある
  }

  // 連鎖パターンの関与度
  for (const pattern of opponentChainEvaluation.patterns) {
    if (x >= pattern.position.startX && x <= pattern.position.endX) {
      threat += pattern.potential * 0.5
    }
  }

  return threat
}

/**
 * 凝視ターゲットを選定
 */
const selectGazeTargets = (
  dangerousColumns: Array<{ column: number; threat: number }>,
  _opponentField: AIFieldState,
): number[] => {
  const targets: number[] = []

  // 最も脅威の高い列を選択（最大3列）
  for (let i = 0; i < Math.min(3, dangerousColumns.length); i++) {
    const column = dangerousColumns[i].column

    // 隣接列の影響を考慮して選定
    const isAdjacent = targets.some((target) => Math.abs(target - column) === 1)
    if (!isAdjacent || dangerousColumns[i].threat > 70) {
      targets.push(column)
    }
  }

  return targets.slice(0, 3) // 最大3列まで
}

/**
 * 凝視スコアを計算
 */
const calculateGazeScore = (
  targetColumns: number[],
  opponentField: AIFieldState,
  opponentChainEvaluation: ChainEvaluation,
  _settings: MayahEvaluationSettings,
): number => {
  if (targetColumns.length === 0) return 0

  let gazeScore = 0

  // ターゲット列の脅威度合計
  gazeScore += calculateTargetThreatScore(
    targetColumns,
    opponentField,
    opponentChainEvaluation,
  )

  // ターゲット数によるボーナス
  const targetBonus = Math.min(targetColumns.length * 5, 15)
  gazeScore += targetBonus

  return Math.min(gazeScore, 100)
}

/**
 * ターゲット列の脅威スコアを計算
 */
const calculateTargetThreatScore = (
  targetColumns: number[],
  opponentField: AIFieldState,
  opponentChainEvaluation: ChainEvaluation,
): number => {
  let threatScore = 0

  for (const col of targetColumns) {
    const columnHeight = getColumnHeight(opponentField, col)
    const remainingSpace = opponentField.height - columnHeight

    // 高さによるスコア
    if (remainingSpace <= 2) {
      threatScore += 30
    } else if (remainingSpace <= 4) {
      threatScore += 20
    } else {
      threatScore += 10
    }

    // パターン関与度によるスコア
    for (const pattern of opponentChainEvaluation.patterns) {
      if (col >= pattern.position.startX && col <= pattern.position.endX) {
        threatScore += pattern.potential * 0.3
      }
    }
  }

  return threatScore
}

/**
 * 凝視の効果的期間を推定
 */
const estimateGazeEffectiveDuration = (
  targetColumns: number[],
  opponentChainEvaluation: ChainEvaluation,
): number => {
  if (targetColumns.length === 0) return 0

  // 基本的な効果期間（フレーム数）
  let baseDuration = 180 // 3秒

  // 相手の連鎖完成度が高いほど短期間
  const avgCompleteness =
    opponentChainEvaluation.patterns.length > 0
      ? opponentChainEvaluation.patterns.reduce(
          (sum, p) => sum + p.completeness,
          0,
        ) / opponentChainEvaluation.patterns.length
      : 0

  baseDuration *= 1 - avgCompleteness * 0.3

  // ターゲット数による調整
  baseDuration *= 1 + targetColumns.length * 0.1

  return Math.round(baseDuration)
}

/**
 * 相手への制限度を計算
 */
const calculateOpponentConstraint = (
  targetColumns: number[],
  opponentField: AIFieldState,
  opponentChainEvaluation: ChainEvaluation,
): number => {
  if (targetColumns.length === 0) return 0

  let constraint = 0

  // ターゲット列の制限効果
  for (const col of targetColumns) {
    const columnHeight = getColumnHeight(opponentField, col)
    const remainingSpace = opponentField.height - columnHeight

    // 高さによる制限度
    if (remainingSpace <= 2) {
      constraint += 0.4 // 強い制限
    } else if (remainingSpace <= 4) {
      constraint += 0.25 // 中程度の制限
    } else {
      constraint += 0.1 // 軽微な制限
    }
  }

  // パターン阻害効果
  for (const pattern of opponentChainEvaluation.patterns) {
    const overlappingTargets = targetColumns.filter(
      (col) => col >= pattern.position.startX && col <= pattern.position.endX,
    )
    if (overlappingTargets.length > 0) {
      constraint += overlappingTargets.length * 0.1
    }
  }

  return Math.min(constraint, 1.0)
}

/**
 * 列の高さを取得
 */
const getColumnHeight = (field: AIFieldState, x: number): number => {
  for (let y = 0; y < field.height; y++) {
    if (field.cells[y][x] !== null) {
      return field.height - y
    }
  }
  return 0
}

/**
 * 相手の攻撃リスクを計算
 */
const calculateOpponentAttackRisk = (
  opponentGameState: AIGameState,
  opponentChainEvaluation: ChainEvaluation,
  gamePhase: GamePhase,
  settings: MayahEvaluationSettings,
): number => {
  let attackRisk = 0

  // 相手の連鎖スコアによるリスク
  attackRisk += getScoreBasedRisk(opponentChainEvaluation.totalScore)

  // 相手のフィールド状況
  const opponentMaxHeight = getMaxFieldHeight(opponentGameState.field)
  if (opponentMaxHeight >= settings.emergencyHeight - 2) {
    attackRisk += 30 // 相手も切羽詰まっているので攻撃してくる可能性高
  }

  // フェーズによる調整
  attackRisk = applyPhaseRiskModifier(attackRisk, gamePhase)

  return Math.min(attackRisk, 100)
}

/**
 * スコアに基づくリスクを計算
 */
const getScoreBasedRisk = (opponentScore: number): number => {
  if (opponentScore > 800) {
    return 60
  } else if (opponentScore > 500) {
    return 40
  } else if (opponentScore > 200) {
    return 20
  }
  return 0
}

/**
 * フェーズに基づくリスク修正を適用
 */
const applyPhaseRiskModifier = (
  attackRisk: number,
  gamePhase: GamePhase,
): number => {
  switch (gamePhase) {
    case PHASE.EARLY:
      return attackRisk * 0.5 // 序盤は攻撃リスク低
    case PHASE.LATE:
      return attackRisk * 1.3 // 終盤は攻撃リスク高
    case PHASE.EMERGENCY:
      return attackRisk * 1.5 // 緊急時は最大リスク
    default:
      return attackRisk
  }
}

/**
 * 防御力を計算
 */
const calculateDefenseCapability = (
  myGameState: AIGameState,
  myChainEvaluation: ChainEvaluation,
  gamePhase: GamePhase,
): number => {
  let defenseCapability = 0

  // 自分の連鎖による防御力
  const myScore = myChainEvaluation.totalScore
  if (myScore > 600) {
    defenseCapability += 50 // 反撃能力高
  } else if (myScore > 300) {
    defenseCapability += 30
  } else {
    defenseCapability += 10
  }

  // フィールドの余裕度
  const myMaxHeight = getMaxFieldHeight(myGameState.field)
  const spaceRemaining = myGameState.field.height - myMaxHeight
  if (spaceRemaining >= 6) {
    defenseCapability += 30 // 十分な余裕
  } else if (spaceRemaining >= 4) {
    defenseCapability += 20
  } else if (spaceRemaining >= 2) {
    defenseCapability += 10
  } // spaceRemaining < 2の場合は0

  // 連鎖の安定性
  if (myChainEvaluation.stabilityScore > 70) {
    defenseCapability += 15
  }

  // フェーズによる調整
  if (gamePhase === PHASE.EARLY) {
    defenseCapability *= 1.2 // 序盤は防御しやすい
  }

  return Math.min(defenseCapability, 100)
}

/**
 * 発火失敗リスクを計算
 */
const calculateMisfireRisk = (
  myField: AIFieldState,
  myChainEvaluation: ChainEvaluation,
): number => {
  let misfireRisk = 0

  // 連鎖の実現可能性が低いほどリスク高
  const feasibility = myChainEvaluation.feasibilityScore
  misfireRisk += Math.max(0, 100 - feasibility) * 0.5

  // 連鎖の安定性が低いほどリスク高
  const stability = myChainEvaluation.stabilityScore
  misfireRisk += Math.max(0, 100 - stability) * 0.3

  // フィールドの複雑さによるリスク
  const fieldComplexity = calculateFieldComplexity(myField)
  misfireRisk += fieldComplexity * 0.2

  return Math.min(misfireRisk, 100)
}

/**
 * 時間切れリスクを計算
 */
const calculateTimeoutRisk = (
  gamePhase: GamePhase,
  myChainEvaluation: ChainEvaluation,
): number => {
  let timeoutRisk = 0

  // フェーズによる基本リスク
  switch (gamePhase) {
    case PHASE.EARLY:
      timeoutRisk = 5
      break
    case PHASE.MIDDLE:
      timeoutRisk = 20
      break
    case PHASE.LATE:
      timeoutRisk = 50
      break
    case PHASE.EMERGENCY:
      timeoutRisk = 80
      break
  }

  // 連鎖構築の複雑さによる調整
  const chainComplexity = myChainEvaluation.diversityScore
  timeoutRisk += chainComplexity * 0.2

  return Math.min(timeoutRisk, 100)
}

/**
 * フィールドの複雑さを計算
 */
const calculateFieldComplexity = (field: AIFieldState): number => {
  let complexity = 0
  const colorCount = new Set<string>()

  // 色数とパターンの複雑さを評価
  complexity += calculateCellComplexity(field, colorCount)

  // 色数による複雑さ
  complexity += colorCount.size * 2

  return Math.min((complexity / (field.width * field.height)) * 100, 100)
}

/**
 * セルレベルの複雑さを計算
 */
const calculateCellComplexity = (
  field: AIFieldState,
  colorCount: Set<string>,
): number => {
  let complexity = 0

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const cell = field.cells[y][x]
      if (cell) {
        colorCount.add(cell)
        complexity += countAdjacentDifferentColors(field, x, y, cell) * 0.5
      }
    }
  }

  return complexity
}

/**
 * 隣接する異色の数を数える
 */
const countAdjacentDifferentColors = (
  field: AIFieldState,
  x: number,
  y: number,
  currentColor: string,
): number => {
  let count = 0
  const directions = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ]

  for (const [dx, dy] of directions) {
    const nx = x + dx
    const ny = y + dy
    if (nx >= 0 && nx < field.width && ny >= 0 && ny < field.height) {
      const neighborCell = field.cells[ny][nx]
      if (neighborCell && neighborCell !== currentColor) {
        count++
      }
    }
  }

  return count
}

/**
 * 防御推奨行動を生成
 */
const generateDefenseRecommendations = (
  _myGameState: AIGameState,
  _opponentGameState: AIGameState,
  myChainEvaluation: ChainEvaluation,
  opponentChainEvaluation: ChainEvaluation,
  totalRisk: number,
): DefenseAction[] => {
  const recommendations: DefenseAction[] = []

  const myScore = myChainEvaluation.totalScore
  const opponentScore = opponentChainEvaluation.totalScore
  const scoreDiff = myScore - opponentScore

  // リスクレベルに応じた推奨行動を追加
  addRiskBasedRecommendations(recommendations, totalRisk, myScore, scoreDiff)

  // 相手の脅威度に応じた追加推奨
  if (opponentScore > 600) {
    recommendations.push({
      type: 'obstruct',
      priority: 0.7,
      estimatedFrames: 150,
      description: '高威力連鎖への妨害',
    })
  }

  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 3)
}

/**
 * リスクレベルに応じた推奨行動を追加
 */
const addRiskBasedRecommendations = (
  recommendations: DefenseAction[],
  totalRisk: number,
  myScore: number,
  scoreDiff: number,
): void => {
  if (totalRisk > 70) {
    // 高リスク：即座の対応が必要
    if (myScore > 400) {
      recommendations.push({
        type: 'counter_attack',
        priority: 0.9,
        estimatedFrames: 180,
        description: '即座の反撃連鎖発火',
      })
    } else {
      recommendations.push({
        type: 'obstruct',
        priority: 0.8,
        estimatedFrames: 120,
        description: '相手連鎖の妨害',
      })
    }
  } else if (totalRisk > 40) {
    // 中リスク：準備をしつつ対応
    if (scoreDiff > 0) {
      recommendations.push({
        type: 'build_chain',
        priority: 0.7,
        estimatedFrames: 300,
        description: '連鎖強化して有利を拡大',
      })
    } else {
      recommendations.push({
        type: 'counter_attack',
        priority: 0.6,
        estimatedFrames: 240,
        description: '逆転のための連鎖構築',
      })
    }
  } else {
    // 低リスク：安定した連鎖構築
    recommendations.push({
      type: 'consolidate',
      priority: 0.5,
      estimatedFrames: 360,
      description: '安定した大連鎖の構築',
    })
  }
}
