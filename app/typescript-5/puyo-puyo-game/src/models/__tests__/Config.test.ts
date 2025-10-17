import { Config } from '../Config'

describe('Config', () => {
  let config: Config

  beforeEach(() => {
    config = new Config()
  })

  describe('ゲームの基本設定', () => {
    it('ステージの列数が6であること', () => {
      expect(config.stageColumns).toBe(6)
    })

    it('ステージの行数が13であること', () => {
      expect(config.stageRows).toBe(13)
    })

    it('ぷよのサイズが40であること', () => {
      expect(config.puyoSize).toBe(40)
    })

    it('ステージの幅が列数×ぷよサイズであること', () => {
      expect(config.stageWidth).toBe(config.stageColumns * config.puyoSize)
    })

    it('ステージの高さが行数×ぷよサイズであること', () => {
      expect(config.stageHeight).toBe(config.stageRows * config.puyoSize)
    })
  })
})
