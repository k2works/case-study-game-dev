export enum SoundType {
  PUYO_MOVE = 'move',
  PUYO_ROTATE = 'rotate',
  PUYO_DROP = 'drop',
  PUYO_ERASE = 'erase',
  CHAIN = 'chain',
  GAME_OVER = 'gameover',
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

export class SoundEffect {
  private audioElements: Map<SoundType, HTMLAudioElement[]> = new Map()
  private volume: number = 1
  private muted: boolean = false
  private maxInstances: number = 3 // 同じ音の最大同時再生数
  private audioFactory: AudioFactory

  constructor(audioFactory?: AudioFactory) {
    this.audioFactory = audioFactory || new StandardAudioFactory()
    this.initializeSounds()
  }

  private initializeSounds(): void {
    // 各音声タイプに対して複数のAudioElementを準備
    for (const soundType of Object.values(SoundType)) {
      const audioArray: HTMLAudioElement[] = []

      for (let i = 0; i < this.maxInstances; i++) {
        const audio = this.audioFactory.create()
        // 実際の音声ファイルは存在しないため、データURLで無音を設定
        audio.src = this.generateSilentAudio()
        audio.volume = this.volume
        audioArray.push(audio)
      }

      this.audioElements.set(soundType, audioArray)
    }
  }

  private generateSilentAudio(): string {
    // 100ms の無音の WAV ファイルのデータURL
    const silentWav =
      'data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAAAAAAAAAAAAAA='
    return silentWav
  }

  private getAvailableAudio(soundType: SoundType): HTMLAudioElement | null {
    const audioArray = this.audioElements.get(soundType)
    if (!audioArray) return null

    // 再生中でないAudioElementを探す
    for (const audio of audioArray) {
      if (audio.paused || audio.ended) {
        return audio
      }
    }

    // 全て再生中の場合は最初のものを返す（上書き）
    return audioArray[0]
  }

  async play(soundType: SoundType): Promise<void> {
    if (this.muted) return

    try {
      const audio = this.getAvailableAudio(soundType)
      if (!audio) return

      // 現在の再生をリセット
      audio.currentTime = 0
      audio.volume = this.volume

      await audio.play()
    } catch (error) {
      // エラーを静的に処理（開発時にはconsole.logで確認可能）
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to play sound ${soundType}:`, error)
      }
    }
  }

  setVolume(volume: number): void {
    // 音量を0-1の範囲に制限
    this.volume = Math.max(0, Math.min(1, volume))

    // 全てのAudioElementに音量を適用
    for (const audioArray of this.audioElements.values()) {
      for (const audio of audioArray) {
        audio.volume = this.volume
      }
    }
  }

  mute(): void {
    this.muted = true
  }

  unmute(): void {
    this.muted = false
  }

  isMuted(): boolean {
    return this.muted
  }
}

// シングルトンパターンでグローバルに使用可能（遅延初期化）
let soundEffectInstance: SoundEffect | null = null

export const soundEffect = {
  getInstance(): SoundEffect {
    if (!soundEffectInstance) {
      soundEffectInstance = new SoundEffect()
    }
    return soundEffectInstance
  },

  play(soundType: SoundType) {
    return this.getInstance().play(soundType)
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
}
