import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Puyo } from './Puyo'
import { PuyoColor } from '../models/PuyoColor'
import { Config } from '../models/Config'

const COLORS = {
  background: '#f0f0f0',
  border: '#333',
}

interface StageProps {
  config: Config
  grid: PuyoColor[][]
}

export const Stage: React.FC<StageProps> = ({ grid, config }) => {
  // プレイ領域のみを表示（最下行 rows-1 は非表示）
  const playAreaBottom = config.stageRows - 2
  const visibleGrid = grid.slice(0, playAreaBottom + 1)

  return (
    <View
      style={[
        styles.stage,
        {
          height: config.stageHeight - config.puyoSize, // 最下行の分だけ高さを減らす
          width: config.stageWidth,
        },
      ]}
      testID="stage"
    >
      {visibleGrid.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((color, colIndex) => (
            <Puyo key={`${rowIndex}-${colIndex}`} color={color} size={config.puyoSize} />
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  stage: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.border,
    borderWidth: 2,
  },
})
