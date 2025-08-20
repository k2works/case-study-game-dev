/**
 * RensaHandTree実装サービス
 * mayah AIの連鎖木構築システム - 連鎖の分岐構造を木で表現し最適パスを探索
 */
import type { PuyoColor } from '../../models/Puyo'
import type { AIFieldState } from '../../models/ai/GameState'
import type {
  MayahEvaluationSettings,
  RensaHandTree,
  RensaNode,
} from '../../models/ai/MayahEvaluation'
import { DEFAULT_MAYAH_SETTINGS } from '../../models/ai/MayahEvaluation'

/**
 * 連鎖ノードの詳細情報
 */
export interface RensaNodeDetail extends RensaNode {
  /** 連鎖段数 */
  chainLength: number
  /** 累積スコア */
  accumulatedScore: number
  /** 実現可能性 */
  feasibility: number
  /** この連鎖に必要な手数 */
  requiredMoves: number
  /** 連鎖効率（スコア/手数） */
  efficiency: number
  /** 子ノード（RensaNodeDetailに変更） */
  children: RensaNodeDetail[]
}

/**
 * 連鎖探索結果
 */
export interface ChainSearchResult {
  /** 発見された連鎖木 */
  tree: RensaHandTree
  /** 最適連鎖パス */
  optimalPath: RensaNodeDetail[]
  /** 探索統計 */
  searchStats: {
    nodesEvaluated: number
    maxDepth: number
    timeElapsed: number
  }
}

/**
 * 連鎖探索設定
 */
export interface ChainSearchSettings {
  /** 最大探索深度 */
  maxDepth: number
  /** 最大探索ノード数 */
  maxNodes: number
  /** 最小連鎖スコア閾値 */
  minChainScore: number
  /** 探索時間制限（ミリ秒） */
  timeLimit: number
  /** 分岐因子制限 */
  maxBranching: number
}

/**
 * デフォルト連鎖探索設定
 */
export const DEFAULT_CHAIN_SEARCH_SETTINGS: ChainSearchSettings = {
  maxDepth: 8,
  maxNodes: 1000,
  minChainScore: 500,
  timeLimit: 5000, // 5秒
  maxBranching: 5,
}

/**
 * RensaHandTreeを構築する
 */
export const buildRensaHandTree = (
  myField: AIFieldState,
  opponentField: AIFieldState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _settings: MayahEvaluationSettings = DEFAULT_MAYAH_SETTINGS,
  searchSettings: ChainSearchSettings = DEFAULT_CHAIN_SEARCH_SETTINGS,
): ChainSearchResult => {
  const startTime = Date.now()
  let nodesEvaluated = 0
  let maxDepth = 0

  // 自分の連鎖木を構築
  const myTree = buildChainTree(myField, searchSettings, (depth) => {
    maxDepth = Math.max(maxDepth, depth)
    nodesEvaluated++
    return Date.now() - startTime < searchSettings.timeLimit
  })

  // 相手の連鎖木を構築
  const opponentTree = buildChainTree(
    opponentField,
    searchSettings,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (_depth) => {
      nodesEvaluated++
      return Date.now() - startTime < searchSettings.timeLimit
    },
  )

  // 最適発火タイミングを計算
  const optimalTiming = calculateOptimalTiming(myTree, opponentTree)

  // 打ち合い評価を実行
  const battleEvaluation = evaluateBattle(myTree, opponentTree, optimalTiming)

  // 最適パスを抽出
  const optimalPath = extractOptimalPath(myTree)

  const tree: RensaHandTree = {
    myTree,
    opponentTree,
    optimalTiming,
    battleEvaluation,
  }

  return {
    tree,
    optimalPath,
    searchStats: {
      nodesEvaluated,
      maxDepth,
      timeElapsed: Date.now() - startTime,
    },
  }
}

/**
 * 連鎖木を構築
 */
const buildChainTree = (
  field: AIFieldState,
  settings: ChainSearchSettings,
  continueCondition: (depth: number) => boolean,
): RensaNodeDetail => {
  const rootNode = createRootNode(field)

  // 深度優先探索で連鎖木を構築
  buildChainTreeRecursive(rootNode, field, settings, 0, continueCondition)

  return rootNode
}

/**
 * ルートノードを作成
 */
const createRootNode = (field: AIFieldState): RensaNodeDetail => {
  const chainCount = detectChainCount(field)
  const score = calculateChainScore(field, chainCount)

  return {
    chainCount,
    score,
    frameCount: 0,
    requiredPuyos: 0,
    probability: 1.0,
    children: [],
    chainLength: 0,
    accumulatedScore: 0,
    feasibility: 1.0,
    requiredMoves: 0,
    efficiency: 0,
  }
}

/**
 * 再帰的に連鎖木を構築
 */
const buildChainTreeRecursive = (
  node: RensaNodeDetail,
  field: AIFieldState,
  settings: ChainSearchSettings,
  depth: number,
  continueCondition: (depth: number) => boolean,
): void => {
  // 終了条件チェック
  if (
    depth >= settings.maxDepth ||
    !continueCondition(depth) ||
    node.score < settings.minChainScore
  ) {
    return
  }

  // 可能な連鎖パターンを生成
  const possibleChains = generatePossibleChains(field, settings)

  // 各連鎖に対して子ノードを作成
  for (
    let i = 0;
    i < Math.min(possibleChains.length, settings.maxBranching);
    i++
  ) {
    const chainPattern = possibleChains[i]
    const newField = simulateChain(field, chainPattern)

    if (newField) {
      const childNode = createChildNode(node, newField, chainPattern, depth + 1)
      node.children.push(childNode)

      // 再帰的に子ノードを展開
      buildChainTreeRecursive(
        childNode,
        newField,
        settings,
        depth + 1,
        continueCondition,
      )
    }
  }

  // 子ノードをスコア順にソート
  node.children.sort((a, b) => b.efficiency - a.efficiency)
}

/**
 * 子ノードを作成
 */
const createChildNode = (
  parent: RensaNodeDetail,
  field: AIFieldState,
  chainPattern: ChainPattern,
  depth: number,
): RensaNodeDetail => {
  const chainCount = detectChainCount(field)
  const score = calculateChainScore(field, chainCount)
  const accumulatedScore = parent.accumulatedScore + score
  const requiredMoves =
    parent.requiredMoves + estimateRequiredMoves(chainPattern)
  // NaN対策：除算前にチェック
  const efficiency =
    requiredMoves > 0 && !isNaN(accumulatedScore)
      ? accumulatedScore / requiredMoves
      : 0
  const feasibility = calculateFeasibility(field, chainPattern, depth)

  return {
    chainCount,
    score,
    frameCount: parent.frameCount + Math.max(1, requiredMoves) * 60, // 仮の値
    requiredPuyos: parent.requiredPuyos + chainPattern.requiredColors.length,
    probability: parent.probability * feasibility,
    children: [],
    chainLength: parent.chainLength + 1,
    accumulatedScore,
    feasibility,
    requiredMoves: Math.max(1, requiredMoves), // 最低1手は必要
    efficiency: isNaN(efficiency) ? 0 : efficiency,
  }
}

/**
 * 可能な連鎖パターンを生成
 */
const generatePossibleChains = (
  field: AIFieldState,
  settings: ChainSearchSettings,
): ChainPattern[] => {
  const patterns: ChainPattern[] = []
  const visited = new Set<string>()

  // フィールドの各位置で連鎖の可能性をチェック
  for (let x = 0; x < field.width; x++) {
    for (let y = 0; y < field.height; y++) {
      const key = `${x},${y}`
      if (field.cells[y][x] === null || visited.has(key)) continue

      // この位置から開始可能な連鎖パターンを生成
      const localPatterns = generateLocalChainPatterns(field, x, y)
      for (const pattern of localPatterns) {
        // 同じ色のグループは重複排除
        const color = field.cells[y][x]
        const group = findConnectedGroup(field, x, y, color as string)
        for (const { x: gx, y: gy } of group) {
          visited.add(`${gx},${gy}`)
        }
        patterns.push(pattern)
      }
    }
  }

  // スコア順にソートして上位を返す
  return patterns
    .sort((a, b) => b.potential - a.potential)
    .slice(0, settings.maxBranching)
}

/**
 * 局所的な連鎖パターンを生成
 */
const generateLocalChainPatterns = (
  field: AIFieldState,
  startX: number,
  startY: number,
): ChainPattern[] => {
  const patterns: ChainPattern[] = []
  const color = field.cells[startY][startX]

  if (!color) return patterns

  // 同色のぷよを探索して連鎖グループを形成
  const chainGroup = findConnectedGroup(field, startX, startY, color)

  if (chainGroup.length >= 4) {
    // 4個以上の連結があれば連鎖パターンとして登録
    const minX = Math.min(...chainGroup.map((p) => p.x))
    const maxX = Math.max(...chainGroup.map((p) => p.x))
    const pattern: ChainPattern = {
      type: 'basic_chain',
      name: `${chainGroup.length}連結`,
      description: `${color}色の${chainGroup.length}個連結`,
      position: {
        startX: minX,
        endX: maxX,
        columns: maxX - minX + 1,
      },
      completeness: 1.0,
      triggerability: 0.9,
      extensibility: calculateChainExtensibility(field, chainGroup),
      potential: chainGroup.length * 10,
      efficiency: 0.8,
      difficulty: 0.3,
      stability: 0.7,
      requiredColors: [color],
    }
    patterns.push(pattern)
  } else if (chainGroup.length >= 2) {
    // 2個以上でも将来的な連鎖の可能性として登録
    const minX = Math.min(...chainGroup.map((p) => p.x))
    const maxX = Math.max(...chainGroup.map((p) => p.x))
    const pattern: ChainPattern = {
      type: 'potential_chain',
      name: `${chainGroup.length}連結(将来性)`,
      description: `${color}色の${chainGroup.length}個連結(拡張可能)`,
      position: {
        startX: minX,
        endX: maxX,
        columns: maxX - minX + 1,
      },
      completeness: chainGroup.length / 4.0, // 4個で完成
      triggerability: 0.5,
      extensibility: calculateChainExtensibility(field, chainGroup),
      potential: chainGroup.length * 5, // 低めのポテンシャル
      efficiency: 0.6,
      difficulty: 0.2,
      stability: 0.8,
      requiredColors: [color],
    }
    patterns.push(pattern)
  }

  return patterns
}

/**
 * 連結グループを見つける
 */
const findConnectedGroup = (
  field: AIFieldState,
  startX: number,
  startY: number,
  color: string,
): Array<{ x: number; y: number }> => {
  const visited = new Set<string>()
  const group: Array<{ x: number; y: number }> = []

  const dfs = (x: number, y: number) => {
    const key = `${x},${y}`
    if (visited.has(key) || !isValidCell(x, y, field, color)) {
      return
    }

    visited.add(key)
    group.push({ x, y })

    // 上下左右を探索
    exploreDirections(x, y, dfs)
  }

  dfs(startX, startY)
  return group
}

/**
 * セルが有効かチェック
 */
const isValidCell = (
  x: number,
  y: number,
  field: AIFieldState,
  color: string,
): boolean => {
  return (
    x >= 0 &&
    x < field.width &&
    y >= 0 &&
    y < field.height &&
    field.cells[y][x] === color
  )
}

/**
 * 4方向を探索
 */
const exploreDirections = (
  x: number,
  y: number,
  dfs: (x: number, y: number) => void,
): void => {
  const directions = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]
  for (const [dx, dy] of directions) {
    dfs(x + dx, y + dy)
  }
}

/**
 * 連鎖の拡張性を計算
 */
const calculateChainExtensibility = (
  field: AIFieldState,
  chainGroup: Array<{ x: number; y: number }>,
): number => {
  let extensibility = 0

  // 周囲に同色や関連色があるかチェック
  for (const { x, y } of chainGroup) {
    extensibility += calculateNeighborExtensibility(field, x, y, chainGroup)
  }

  return Math.min(extensibility, 1.0)
}

/**
 * 隣接セルの拡張性を計算
 */
const calculateNeighborExtensibility = (
  field: AIFieldState,
  x: number,
  y: number,
  chainGroup: Array<{ x: number; y: number }>,
): number => {
  let neighborExtensibility = 0
  const directions = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ]

  for (const { dx, dy } of directions) {
    const nx = x + dx
    const ny = y + dy

    if (
      isValidPosition(nx, ny, field) &&
      hasNeighborColor(nx, ny, field, chainGroup)
    ) {
      neighborExtensibility += 0.1
    }
  }

  return neighborExtensibility
}

/**
 * 位置が有効かチェック
 */
const isValidPosition = (
  x: number,
  y: number,
  field: AIFieldState,
): boolean => {
  return x >= 0 && x < field.width && y >= 0 && y < field.height
}

/**
 * 隣接色があるかチェック
 */
const hasNeighborColor = (
  x: number,
  y: number,
  field: AIFieldState,
  chainGroup: Array<{ x: number; y: number }>,
): boolean => {
  const neighborColor = field.cells[y][x]
  return (
    neighborColor !== null && !chainGroup.some((p) => p.x === x && p.y === y)
  )
}

/**
 * 連鎖をシミュレート
 */
const simulateChain = (
  field: AIFieldState,
  chainPattern: ChainPattern,
): AIFieldState | null => {
  // フィールドをコピー
  const newField: AIFieldState = {
    width: field.width,
    height: field.height,
    cells: field.cells.map((row) => [...row]),
  }

  // 連鎖パターンの位置のぷよを削除
  for (
    let x = chainPattern.position.startX;
    x <= chainPattern.position.endX;
    x++
  ) {
    for (let y = 0; y < field.height; y++) {
      if (
        field.cells[y][x] &&
        chainPattern.requiredColors.includes(field.cells[y][x] as string)
      ) {
        // 連結グループをチェックして4個以上なら削除
        const group = findConnectedGroup(
          field,
          x,
          y,
          field.cells[y][x] as string,
        )
        if (group.length >= 4) {
          for (const { x: gx, y: gy } of group) {
            newField.cells[gy][gx] = null
          }
        }
      }
    }
  }

  // 重力適用
  applyGravity(newField)

  return newField
}

/**
 * 重力を適用
 */
const applyGravity = (field: AIFieldState): void => {
  for (let x = 0; x < field.width; x++) {
    applyGravityToColumn(field, x)
  }
}

/**
 * 単一列に重力を適用
 */
const applyGravityToColumn = (field: AIFieldState, x: number): void => {
  const column = collectNonNullCells(field, x)
  clearColumn(field, x)
  placeColumnFromBottom(field, x, column)
}

/**
 * 列からnull以外のセルを収集
 */
const collectNonNullCells = (field: AIFieldState, x: number) => {
  const column = []
  for (let y = field.height - 1; y >= 0; y--) {
    if (field.cells[y][x] !== null) {
      column.push(field.cells[y][x])
    }
  }
  return column
}

/**
 * 列をクリア
 */
const clearColumn = (field: AIFieldState, x: number): void => {
  for (let y = 0; y < field.height; y++) {
    field.cells[y][x] = null
  }
}

/**
 * 下から列を配置
 */
const placeColumnFromBottom = (
  field: AIFieldState,
  x: number,
  column: (string | null)[],
): void => {
  for (let i = 0; i < column.length; i++) {
    const cellValue = column[i]
    field.cells[field.height - 1 - i][x] = cellValue as PuyoColor
  }
}

/**
 * 連鎖数を検出
 */
const detectChainCount = (field: AIFieldState): number => {
  let chainCount = 0

  // 全フィールドをスキャンして4個以上の連結を探す
  const visited = new Set<string>()

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const key = `${x},${y}`
      if (visited.has(key) || field.cells[y][x] === null) continue

      const color = field.cells[y][x] as string
      const group = findConnectedGroup(field, x, y, color)

      if (group.length >= 4) {
        chainCount++
        // この連結グループをvisitedに追加
        for (const { x: gx, y: gy } of group) {
          visited.add(`${gx},${gy}`)
        }
      }
    }
  }

  return chainCount
}

/**
 * 連鎖スコアを計算
 */
const calculateChainScore = (
  field: AIFieldState,
  chainCount: number,
): number => {
  if (chainCount === 0) return 0

  // ぷよぷよの基本スコア計算（簡易版）
  let baseScore = 0
  const chainBonus = Math.pow(2, Math.max(0, chainCount - 1)) * 10

  // 削除されるぷよの数を計算
  const deletedPuyos = countDeletablePuyos(field)
  baseScore = deletedPuyos * 10

  return Math.round(baseScore * chainBonus)
}

/**
 * 削除可能なぷよの数を数える
 */
const countDeletablePuyos = (field: AIFieldState): number => {
  let count = 0
  const visited = new Set<string>()

  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      const key = `${x},${y}`
      if (visited.has(key) || field.cells[y][x] === null) continue

      const color = field.cells[y][x] as string
      const group = findConnectedGroup(field, x, y, color)

      if (group.length >= 4) {
        count += group.length
        // この連結グループをvisitedに追加
        for (const { x: gx, y: gy } of group) {
          visited.add(`${gx},${gy}`)
        }
      }
    }
  }

  return count
}

/**
 * 必要手数を推定
 */
const estimateRequiredMoves = (chainPattern: ChainPattern): number => {
  // パターンの複雑さに基づいて手数を推定
  const baseMove = Math.max(1, chainPattern.position.columns)
  const feasibility = chainPattern.feasibility || 0.5
  const complexityMultiplier = 1 + (1 - feasibility) * 2

  const estimatedMoves = Math.round(baseMove * complexityMultiplier)
  return Math.max(1, isNaN(estimatedMoves) ? 1 : estimatedMoves)
}

/**
 * 実現可能性を計算
 */
const calculateFeasibility = (
  field: AIFieldState,
  chainPattern: ChainPattern,
  depth: number,
): number => {
  // 深度が深いほど実現可能性は下がる
  const depthPenalty = Math.pow(0.9, depth)

  // フィールドの空きスペースを考慮
  const emptySpaces = countEmptySpaces(field)
  const totalSpaces = field.width * field.height
  const spaceFactor = totalSpaces > 0 ? emptySpaces / totalSpaces : 0

  // パターン完成度も考慮
  const completeness = chainPattern.completeness || 0

  const feasibility = depthPenalty * spaceFactor * completeness
  return Math.min(isNaN(feasibility) ? 0 : feasibility, 1.0)
}

/**
 * 空きスペースを数える
 */
const countEmptySpaces = (field: AIFieldState): number => {
  let count = 0
  for (let y = 0; y < field.height; y++) {
    for (let x = 0; x < field.width; x++) {
      if (field.cells[y][x] === null) {
        count++
      }
    }
  }
  return count
}

/**
 * 最適発火タイミングを計算
 */
const calculateOptimalTiming = (
  myTree: RensaNodeDetail,
  opponentTree: RensaNodeDetail,
): number => {
  // 自分と相手の連鎖効率を比較
  const myEfficiency = myTree.efficiency || 0
  const opponentEfficiency = opponentTree.efficiency || 0
  const myMoves = Math.max(1, myTree.requiredMoves)
  const opponentMoves = Math.max(1, opponentTree.requiredMoves)

  if (myEfficiency > opponentEfficiency * 1.5) {
    // 自分が有利な場合、早めに発火
    return myMoves + 1
  } else if (opponentEfficiency > myEfficiency * 1.5) {
    // 相手が有利な場合、妨害を優先
    return Math.max(1, opponentMoves - 2)
  } else {
    // 拮抗している場合、標準的なタイミング
    return Math.max(1, myMoves + 2)
  }
}

/**
 * 打ち合い評価を実行
 */
const evaluateBattle = (
  myTree: RensaNodeDetail,
  opponentTree: RensaNodeDetail,
  optimalTiming: number,
): number => {
  const myScore = myTree.accumulatedScore || 0
  const opponentScore = opponentTree.accumulatedScore || 0
  const myMoves = Math.max(1, myTree.requiredMoves)

  // タイミング調整ボーナス
  const timingBonus = Math.abs(myMoves - optimalTiming) <= 1 ? 500 : 0

  // 効率性ボーナス
  const myEfficiency = myTree.efficiency || 0
  const opponentEfficiency = opponentTree.efficiency || 0
  const efficiencyBonus = (myEfficiency - opponentEfficiency) * 100

  // 総合評価
  const battleScore = myScore - opponentScore + timingBonus + efficiencyBonus
  return Math.round(isNaN(battleScore) ? 0 : battleScore)
}

/**
 * 最適パスを抽出
 */
const extractOptimalPath = (tree: RensaNodeDetail): RensaNodeDetail[] => {
  const path: RensaNodeDetail[] = [tree]
  let currentNode = tree

  // 最も効率的な子ノードを辿る
  while (currentNode.children.length > 0) {
    const bestChild = currentNode.children.reduce((best, child) =>
      child.efficiency > best.efficiency ? child : best,
    )
    path.push(bestChild)
    currentNode = bestChild
  }

  return path
}

/**
 * 連鎖木の可視化情報を生成
 */
export const generateTreeVisualization = (tree: RensaHandTree): string => {
  const lines: string[] = []

  lines.push('=== RensaHandTree 可視化 ===')
  lines.push(`最適発火タイミング: ${tree.optimalTiming}手`)
  lines.push(`打ち合い評価: ${tree.battleEvaluation}点`)
  lines.push('')

  lines.push('自分の連鎖木:')
  lines.push(visualizeNode(tree.myTree as RensaNodeDetail, 0))
  lines.push('')

  lines.push('相手の連鎖木:')
  lines.push(visualizeNode(tree.opponentTree as RensaNodeDetail, 0))

  return lines.join('\n')
}

/**
 * ノードを可視化
 */
const visualizeNode = (node: RensaNodeDetail, depth: number): string => {
  const indent = '  '.repeat(depth)
  const nodeInfo = `${indent}├─ ${node.chainLength}連鎖 (${node.score}点, 効率:${node.efficiency.toFixed(2)})`

  const children = node.children.map((child) => visualizeNode(child, depth + 1))

  return [nodeInfo, ...children].join('\n')
}

// 型のインポートのためのダミー
interface ChainPattern {
  type: string
  name: string
  description: string
  position: { startX: number; endX: number; columns: number }
  completeness: number
  triggerability: number
  extensibility: number
  potential: number
  efficiency: number
  difficulty: number
  stability: number
  requiredColors: string[]
  feasibility?: number
}
