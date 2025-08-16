import type { PuyoColorViewModel } from '../../application/viewmodels/GameViewModel'

interface PuyoDisplayProps {
  color: PuyoColorViewModel
  size?: 'small' | 'medium' | 'large'
  className?: string
  'data-testid'?: string
}

const getPuyoColorClass = (color: PuyoColorViewModel): string => {
  if (color === null) {
    return 'bg-gray-500 border-gray-600'
  }

  const colorClasses: Record<Exclude<PuyoColorViewModel, null>, string> = {
    red: 'bg-red-500 border-red-600',
    blue: 'bg-blue-500 border-blue-600',
    green: 'bg-green-500 border-green-600',
    yellow: 'bg-yellow-500 border-yellow-600',
    purple: 'bg-purple-500 border-purple-600',
  }
  return colorClasses[color]
}

const getSizeClass = (size: 'small' | 'medium' | 'large'): string => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  }
  return sizeClasses[size]
}

export const PuyoDisplay = ({
  color,
  size = 'medium',
  className = '',
  'data-testid': testId,
}: PuyoDisplayProps) => {
  return (
    <div
      className={`
        ${getSizeClass(size)} 
        ${getPuyoColorClass(color)} 
        rounded-full border-2 shadow-inner
        ${className}
      `}
      data-testid={testId || `puyo-display-${color || 'null'}`}
    />
  )
}
