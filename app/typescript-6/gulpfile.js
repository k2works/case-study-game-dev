import { watch, series } from 'gulp'
import shell from 'gulp-shell'

// テストタスク
export const test = shell.task(['npm run test'])

// テストカバレッジタスク
export const coverage = shell.task(['npm run test:coverage'])

// 静的コード解析タスク
export const lint = shell.task(['npm run lint'])

// 自動修正付き静的コード解析タスク
export const lintFix = shell.task(['npm run lint:fix'])

// フォーマットタスク
export const format = shell.task(['npm run format'])

// フォーマットチェックタスク
export const formatCheck = shell.task(['npm run format:check'])

// ビルドタスク
export const build = shell.task(['npm run build'])

// 開発サーバータスク
export const dev = shell.task(['npm run dev'])

// 依存関係チェックタスク
export const depcruise = shell.task(['npm run depcruise'])

// 全体チェックタスク（自動修正付き）
export const checkAndFix = series(lintFix, format, depcruise, test)

// ファイル監視タスク（Guard）
export function guard() {
  console.log('🔍 Guard is watching for file changes...')
  console.log('Files will be automatically linted, formatted, and tested on change.')
  watch('src/renderer/src/**/*.{ts,tsx}', series(lintFix, format, test))
  watch('**/*.test.{ts,tsx}', series(test))
}

// ファイル監視タスク
export function watchFiles() {
  watch('src/renderer/src/**/*.{ts,tsx}', series(formatCheck, lint, test))
  watch('**/*.test.{ts,tsx}', series(test))
}

// デフォルトタスク
export default series(checkAndFix, guard)

// ウォッチタスクのエイリアス
export { watchFiles as watch }
