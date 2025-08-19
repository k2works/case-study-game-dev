import { beforeEach, describe, expect, it } from 'vitest'

import * as ChainDetectionService from '../../domain/services/ChainDetectionService'
import { PuyoSpawningService } from '../../domain/services/PuyoSpawningService'
import { Container } from './Container'

// モックサービス
class MockStorageService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data = new Map<string, any>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async save(key: string, value: any): Promise<boolean> {
    this.data.set(key, value)
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async load(key: string): Promise<any> {
    return this.data.get(key) || null
  }
}

class MockTimerService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private timers = new Map<string, any>()

  startInterval(callback: () => void, interval: number): string {
    const id = Math.random().toString(36)
    this.timers.set(id, { callback, interval, type: 'interval' })
    return id
  }

  stopTimer(id: string): void {
    this.timers.delete(id)
  }
}

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = new Container()
  })

  describe('基本機能', () => {
    it('サービスを登録して解決できる', () => {
      const mockService = new MockStorageService()
      container.register('TestService', () => mockService)

      const resolved = container.resolve('TestService')
      expect(resolved).toBe(mockService)
    })

    it('ファクトリー関数を使用してサービスを生成する', () => {
      container.register('TimerService', () => new MockTimerService())

      const service1 = container.resolve('TimerService')
      const service2 = container.resolve('TimerService')

      // 非シングルトンなので毎回新しいインスタンス
      expect(service1).not.toBe(service2)
      expect(service1).toBeInstanceOf(MockTimerService)
      expect(service2).toBeInstanceOf(MockTimerService)
    })

    it('登録されていないサービスを解決しようとするとエラー', () => {
      expect(() => container.resolve('UnknownService')).toThrow(
        'Service not registered: UnknownService',
      )
    })
  })

  describe('シングルトン機能', () => {
    it('シングルトンとして登録したサービスは同じインスタンスを返す', () => {
      container.register(
        'SingletonService',
        () => new MockStorageService(),
        true,
      )

      const service1 = container.resolve('SingletonService')
      const service2 = container.resolve('SingletonService')

      expect(service1).toBe(service2)
      expect(service1).toBeInstanceOf(MockStorageService)
    })

    it('シングルトンでないサービスは毎回新しいインスタンスを返す', () => {
      container.register(
        'NonSingletonService',
        () => new MockStorageService(),
        false,
      )

      const service1 = container.resolve('NonSingletonService')
      const service2 = container.resolve('NonSingletonService')

      expect(service1).not.toBe(service2)
    })
  })

  describe('has', () => {
    it('登録されているサービスに対してtrueを返す', () => {
      container.register('TestService', () => new MockStorageService())

      expect(container.has('TestService')).toBe(true)
    })

    it('登録されていないサービスに対してfalseを返す', () => {
      expect(container.has('UnknownService')).toBe(false)
    })
  })

  describe('unregister', () => {
    it('サービスの登録を解除できる', () => {
      container.register('TestService', () => new MockStorageService(), true)
      container.resolve('TestService') // インスタンス化

      expect(container.has('TestService')).toBe(true)

      container.unregister('TestService')
      expect(container.has('TestService')).toBe(false)
    })

    it('シングルトンサービスのインスタンスも削除される', () => {
      container.register(
        'SingletonService',
        () => new MockStorageService(),
        true,
      )
      const instance1 = container.resolve('SingletonService')

      container.unregister('SingletonService')
      container.register(
        'SingletonService',
        () => new MockStorageService(),
        true,
      )
      const instance2 = container.resolve('SingletonService')

      expect(instance1).not.toBe(instance2)
    })
  })

  describe('clear', () => {
    it('すべてのサービスをクリアできる', () => {
      container.register('Service1', () => new MockStorageService())
      container.register('Service2', () => new MockTimerService(), true)

      container.clear()

      expect(container.has('Service1')).toBe(false)
      expect(container.has('Service2')).toBe(false)
    })
  })

  describe('ファクトリーメソッド', () => {
    beforeEach(() => {
      // 必要なサービスを登録
      container.register('StoragePort', () => new MockStorageService())
      container.register('TimerPort', () => new MockTimerService())
      container.register('ChainDetectionService', () => ChainDetectionService)
      container.register('PuyoSpawningService', () => new PuyoSpawningService())
    })

    it('getStorageAdapter はStoragePortを返す', () => {
      const adapter = container.getStorageAdapter()
      expect(adapter).toBeInstanceOf(MockStorageService)
    })

    it('getTimerAdapter はTimerPortを返す', () => {
      const adapter = container.getTimerAdapter()
      expect(adapter).toBeInstanceOf(MockTimerService)
    })

    it('getChainDetectionService は関数型ChainDetectionServiceを返す', () => {
      const service = container.getChainDetectionService()
      expect(typeof service).toBe('object')
      expect(typeof service.findErasableGroups).toBe('function')
      expect(typeof service.calculateChainScore).toBe('function')
    })

    it('getPuyoSpawningService はPuyoSpawningServiceを返す', () => {
      const service = container.getPuyoSpawningService()
      expect(service).toBeInstanceOf(PuyoSpawningService)
    })
  })

  describe('getDebugInfo', () => {
    it('コンテナの状態を正しく返す', () => {
      container.register('Service1', () => new MockStorageService())
      container.register('Service2', () => new MockTimerService(), true)
      container.resolve('Service2') // シングルトンをインスタンス化

      const debugInfo = container.getDebugInfo()

      expect(debugInfo.registeredServices).toContain('Service1')
      expect(debugInfo.registeredServices).toContain('Service2')
      expect(debugInfo.singletonServices).toContain('Service2')
      expect(debugInfo.instantiatedSingletons).toContain('Service2')
      expect(debugInfo.totalServices).toBe(2)
    })

    it('インスタンス化されていないシングルトンは含まれない', () => {
      container.register(
        'SingletonService',
        () => new MockStorageService(),
        true,
      )
      // インスタンス化しない

      const debugInfo = container.getDebugInfo()

      expect(debugInfo.singletonServices).toContain('SingletonService')
      expect(debugInfo.instantiatedSingletons).not.toContain('SingletonService')
    })
  })

  describe('configureForEnvironment', () => {
    beforeEach(() => {
      container.register('Service1', () => new MockStorageService(), true)
      container.register('Service2', () => new MockTimerService(), true)
      container.resolve('Service1') // インスタンス化
      container.resolve('Service2') // インスタンス化
    })

    it('test環境ではシングルトンをクリアする', () => {
      const debugInfo1 = container.getDebugInfo()
      expect(debugInfo1.singletonServices).toHaveLength(2)

      container.configureForEnvironment('test')

      const debugInfo2 = container.getDebugInfo()
      expect(debugInfo2.singletonServices).toHaveLength(0)

      // サービスは引き続き利用可能
      const service1 = container.resolve('Service1')
      const service2 = container.resolve('Service1')
      expect(service1).not.toBe(service2) // 非シングルトンになった
    })

    it('development環境の設定', () => {
      container.configureForEnvironment('development')
      // 開発環境固有の動作テスト（現在は何も実装されていない）
      expect(container.has('Service1')).toBe(true)
    })

    it('production環境の設定', () => {
      container.configureForEnvironment('production')
      // 本番環境固有の動作テスト（現在は何も実装されていない）
      expect(container.has('Service1')).toBe(true)
    })
  })

  describe('シングルトンインスタンス', () => {
    it('Container.getInstance() は同じインスタンスを返す', () => {
      const instance1 = Container.getInstance()
      const instance2 = Container.getInstance()

      expect(instance1).toBe(instance2)
      expect(instance1).toBeInstanceOf(Container)
    })

    it('通常のコンストラクタとは異なるインスタンス', () => {
      const normalInstance = new Container()
      const singletonInstance = Container.getInstance()

      expect(normalInstance).not.toBe(singletonInstance)
    })
  })

  describe('型安全性', () => {
    it('解決されたサービスの型が正しい', () => {
      container.register('StorageService', () => new MockStorageService())

      const service = container.resolve<MockStorageService>('StorageService')

      // TypeScriptの型チェックにより、適切なメソッドが呼び出せることを確認
      expect(typeof service.save).toBe('function')
      expect(typeof service.load).toBe('function')
    })
  })
})
