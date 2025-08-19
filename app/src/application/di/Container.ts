import * as ChainDetectionService from '../../domain/services/ChainDetectionService'
import { PuyoSpawningService } from '../../domain/services/PuyoSpawningService'
import type { GamePort } from '../ports/GamePort'
import type { InputPort } from '../ports/InputPort'
import type { StoragePort } from '../ports/StoragePort'
import type { TimerPort } from '../ports/TimerPort'

/**
 * 依存性注入コンテナ
 * アプリケーション全体の依存関係を管理し、オブジェクトの生成と注入を担当
 */
export class Container {
  private static instance: Container
  private services = new Map<string, unknown>()
  private singletons = new Set<string>()

  constructor() {
    // 外部からの設定に依存するため、デフォルト設定は削除
  }

  /**
   * シングルトンインスタンスを取得
   * @returns Container インスタンス
   */
  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container()
    }
    return Container.instance
  }

  /**
   * サービスを登録
   * @param key サービスキー
   * @param factory サービスファクトリー関数
   * @param singleton シングルトンとして登録するか
   */
  register<T>(key: string, factory: () => T, singleton: boolean = false): void {
    this.services.set(key, factory)
    if (singleton) {
      this.singletons.add(key)
    }
  }

  /**
   * サービスを解決（取得）
   * @param key サービスキー
   * @returns 解決されたサービス
   */
  resolve<T>(key: string): T {
    const factory = this.services.get(key)
    if (!factory) {
      throw new Error(`Service not registered: ${key}`)
    }

    if (this.singletons.has(key)) {
      // シングルトンの場合、初回生成後は同じインスタンスを返す
      const existingInstance = this.services.get(`${key}_instance`)
      if (existingInstance) {
        return existingInstance as T
      }

      const instance = (factory as () => T)()
      this.services.set(`${key}_instance`, instance)
      return instance
    }

    return (factory as () => T)()
  }

  /**
   * サービスが登録されているかチェック
   * @param key サービスキー
   * @returns 登録されている場合true
   */
  has(key: string): boolean {
    return this.services.has(key)
  }

  /**
   * サービスの登録を解除
   * @param key サービスキー
   */
  unregister(key: string): void {
    this.services.delete(key)
    this.services.delete(`${key}_instance`)
    this.singletons.delete(key)
  }

  /**
   * すべてのサービスをクリア
   */
  clear(): void {
    this.services.clear()
    this.singletons.clear()
  }

  /**
   * ファクトリーメソッド群
   * 型安全にサービスを取得するためのヘルパー
   */

  getStorageAdapter(): StoragePort {
    return this.resolve<StoragePort>('StoragePort')
  }

  getTimerAdapter(): TimerPort {
    return this.resolve<TimerPort>('TimerPort')
  }

  getGameService(): GamePort {
    return this.resolve<GamePort>('GamePort')
  }

  getInputService(): InputPort {
    return this.resolve<InputPort>('InputPort')
  }

  getChainDetectionService(): typeof ChainDetectionService {
    return this.resolve<typeof ChainDetectionService>('ChainDetectionService')
  }

  getPuyoSpawningService(): PuyoSpawningService {
    return this.resolve<PuyoSpawningService>('PuyoSpawningService')
  }

  /**
   * コンテナの状態を取得（デバッグ用）
   * @returns 登録されているサービスの情報
   */
  getDebugInfo(): ContainerDebugInfo {
    const registeredServices = Array.from(this.services.keys()).filter(
      (key) => !key.endsWith('_instance'),
    )

    const singletonServices = Array.from(this.singletons)

    const instantiatedSingletons = Array.from(this.services.keys())
      .filter((key) => key.endsWith('_instance'))
      .map((key) => key.replace('_instance', ''))

    return {
      registeredServices,
      singletonServices,
      instantiatedSingletons,
      totalServices: registeredServices.length,
    }
  }

  /**
   * 環境に応じたサービス設定
   * @param environment 環境（'development' | 'production' | 'test'）
   */
  configureForEnvironment(
    environment: 'development' | 'production' | 'test',
  ): void {
    switch (environment) {
      case 'test':
        // テスト環境では全てのサービスを非シングルトンに
        this.singletons.clear()
        break

      case 'development':
        // 開発環境では追加のロギングサービスなど
        break

      case 'production':
        // 本番環境では最適化されたサービス設定
        break
    }
  }
}

/**
 * コンテナのデバッグ情報
 */
export interface ContainerDebugInfo {
  readonly registeredServices: string[]
  readonly singletonServices: string[]
  readonly instantiatedSingletons: string[]
  readonly totalServices: number
}

// グローバルcontainerは削除 - 外部設定に依存するため
