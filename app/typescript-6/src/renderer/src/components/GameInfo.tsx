import { PuyoType } from '../game/Puyo'

interface GameInfoProps {
  score: number
  chainCount: number
  nextPuyoPair: { mainType: PuyoType; subType: PuyoType } | null
}

/**
 * ゲーム情報を表示するコンポーネント
 */
export function GameInfo({ score, chainCount, nextPuyoPair }: GameInfoProps) {
  const puyoColors: Record<PuyoType, string> = {
    [PuyoType.Empty]: '#ccc',
    [PuyoType.Red]: '#ff4444',
    [PuyoType.Green]: '#44ff44',
    [PuyoType.Blue]: '#4444ff',
    [PuyoType.Yellow]: '#ffff44'
  }

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        minWidth: '200px'
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>スコア</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{score}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>連鎖数</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          {chainCount > 0 ? `${chainCount}連鎖` : '-'}
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>NEXT</h3>
        {nextPuyoPair ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: puyoColors[nextPuyoPair.subType],
                border: '2px solid #333'
              }}
            />
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: puyoColors[nextPuyoPair.mainType],
                border: '2px solid #333'
              }}
            />
          </div>
        ) : (
          <div>-</div>
        )}
      </div>
    </div>
  )
}
