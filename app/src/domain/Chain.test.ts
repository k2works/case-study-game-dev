import { Chain, ChainResult } from './Chain'
import { Field } from './Field'
import { Puyo } from './Puyo'

describe('Chain', () => {
  let field: Field
  let chain: Chain

  beforeEach(() => {
    field = new Field(6, 16)
    chain = new Chain(field)
  })

  describe('単発消去（連鎖なし）', () => {
    test('4個の赤ぷよが横に並んでいる場合、1連鎖で消去される', () => {
      // Given: 横一列に4個の赤ぷよを配置
      field.setPuyo(1, 15, new Puyo('red'))
      field.setPuyo(2, 15, new Puyo('red'))
      field.setPuyo(3, 15, new Puyo('red'))
      field.setPuyo(4, 15, new Puyo('red'))

      // When: 連鎖処理を実行
      const result: ChainResult = chain.processChain()

      // Then: 1連鎖で4個のぷよが消去される
      expect(result.chainCount).toBe(1)
      expect(result.totalErasedCount).toBe(4)
      expect(result.score).toBe(40) // 基本スコア4個 × 10点

      // フィールドから消えていることを確認
      expect(field.getPuyo(1, 15)).toBeNull()
      expect(field.getPuyo(2, 15)).toBeNull()
      expect(field.getPuyo(3, 15)).toBeNull()
      expect(field.getPuyo(4, 15)).toBeNull()
    })

    test('連結していない同色ぷよは消去されない', () => {
      // Given: 離れた位置に赤ぷよを配置
      field.setPuyo(0, 15, new Puyo('red'))
      field.setPuyo(2, 15, new Puyo('red'))
      field.setPuyo(4, 15, new Puyo('red'))

      // When: 連鎖処理を実行
      const result: ChainResult = chain.processChain()

      // Then: 連鎖は発生しない
      expect(result.chainCount).toBe(0)
      expect(result.totalErasedCount).toBe(0)
      expect(result.score).toBe(0)
    })
  })

  describe('2連鎖パターン', () => {
    test('基本的な2連鎖パターン', () => {
      // Given: 2連鎖が発生する配置
      // 青ぷよを散らして配置、赤ぷよが消えると青ぷよが重力で落ちて4つ連結する

      // 青ぷよ（散らして配置）
      field.setPuyo(1, 15, new Puyo('blue')) // 底
      field.setPuyo(1, 13, new Puyo('blue')) // 上
      field.setPuyo(2, 15, new Puyo('blue')) // 底
      field.setPuyo(2, 12, new Puyo('blue')) // 上

      // 赤ぷよ（縦に4個、青の間に挟む）
      field.setPuyo(1, 14, new Puyo('red'))
      field.setPuyo(2, 14, new Puyo('red'))
      field.setPuyo(2, 13, new Puyo('red'))
      field.setPuyo(3, 14, new Puyo('red'))

      // When: 連鎖処理を実行
      const result: ChainResult = chain.processChain()

      // デバッグ情報を出力
      console.log('Chain result:', result)
      result.chainDetails.forEach((step, i) => {
        console.log(
          `Step ${i + 1}: score=${step.stepScore}, erased=${step.erasedPuyos.length}`
        )
      })

      // Then: 2連鎖が発生
      expect(result.chainCount).toBe(2)
      expect(result.totalErasedCount).toBe(8)
      // 1連鎖: 4個×10点 = 40点
      // 2連鎖: 4個×10点×8倍 = 320点
      // 合計: 360点
      expect(result.score).toBe(360)
    })
  })

  describe('連鎖数とボーナス計算', () => {
    test('連鎖ボーナスが正しく計算される', () => {
      const testCases = [
        { chain: 1, expectedMultiplier: 1 },
        { chain: 2, expectedMultiplier: 8 },
        { chain: 3, expectedMultiplier: 16 },
        { chain: 4, expectedMultiplier: 32 },
        { chain: 5, expectedMultiplier: 64 },
      ]

      testCases.forEach(({ chain: chainNum, expectedMultiplier }) => {
        const actualMultiplier = chain.getChainBonus(chainNum)
        expect(actualMultiplier).toBe(expectedMultiplier)
      })
    })
  })

  describe('色ボーナス計算', () => {
    test('単色消去のボーナス', () => {
      // デバッグ情報を追加
      console.log('getColorBonus(1):', chain.getColorBonus(1))
      console.log('getColorBonus(2):', chain.getColorBonus(2))

      expect(chain.getColorBonus(1)).toBe(0) // 1色
      expect(chain.getColorBonus(2)).toBe(3) // 2色
      expect(chain.getColorBonus(3)).toBe(6) // 3色
      expect(chain.getColorBonus(4)).toBe(12) // 4色
    })
  })

  describe('個数ボーナス計算', () => {
    test('消去個数のボーナス', () => {
      expect(chain.getCountBonus(4)).toBe(0) // 4個
      expect(chain.getCountBonus(5)).toBe(2) // 5個
      expect(chain.getCountBonus(6)).toBe(3) // 6個
      expect(chain.getCountBonus(7)).toBe(4) // 7個
      expect(chain.getCountBonus(11)).toBe(10) // 11個以上
    })
  })

  describe('エッジケース', () => {
    test('空のフィールドでは連鎖は発生しない', () => {
      // Given: 空のフィールド

      // When: 連鎖処理を実行
      const result: ChainResult = chain.processChain()

      // Then: 連鎖は発生しない
      expect(result.chainCount).toBe(0)
      expect(result.totalErasedCount).toBe(0)
      expect(result.score).toBe(0)
    })

    test('3個以下の同色連結では消去されない', () => {
      // Given: 3個の赤ぷよ
      field.setPuyo(1, 15, new Puyo('red'))
      field.setPuyo(2, 15, new Puyo('red'))
      field.setPuyo(3, 15, new Puyo('red'))

      // When: 連鎖処理を実行
      const result: ChainResult = chain.processChain()

      // Then: 連鎖は発生しない
      expect(result.chainCount).toBe(0)
      expect(result.totalErasedCount).toBe(0)
      expect(result.score).toBe(0)
    })
  })

  describe('重力処理', () => {
    test('浮いたぷよが重力により落下する', () => {
      // Given: 下段にベースぷよ、上段に浮いたぷよ
      field.setPuyo(2, 15, new Puyo('red'))
      field.setPuyo(2, 10, new Puyo('blue'))
      field.setPuyo(2, 8, new Puyo('green'))

      // When: 重力処理を実行
      chain.applyGravity()

      // Then: 浮いたぷよが落下している
      expect(field.getPuyo(2, 10)).toBeNull() // 元の位置は空
      expect(field.getPuyo(2, 8)).toBeNull() // 元の位置は空
      expect(field.getPuyo(2, 15)).not.toBeNull() // ベースはそのまま
      expect(field.getPuyo(2, 14)).not.toBeNull() // 青が落下
      expect(field.getPuyo(2, 13)).not.toBeNull() // 緑が落下

      expect(field.getPuyo(2, 14)!.color).toBe('blue')
      expect(field.getPuyo(2, 13)!.color).toBe('green')
    })

    test('複数列で同時に重力処理が正しく動作する', () => {
      // Given: 各列に浮いたぷよ
      field.setPuyo(1, 15, new Puyo('red')) // ベース
      field.setPuyo(1, 12, new Puyo('blue')) // 浮いたぷよ
      field.setPuyo(2, 15, new Puyo('green')) // ベース
      field.setPuyo(2, 10, new Puyo('yellow')) // 浮いたぷよ
      field.setPuyo(3, 15, new Puyo('red')) // ベース

      // When: 重力処理を実行
      chain.applyGravity()

      // Then: 各列で正しく落下
      // 列1: blue(12) -> (14)
      expect(field.getPuyo(1, 12)).toBeNull()
      expect(field.getPuyo(1, 14)!.color).toBe('blue')

      // 列2: yellow(10) -> (14)
      expect(field.getPuyo(2, 10)).toBeNull()
      expect(field.getPuyo(2, 14)!.color).toBe('yellow')

      // ベースは変わらず
      expect(field.getPuyo(1, 15)!.color).toBe('red')
      expect(field.getPuyo(2, 15)!.color).toBe('green')
      expect(field.getPuyo(3, 15)!.color).toBe('red')
    })

    test('空のフィールドに重力処理を適用しても問題ない', () => {
      // Given: 空のフィールド
      expect(field.isEmpty()).toBe(true)

      // When: 重力処理を実行
      chain.applyGravity()

      // Then: フィールドは空のまま
      expect(field.isEmpty()).toBe(true)
    })

    test('すべてのぷよが既に最下段にある場合は変化しない', () => {
      // Given: 最下段に配置されたぷよ
      field.setPuyo(1, 15, new Puyo('red'))
      field.setPuyo(2, 15, new Puyo('blue'))
      field.setPuyo(3, 15, new Puyo('green'))

      // When: 重力処理を実行
      chain.applyGravity()

      // Then: 位置は変わらない
      expect(field.getPuyo(1, 15)!.color).toBe('red')
      expect(field.getPuyo(2, 15)!.color).toBe('blue')
      expect(field.getPuyo(3, 15)!.color).toBe('green')
    })
  })
})
