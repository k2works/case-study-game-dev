/**
 * インフラストラクチャ層のDIセットアップ
 * Clean Architectureに準拠し、具象クラスへの直接依存を避ける
 *
 * @deprecated アプリケーション層のDIConfigurationを使用してください
 */

// 後方互換性のため、アプリケーション層の設定を呼び出す
export function setupContainer(): void {
  // この関数は非推奨です
  // 代わりにアプリケーション層のDIConfiguration.setupContainer()を使用してください
  console.warn(
    'setupContainer() is deprecated. Use DIConfiguration.setupContainer() instead.'
  )
}

export function initializeApplication(): void {
  // この関数は非推奨です
  // 代わりにアプリケーション層のDIConfiguration.initializeApplication()を使用してください
  console.warn(
    'initializeApplication() is deprecated. Use DIConfiguration.initializeApplication() instead.'
  )
}
