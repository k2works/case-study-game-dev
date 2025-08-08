import { vi } from 'vitest'
import { SoundEffect, SoundType } from './SoundEffect'

// HTMLAudioElementのモック
const mockPlay = vi.fn()
const mockPause = vi.fn()
const mockLoad = vi.fn()

const createMockAudioElement = () =>
  ({
    play: mockPlay,
    pause: mockPause,
    load: mockLoad,
    volume: 1,
    currentTime: 0,
    src: '',
    loop: false,
    paused: true,
    ended: false,
  }) as unknown as HTMLAudioElement

// モックオーディオファクトリーの作成
class MockAudioFactory {
  create(): HTMLAudioElement {
    return createMockAudioElement()
  }
}

const mockAudioFactory = new MockAudioFactory()

describe('SoundEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPlay.mockResolvedValue(undefined)
  })

  describe('効果音の再生', () => {
    it('ぷよ移動音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.PUYO_MOVE)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('ぷよ回転音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.PUYO_ROTATE)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('ぷよ設置音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.PUYO_DROP)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('消去音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.PUYO_ERASE)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('連鎖音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.CHAIN)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('ゲームオーバー音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.GAME_OVER)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })
  })

  describe('音量制御', () => {
    it('音量を設定できる', () => {
      // Arrange
      const createSpy = vi.spyOn(mockAudioFactory, 'create')
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      soundEffect.setVolume(0.5)

      // Assert - モックされたAudioElementの音量が設定されているかチェック
      const audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.volume).toBe(0.5)
      })
    })

    it('音量は0から1の範囲内に制限される', () => {
      // Arrange
      const createSpy = vi.spyOn(mockAudioFactory, 'create')
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act & Assert
      soundEffect.setVolume(-0.1)
      let audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.volume).toBe(0)
      })

      soundEffect.setVolume(1.5)
      audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.volume).toBe(1)
      })
    })
  })

  describe('ミュート機能', () => {
    it('ミュートされた状態では音が再生されない', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)
      soundEffect.mute()

      // Act
      await soundEffect.play(SoundType.PUYO_MOVE)

      // Assert
      expect(mockPlay).not.toHaveBeenCalled()
    })

    it('ミュート解除後は音が再生される', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)
      soundEffect.mute()
      soundEffect.unmute()

      // Act
      await soundEffect.play(SoundType.PUYO_MOVE)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('ミュート状態を確認できる', () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act & Assert
      expect(soundEffect.isMuted()).toBe(false)

      soundEffect.mute()
      expect(soundEffect.isMuted()).toBe(true)

      soundEffect.unmute()
      expect(soundEffect.isMuted()).toBe(false)
    })
  })

  describe('エラーハンドリング', () => {
    it('再生エラーが発生してもクラッシュしない', async () => {
      // Arrange
      mockPlay.mockRejectedValueOnce(new Error('Audio failed'))
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act & Assert - エラーが投げられないことを確認
      await expect(
        soundEffect.play(SoundType.PUYO_MOVE)
      ).resolves.toBeUndefined()
    })
  })

  describe('同じ音の重複再生', () => {
    it('同じ音を短時間で連続再生できる', async () => {
      // Arrange
      const soundEffect = new SoundEffect(mockAudioFactory)

      // Act
      await soundEffect.play(SoundType.PUYO_MOVE)
      await soundEffect.play(SoundType.PUYO_MOVE)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(2)
    })
  })
})
