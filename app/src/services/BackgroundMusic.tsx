export enum MusicType {
  MAIN_THEME = 'main',
  GAME_OVER_THEME = 'gameover',
}

// HTMLAudioElement作成用のファクトリーインターフェース
interface AudioFactory {
  create(): HTMLAudioElement
}

// 標準のHTMLAudioElementファクトリー
class StandardAudioFactory implements AudioFactory {
  create(): HTMLAudioElement {
    return new HTMLAudioElement()
  }
}

export class BackgroundMusic {
  private audioElements: Map<MusicType, HTMLAudioElement> = new Map()
  private currentMusic: MusicType | null = null
  private volume: number = 0.5 // BGMは効果音より控えめに
  private muted: boolean = false
  private audioFactory: AudioFactory

  constructor(audioFactory?: AudioFactory) {
    this.audioFactory = audioFactory || new StandardAudioFactory()
    this.initializeMusic()
  }

  private initializeMusic(): void {
    // 各BGMタイプに対してAudioElementを準備
    for (const musicType of Object.values(MusicType)) {
      const audio = this.audioFactory.create()
      // 実際の音楽ファイルは存在しないため、データURLで無音を設定
      audio.src = this.generateSilentAudio()
      audio.volume = this.volume
      audio.loop = true // BGMはループ再生
      this.audioElements.set(musicType, audio)
    }
  }

  private generateSilentAudio(): string {
    // 5秒の無音のWAVファイルのデータURL（BGM用）
    const silentWav =
      'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAAAAAAAAAAAAAA='
    return silentWav
  }

  async play(musicType: MusicType): Promise<void> {
    if (this.muted) return

    // 既に同じ音楽が再生中の場合は何もしない
    if (this.currentMusic === musicType) {
      return
    }

    try {
      // 現在再生中のBGMを停止
      this.stop()

      const audio = this.audioElements.get(musicType)
      if (!audio) return

      // 音楽を開始位置に戻す
      audio.currentTime = 0
      audio.volume = this.volume

      await audio.play()
      this.currentMusic = musicType
    } catch (error) {
      // エラーを静的に処理
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to play music ${musicType}:`, error)
      }
    }
  }

  stop(): void {
    // すべてのBGMを停止
    for (const audio of this.audioElements.values()) {
      if (!audio.paused) {
        audio.pause()
      }
    }
    this.currentMusic = null
  }

  async fadeOut(duration: number = 1000): Promise<void> {
    if (!this.currentMusic) return

    const audio = this.audioElements.get(this.currentMusic)
    if (!audio || audio.paused) return

    const startVolume = audio.volume
    const fadeInterval = 50 // ms
    const volumeStep = startVolume / (duration / fadeInterval)

    return new Promise((resolve) => {
      const fadeTimer = setInterval(() => {
        if (audio.volume > volumeStep) {
          audio.volume = Math.max(0, audio.volume - volumeStep)
        } else {
          audio.volume = 0
          audio.pause()
          // 元の音量に戻す
          audio.volume = this.volume
          this.currentMusic = null
          clearInterval(fadeTimer)
          resolve()
        }
      }, fadeInterval)
    })
  }

  setVolume(volume: number): void {
    // 音量を0-1の範囲に制限
    this.volume = Math.max(0, Math.min(1, volume))

    // 全てのAudioElementに音量を適用
    for (const audio of this.audioElements.values()) {
      audio.volume = this.volume
    }
  }

  mute(): void {
    this.muted = true
    this.stop()
  }

  unmute(): void {
    this.muted = false
  }

  isMuted(): boolean {
    return this.muted
  }

  getCurrentMusic(): MusicType | null {
    return this.currentMusic
  }

  isPlaying(): boolean {
    if (!this.currentMusic) return false

    const audio = this.audioElements.get(this.currentMusic)
    return audio ? !audio.paused : false
  }
}

// シングルトンパターンでグローバルに使用可能（遅延初期化）
let backgroundMusicInstance: BackgroundMusic | null = null

export const backgroundMusic = {
  getInstance(): BackgroundMusic {
    if (!backgroundMusicInstance) {
      backgroundMusicInstance = new BackgroundMusic()
    }
    return backgroundMusicInstance
  },

  play(musicType: MusicType) {
    return this.getInstance().play(musicType)
  },

  stop() {
    this.getInstance().stop()
  },

  fadeOut(duration?: number) {
    return this.getInstance().fadeOut(duration)
  },

  setVolume(volume: number) {
    this.getInstance().setVolume(volume)
  },

  mute() {
    this.getInstance().mute()
  },

  unmute() {
    this.getInstance().unmute()
  },

  isMuted(): boolean {
    return this.getInstance().isMuted()
  },

  getCurrentMusic(): MusicType | null {
    return this.getInstance().getCurrentMusic()
  },

  isPlaying(): boolean {
    return this.getInstance().isPlaying()
  },
}
