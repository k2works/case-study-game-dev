import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Config } from '../models/Config'
import { Stage } from './Stage'
import { useGameState } from '../hooks/useGameState'
import { GameControls } from './GameControls'

const COLORS = {
  black: '#000',
  buttonBlue: '#007bff',
  chainOrange: '#ff6b00',
  gameOverRed: '#ff0000',
  white: '#fff',
}

const isInBounds = (y: number, x: number, rows: number, columns: number): boolean => {
  return y >= 0 && y < rows && x >= 0 && x < columns
}

export const GameScreen: React.FC = () => {
  const config = new Config()
  const {
    grid,
    fallingPuyo,
    score,
    chainCount,
    isGameOver,
    moveLeft,
    moveRight,
    rotate,
    drop,
    restart,
  } = useGameState(config)

  // グリッドに落下中のぷよ（軸ぷよと子ぷよ）を重ねて表示用のグリッドを作成
  const displayGrid = useMemo(() => {
    const newGrid = grid.map((row) => [...row])

    // 軸ぷよを配置
    if (isInBounds(fallingPuyo.y, fallingPuyo.x, config.stageRows, config.stageColumns)) {
      newGrid[fallingPuyo.y][fallingPuyo.x] = fallingPuyo.main.color
    }

    // 子ぷよを配置
    const subY = fallingPuyo.y + fallingPuyo.sub.dy
    const subX = fallingPuyo.x + fallingPuyo.sub.dx
    if (isInBounds(subY, subX, config.stageRows, config.stageColumns)) {
      newGrid[subY][subX] = fallingPuyo.sub.color
    }

    return newGrid
  }, [grid, fallingPuyo, config.stageRows, config.stageColumns])

  return (
    <View style={styles.container} testID="game-screen">
      <Text style={styles.title}>ぷよぷよゲーム</Text>

      {/* スコアと連鎖数の表示 */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreText}>スコア: {score}</Text>
        {chainCount > 0 && <Text style={styles.chainText}>{chainCount}連鎖!</Text>}
      </View>

      <Stage grid={displayGrid} config={config} />

      {/* ゲームオーバーメッセージ */}
      {isGameOver && (
        <View style={styles.gameOverContainer}>
          <Text style={styles.gameOverText}>GAME OVER</Text>
          <Text style={styles.finalScoreText}>最終スコア: {score}</Text>
          <TouchableOpacity style={styles.restartButton} onPress={restart}>
            <Text style={styles.restartButtonText}>リスタート</Text>
          </TouchableOpacity>
        </View>
      )}

      <GameControls onMoveLeft={moveLeft} onMoveRight={moveRight} onRotate={rotate} onDrop={drop} />
    </View>
  )
}

const styles = StyleSheet.create({
  chainText: {
    color: COLORS.chainOrange,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    flex: 1,
    justifyContent: 'center',
  },
  finalScoreText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  gameOverContainer: {
    alignItems: 'center',
    backgroundColor: `${COLORS.black}cc`, // rgba(0, 0, 0, 0.8)
    borderRadius: 10,
    left: 0,
    padding: 30,
    position: 'absolute',
    right: 0,
    top: '40%',
    zIndex: 1000,
  },
  gameOverText: {
    color: COLORS.gameOverRed,
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: COLORS.buttonBlue,
    borderRadius: 8,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  restartButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
})
