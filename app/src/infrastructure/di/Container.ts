import type { ServiceMap } from './types'

/**
 * 依存性注入コンテナ
 * サービスの登録と解決を管理
 */
export class Container {
  private services: Map<string | symbol, unknown> = new Map()
  private factories: Map<string | symbol, () => unknown> = new Map()
  private singletons: Map<string | symbol, unknown> = new Map()

  /**
   * サービスを登録（シングルトン）
   */
  registerSingleton<T>(token: string | symbol, instance: T): void {
    this.singletons.set(token, instance)
  }

  /**
   * ファクトリを登録（毎回新しいインスタンスを生成）
   */
  registerFactory<T>(token: string | symbol, factory: () => T): void {
    this.factories.set(token, factory)
  }

  /**
   * サービスを登録（通常のインスタンス）
   */
  register<T>(token: string | symbol, instance: T): void {
    this.services.set(token, instance)
  }

  /**
   * サービスを解決（型安全）
   */
  resolve<K extends keyof ServiceMap>(token: K): ServiceMap[K]
  resolve<T>(token: string | symbol): T
  resolve<T>(token: string | symbol): T {
    // シングルトンをチェック
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T
    }

    // ファクトリをチェック
    if (this.factories.has(token)) {
      const factory = this.factories.get(token)
      if (factory) {
        return factory() as T
      }
    }

    // 通常のサービスをチェック
    if (this.services.has(token)) {
      return this.services.get(token) as T
    }

    throw new Error(`Service not found: ${String(token)}`)
  }

  /**
   * サービスが登録されているか確認
   */
  has(token: string | symbol): boolean {
    return (
      this.singletons.has(token) ||
      this.factories.has(token) ||
      this.services.has(token)
    )
  }

  /**
   * すべてのサービスをクリア
   */
  clear(): void {
    this.services.clear()
    this.factories.clear()
    this.singletons.clear()
  }
}

// デフォルトのコンテナインスタンス
export const container = new Container()
