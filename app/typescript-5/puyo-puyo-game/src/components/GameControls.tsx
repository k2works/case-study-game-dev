import React from 'react'
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native'

const COLORS = {
  buttonBackground: '#007AFF',
  buttonText: '#fff',
  border: '#333',
}

interface GameControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotate: () => void
  onDrop: () => void
}

export const GameControls: React.FC<GameControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onRotate,
  onDrop,
}) => {
  return (
    <View style={styles.container} testID="game-controls">
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={onMoveLeft} testID="button-left">
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onMoveRight} testID="button-right">
          <Text style={styles.buttonText}>→</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={onRotate} testID="button-rotate">
          <Text style={styles.buttonText}>↻</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onDrop} testID="button-drop">
          <Text style={styles.buttonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonBackground,
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    marginHorizontal: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  buttonText: {
    color: COLORS.buttonText,
    fontSize: 24,
    fontWeight: 'bold',
  },
  container: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
})
