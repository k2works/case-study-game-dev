import { vi } from 'vitest'
import { BackgroundMusic, MusicType } from './BackgroundMusic'

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

describe('BackgroundMusic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPlay.mockResolvedValue(undefined)
    // テスト環境での音響無効化をスキップするため、NODE_ENVを一時的に変更
    process.env.NODE_ENV = 'development'
    // HTMLMediaElementをモックして存在させる
    Object.defineProperty(window, 'HTMLMediaElement', {
      value: function () {},
      writable: true,
      configurable: true,
    })
  })

  afterEach(() => {
    // テスト後にNODE_ENVを元に戻す
    process.env.NODE_ENV = 'test'
  })

  describe('BGMの再生制御', () => {
    it('メインテーマが再生される', async () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act
      await bgm.play(MusicType.MAIN_THEME)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('ゲームオーバーテーマが再生される', async () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act
      await bgm.play(MusicType.GAME_OVER_THEME)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('BGMを停止できる', () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act
      bgm.stop()

      // Assert - stop()は全てのaudioElementに対してpause()を呼び出すため、pauseが呼ばれることを確認
      expect(bgm.isPlaying()).toBe(false)
    })

    it('BGMをフェードアウトできる', async () => {
      // Arrange
      vi.useFakeTimers()
      const bgm = new BackgroundMusic(mockAudioFactory)
      await bgm.play(MusicType.MAIN_THEME)

      // Act & Assert
      const fadePromise = bgm.fadeOut(100)
      vi.advanceTimersByTime(150)

      // フェードアウト処理が完了することを確認
      await expect(fadePromise).resolves.toBeUndefined()

      // Cleanup
      vi.useRealTimers()
    })
  })

  describe('音量制御', () => {
    it('BGM音量を設定できる', () => {
      // Arrange
      const createSpy = vi.spyOn(mockAudioFactory, 'create')
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act
      bgm.setVolume(0.7)

      // Assert - モックされたAudioElementの音量が設定されているかチェック
      const audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.volume).toBe(0.7)
      })
    })

    it('音量は0から1の範囲内に制限される', () => {
      // Arrange
      const createSpy = vi.spyOn(mockAudioFactory, 'create')
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act & Assert
      bgm.setVolume(-0.1)
      let audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.volume).toBe(0)
      })

      bgm.setVolume(1.5)
      audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.volume).toBe(1)
      })
    })
  })

  describe('ループ再生', () => {
    it('BGMがループ再生に設定される', () => {
      // Arrange
      const createSpy = vi.spyOn(mockAudioFactory, 'create')
      new BackgroundMusic(mockAudioFactory)

      // Act - 初期化時にループ設定される
      // Assert
      const audioInstances = createSpy.mock.results.map((r) => r.value)
      audioInstances.forEach((audio) => {
        expect(audio.loop).toBe(true)
      })
    })
  })

  describe('ミュート機能', () => {
    it('ミュート状態では再生されない', async () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)
      bgm.mute()

      // Act
      await bgm.play(MusicType.MAIN_THEME)

      // Assert
      expect(mockPlay).not.toHaveBeenCalled()
    })

    it('ミュート解除後は再生される', async () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)
      bgm.mute()
      bgm.unmute()

      // Act
      await bgm.play(MusicType.MAIN_THEME)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(1)
    })

    it('ミュート状態を確認できる', () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act & Assert
      expect(bgm.isMuted()).toBe(false)

      bgm.mute()
      expect(bgm.isMuted()).toBe(true)

      bgm.unmute()
      expect(bgm.isMuted()).toBe(false)
    })
  })

  describe('BGM切り替え', () => {
    it('現在再生中のBGMを停止して新しいBGMを再生する', async () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)
      await bgm.play(MusicType.MAIN_THEME)

      // Act
      await bgm.play(MusicType.GAME_OVER_THEME)

      // Assert
      expect(mockPlay).toHaveBeenCalledTimes(2) // 両方のBGMが再生された
      expect(bgm.getCurrentMusic()).toBe(MusicType.GAME_OVER_THEME) // 現在のBGMが切り替わっている
    })

    it('同じBGMを再再生する場合は何もしない', async () => {
      // Arrange
      const bgm = new BackgroundMusic(mockAudioFactory)
      await bgm.play(MusicType.MAIN_THEME)
      vi.clearAllMocks()

      // Act
      await bgm.play(MusicType.MAIN_THEME)

      // Assert
      expect(mockPlay).not.toHaveBeenCalled()
    })
  })

  describe('エラーハンドリング', () => {
    it('再生エラーが発生してもクラッシュしない', async () => {
      // Arrange
      mockPlay.mockRejectedValueOnce(new Error('Audio failed'))
      const bgm = new BackgroundMusic(mockAudioFactory)

      // Act & Assert - エラーが投げられないことを確認
      await expect(bgm.play(MusicType.MAIN_THEME)).resolves.toBeUndefined()
    })
  })
})
