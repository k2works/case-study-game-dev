import React from 'react'
import './ChainDisplay.css'

interface ChainDisplayProps {
  chainCount: number
  x?: number
  y?: number
}

export const ChainDisplay: React.FC<ChainDisplayProps> = ({
  chainCount,
  x,
  y,
}) => {
  if (chainCount === 0) {
    return null
  }

  const getChainClass = () => {
    let classes = 'chain-display'

    if (x === undefined || y === undefined) {
      classes += ' center-position'
    }

    // アニメーションクラスを一度だけ適用
    classes += ' chain-animation'

    if (chainCount >= 10) {
      classes += ' super-chain'
    } else if (chainCount >= 7) {
      classes += ' large-chain'
    }

    return classes
  }

  const style: React.CSSProperties = {}
  if (x !== undefined && y !== undefined) {
    const cellSize = 32
    style.left = `${x * cellSize}px`
    style.top = `${y * cellSize}px`
    style.position = 'absolute'
  }

  return (
    <div
      data-testid="chain-display"
      className={getChainClass()}
      style={style}
      key={`chain-${chainCount}-${Date.now()}`} // 強制的に再レンダリングを防ぐ
    >
      <span className="chain-text">{chainCount}連鎖!</span>
    </div>
  )
}
