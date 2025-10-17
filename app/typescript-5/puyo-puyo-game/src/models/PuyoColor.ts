export enum PuyoColor {
  EMPTY = 0,
  RED = 1,
  BLUE = 2,
  GREEN = 3,
  YELLOW = 4,
}

interface ColorStyle {
  backgroundColor: string
}

export const getPuyoColorStyle = (color: PuyoColor): ColorStyle => {
  switch (color) {
    case PuyoColor.RED:
      return { backgroundColor: '#ff4444' }
    case PuyoColor.BLUE:
      return { backgroundColor: '#4444ff' }
    case PuyoColor.GREEN:
      return { backgroundColor: '#44ff44' }
    case PuyoColor.YELLOW:
      return { backgroundColor: '#ffff44' }
    case PuyoColor.EMPTY:
    default:
      return { backgroundColor: 'transparent' }
  }
}
