import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GameInfo } from '@/components/GameInfo'
import { PuyoType } from '@/game/Puyo'

describe('GameInfo', () => {
  it('スコアが表示される', () => {
    render(<GameInfo score={1000} chainCount={0} nextPuyoPair={null} />)

    expect(screen.getByText('スコア')).toBeInTheDocument()
    expect(screen.getByText('1000')).toBeInTheDocument()
  })

  it('連鎖数が0のときは「-」が表示される', () => {
    const { container } = render(<GameInfo score={0} chainCount={0} nextPuyoPair={null} />)

    expect(screen.getByText('連鎖数')).toBeInTheDocument()

    // 連鎖数セクションの div を直接確認
    const chainSection = container.querySelector('div[style*="margin-bottom: 16px"]:nth-child(2)')
    expect(chainSection?.textContent).toContain('-')
  })

  it('連鎖数が1以上のとき連鎖数が表示される', () => {
    render(<GameInfo score={0} chainCount={3} nextPuyoPair={null} />)

    expect(screen.getByText('連鎖数')).toBeInTheDocument()
    expect(screen.getByText('3連鎖')).toBeInTheDocument()
  })

  it('次のぷよペアが null のときは「-」が表示される', () => {
    render(<GameInfo score={0} chainCount={0} nextPuyoPair={null} />)

    expect(screen.getByText('NEXT')).toBeInTheDocument()

    // getAllByText を使用して複数の「-」を取得
    const dashes = screen.getAllByText('-')
    expect(dashes.length).toBeGreaterThanOrEqual(2) // 連鎖数とNEXTの両方に「-」がある
  })

  it('次のぷよペアが表示される（赤と青）', () => {
    const nextPuyoPair = { mainType: PuyoType.Red, subType: PuyoType.Blue }
    const { container } = render(
      <GameInfo score={0} chainCount={0} nextPuyoPair={nextPuyoPair} />
    )

    expect(screen.getByText('NEXT')).toBeInTheDocument()

    // ぷよの色が正しく表示されているか確認
    const puyos = container.querySelectorAll('[style*="border-radius: 50%"]')
    expect(puyos).toHaveLength(2)

    // subPuyo (青) が上に表示される
    expect(puyos[0]).toHaveStyle({ backgroundColor: '#4444ff' })
    // mainPuyo (赤) が下に表示される
    expect(puyos[1]).toHaveStyle({ backgroundColor: '#ff4444' })
  })

  it('次のぷよペアが表示される（緑と黄）', () => {
    const nextPuyoPair = { mainType: PuyoType.Green, subType: PuyoType.Yellow }
    const { container } = render(
      <GameInfo score={0} chainCount={0} nextPuyoPair={nextPuyoPair} />
    )

    const puyos = container.querySelectorAll('[style*="border-radius: 50%"]')
    expect(puyos).toHaveLength(2)

    // subPuyo (黄) が上に表示される
    expect(puyos[0]).toHaveStyle({ backgroundColor: '#ffff44' })
    // mainPuyo (緑) が下に表示される
    expect(puyos[1]).toHaveStyle({ backgroundColor: '#44ff44' })
  })

  it('複数の情報が同時に正しく表示される', () => {
    const nextPuyoPair = { mainType: PuyoType.Red, subType: PuyoType.Blue }
    render(<GameInfo score={5000} chainCount={7} nextPuyoPair={nextPuyoPair} />)

    expect(screen.getByText('5000')).toBeInTheDocument()
    expect(screen.getByText('7連鎖')).toBeInTheDocument()
    expect(screen.getByText('NEXT')).toBeInTheDocument()
  })

  it('game-info クラスが設定される', () => {
    const { container } = render(<GameInfo score={0} chainCount={0} nextPuyoPair={null} />)

    const gameInfo = container.querySelector('.game-info')
    expect(gameInfo).toBeInTheDocument()
  })

  it('各セクションに適切な見出しが表示される', () => {
    render(<GameInfo score={0} chainCount={0} nextPuyoPair={null} />)

    expect(screen.getByText('スコア')).toBeInTheDocument()
    expect(screen.getByText('連鎖数')).toBeInTheDocument()
    expect(screen.getByText('NEXT')).toBeInTheDocument()
  })
})
