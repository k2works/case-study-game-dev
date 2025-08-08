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
  console.log('ChainDisplay render:', { chainCount, x, y })

  if (chainCount === 0) {
    console.log('ChainDisplay: chainCount is 0, returning null')
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
    style.zIndex = 1000 // z-indexを確実に設定
  }

  const className = getChainClass()
  console.log('ChainDisplay レンダリング:', { chainCount, className, style })

  return (
    <div
      data-testid="chain-display"
      className={className}
      style={style}
      key={`chain-${chainCount}-${Date.now()}`} // 強制的に再レンダリングを防ぐ
    >
      <span className="chain-text">{chainCount}連鎖!</span>
    </div>
  )
}
