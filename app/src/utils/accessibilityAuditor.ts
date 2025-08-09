import * as axe from 'axe-core'

export interface AccessibilityViolation {
  id: string
  impact: 'minor' | 'moderate' | 'serious' | 'critical'
  description: string
  help: string
  helpUrl: string
  nodes: Array<{
    html: string
    target: string[]
  }>
}

export interface AccessibilityReport {
  score: number
  violations: AccessibilityViolation[]
  passes: number
  incomplete: number
  inapplicable: number
  timestamp: Date
  url: string
}

/**
 * アクセシビリティ監査を実行するクラス
 */
export class AccessibilityAuditor {
  private static instance: AccessibilityAuditor

  private constructor() {}

  public static getInstance(): AccessibilityAuditor {
    if (!AccessibilityAuditor.instance) {
      AccessibilityAuditor.instance = new AccessibilityAuditor()
    }
    return AccessibilityAuditor.instance
  }

  /**
   * 現在のページのアクセシビリティ監査を実行
   */
  public async auditPage(
    context: Element | Document = document,
    options: any = {}
  ): Promise<AccessibilityReport> {
    const defaultOptions = {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
      ...options,
    }

    try {
      const result = await axe.run(context as any, defaultOptions as any)
      return this.processResult(result as any)
    } catch (error) {
      console.error('Accessibility audit failed:', error)
      throw new Error(`アクセシビリティ監査の実行に失敗しました: ${error}`)
    }
  }

  /**
   * axe-coreの結果を処理してレポート形式に変換
   */
  private processResult(result: any): AccessibilityReport {
    const violations: AccessibilityViolation[] = result.violations.map(
      (violation: any) => ({
        id: violation.id,
        impact: violation.impact as AccessibilityViolation['impact'],
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node: any) => ({
          html: node.html,
          target: node.target,
        })),
      })
    )

    const score = this.calculateScore(result)

    return {
      score,
      violations,
      passes: result.passes.length,
      incomplete: result.incomplete.length,
      inapplicable: result.inapplicable.length,
      timestamp: new Date(),
      url: window.location.href,
    }
  }

  /**
   * アクセシビリティスコアを計算（0-100）
   */
  private calculateScore(result: any): number {
    const totalChecks = result.passes.length + result.violations.length
    if (totalChecks === 0) return 100

    // 重要度に基づく重み付け
    const weightedViolations = result.violations.reduce(
      (sum: number, violation: any) => {
        const weight = this.getImpactWeight(violation.impact)
        return sum + weight * violation.nodes.length
      },
      0
    )

    const maxPossibleScore = totalChecks * this.getImpactWeight('critical')
    const score = Math.max(
      0,
      Math.round(
        ((maxPossibleScore - weightedViolations) / maxPossibleScore) * 100
      )
    )

    return score
  }

  /**
   * 影響度に基づく重み値を取得
   */
  private getImpactWeight(
    impact: 'minor' | 'moderate' | 'serious' | 'critical' | null | undefined
  ): number {
    switch (impact) {
      case 'critical':
        return 4
      case 'serious':
        return 3
      case 'moderate':
        return 2
      case 'minor':
        return 1
      default:
        return 1
    }
  }

  /**
   * テキストレポートを生成
   */
  public generateTextReport(report: AccessibilityReport): string {
    const {
      score,
      violations,
      passes,
      incomplete,
      inapplicable,
      timestamp,
      url,
    } = report

    const criticalViolations = violations.filter((v) => v.impact === 'critical')
    const seriousViolations = violations.filter((v) => v.impact === 'serious')
    const moderateViolations = violations.filter((v) => v.impact === 'moderate')
    const minorViolations = violations.filter((v) => v.impact === 'minor')

    return `
アクセシビリティ監査レポート
============================
URL: ${url}
実行日時: ${timestamp.toLocaleString('ja-JP')}
スコア: ${score}/100

概要:
-----
✅ 合格: ${passes}項目
❌ 違反: ${violations.length}項目
⚠️  未完了: ${incomplete}項目
➖ 対象外: ${inapplicable}項目

違反内訳:
---------
🔴 クリティカル: ${criticalViolations.length}件
🟠 深刻: ${seriousViolations.length}件  
🟡 中程度: ${moderateViolations.length}件
🔵 軽微: ${minorViolations.length}件

${violations.length > 0 ? this.formatViolations(violations) : '✨ 違反は見つかりませんでした！'}

推奨事項:
---------
${this.generateRecommendations(violations)}
    `.trim()
  }

  /**
   * 違反詳細をフォーマット
   */
  private formatViolations(violations: AccessibilityViolation[]): string {
    return violations
      .map(
        (violation, index) => `
${index + 1}. ${violation.help}
   影響度: ${this.getImpactIcon(violation.impact)} ${violation.impact}
   説明: ${violation.description}
   詳細: ${violation.helpUrl}
   該当要素: ${violation.nodes.length}個
`
      )
      .join('')
  }

  /**
   * 影響度アイコンを取得
   */
  private getImpactIcon(
    impact: 'minor' | 'moderate' | 'serious' | 'critical'
  ): string {
    switch (impact) {
      case 'critical':
        return '🔴'
      case 'serious':
        return '🟠'
      case 'moderate':
        return '🟡'
      case 'minor':
        return '🔵'
    }
  }

  /**
   * 推奨事項を生成
   */
  private generateRecommendations(
    violations: AccessibilityViolation[]
  ): string {
    if (violations.length === 0) {
      return 'アクセシビリティ要件を満たしています。'
    }

    const recommendations = [
      'クリティカルおよび深刻な違反を最優先で修正してください。',
      'ARIA属性の適切な使用を確認してください。',
      'キーボードナビゲーションの動作を検証してください。',
      'カラーコントラストが十分であることを確認してください。',
      'スクリーンリーダーでの読み上げテストを実施してください。',
    ]

    return recommendations.join('\n')
  }

  /**
   * ゲーム固有のアクセシビリティチェック
   */
  public async auditGameSpecific(): Promise<AccessibilityReport> {
    const gameSpecificOptions = {
      tags: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      rules: {
        // ゲーム関連で特に重要なルール
        'color-contrast': { enabled: true },
        keyboard: { enabled: true },
        'focus-order-semantics': { enabled: true },
        'aria-roles': { enabled: true },
        'aria-required-attr': { enabled: true },
      },
    }

    return this.auditPage(document, gameSpecificOptions)
  }
}

export const accessibilityAuditor = AccessibilityAuditor.getInstance()
