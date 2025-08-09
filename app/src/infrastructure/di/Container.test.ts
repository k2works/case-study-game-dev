import { describe, it, expect, beforeEach } from 'vitest'
import { Container } from './Container'

describe('Container', () => {
  let container: Container

  beforeEach(() => {
    container = new Container()
  })

  describe('基本的なサービス登録と解決', () => {
    it('サービスを登録して解決できる', () => {
      // Arrange
      const service = { name: 'test' }

      // Act
      container.register('testService', service)
      const resolved = container.resolve('testService')

      // Assert
      expect(resolved).toBe(service)
    })

    it('Symbolをトークンとしてサービスを登録できる', () => {
      // Arrange
      const token = Symbol('testService')
      const service = { value: 42 }

      // Act
      container.register(token, service)
      const resolved = container.resolve(token)

      // Assert
      expect(resolved).toBe(service)
    })

    it('存在しないサービスを解決しようとするとエラーを投げる', () => {
      // Arrange
      // Act & Assert
      expect(() => container.resolve('nonExistent')).toThrow(
        'Service not found: nonExistent'
      )
    })
  })

  describe('シングルトンサービス', () => {
    it('シングルトンサービスを登録して解決できる', () => {
      // Arrange
      const singleton = { count: 0 }

      // Act
      container.registerSingleton('singleton', singleton)
      const resolved1 = container.resolve('singleton')
      const resolved2 = container.resolve('singleton')

      // Assert
      expect(resolved1).toBe(singleton)
      expect(resolved2).toBe(singleton)
      expect(resolved1).toBe(resolved2)
    })
  })

  describe('ファクトリサービス', () => {
    it('ファクトリからサービスを生成できる', () => {
      // Arrange
      let counter = 0
      const factory = () => ({ id: ++counter })

      // Act
      container.registerFactory('factory', factory)
      const instance1 = container.resolve<{ id: number }>('factory')
      const instance2 = container.resolve<{ id: number }>('factory')

      // Assert
      expect(instance1.id).toBe(1)
      expect(instance2.id).toBe(2)
      expect(instance1).not.toBe(instance2)
    })

    it('ファクトリが毎回新しいインスタンスを作成する', () => {
      // Arrange
      const factory = () => ({ timestamp: Date.now() })

      // Act
      container.registerFactory('timestamp', factory)
      const instance1 = container.resolve('timestamp')
      // 少し待つ
      const instance2 = container.resolve('timestamp')

      // Assert
      expect(instance1).not.toBe(instance2)
    })
  })

  describe('優先順位とサービス検索', () => {
    it('シングルトンが通常のサービスより優先される', () => {
      // Arrange
      const normalService = { type: 'normal' }
      const singletonService = { type: 'singleton' }

      // Act
      container.register('service', normalService)
      container.registerSingleton('service', singletonService)
      const resolved = container.resolve('service')

      // Assert
      expect(resolved).toBe(singletonService)
    })

    it('ファクトリがシングルトンより優先される', () => {
      // Arrange
      const singletonService = { type: 'singleton' }
      const factory = () => ({ type: 'factory' })

      // Act
      container.registerSingleton('service', singletonService)
      container.registerFactory('service', factory)
      const resolved = container.resolve<{ type: string }>('service')

      // Assert
      expect(resolved.type).toBe('singleton') // シングルトンが最高優先度
    })
  })

  describe('ユーティリティメソッド', () => {
    it('hasメソッドでサービスの存在確認ができる', () => {
      // Arrange
      const service = { name: 'test' }

      // Act & Assert
      expect(container.has('test')).toBe(false)

      container.register('test', service)
      expect(container.has('test')).toBe(true)
    })

    it('clearメソッドですべてのサービスをクリアできる', () => {
      // Arrange
      container.register('service1', { name: 'service1' })
      container.registerSingleton('service2', { name: 'service2' })
      container.registerFactory('service3', () => ({ name: 'service3' }))

      // Act
      container.clear()

      // Assert
      expect(container.has('service1')).toBe(false)
      expect(container.has('service2')).toBe(false)
      expect(container.has('service3')).toBe(false)
    })
  })

  describe('複雑なシナリオ', () => {
    it('複数の異なるタイプのサービスを同時に管理できる', () => {
      // Arrange
      const normalService = { type: 'normal', id: 1 }
      const singletonService = { type: 'singleton', id: 2 }
      let factoryCounter = 0
      const factory = () => ({ type: 'factory', id: ++factoryCounter })

      // Act
      container.register('normal', normalService)
      container.registerSingleton('singleton', singletonService)
      container.registerFactory('factory', factory)

      // Assert
      expect(container.resolve('normal')).toBe(normalService)
      expect(container.resolve('singleton')).toBe(singletonService)

      const factory1 = container.resolve<{ type: string; id: number }>(
        'factory'
      )
      const factory2 = container.resolve<{ type: string; id: number }>(
        'factory'
      )
      expect(factory1.id).toBe(1)
      expect(factory2.id).toBe(2)
      expect(factory1).not.toBe(factory2)
    })
  })
})
