import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PuyoColor, getPuyoColorStyle } from '../models/PuyoColor'

const COLORS = {
  border: '#333',
}

interface PuyoProps {
  color: PuyoColor
  size: number
}

export const Puyo: React.FC<PuyoProps> = ({ color, size }) => {
  const colorStyle = getPuyoColorStyle(color)

  return (
    <View
      style={[
        styles.puyo,
        {
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        colorStyle,
      ]}
      testID="puyo"
    />
  )
}

const styles = StyleSheet.create({
  puyo: {
    borderColor: COLORS.border,
    borderWidth: 1,
  },
})
