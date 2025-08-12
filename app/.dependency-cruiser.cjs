/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    // ==============================================================================
    // Clean Architecture: レイヤー間依存関係ルール
    // ==============================================================================

    {
      name: 'presentation-layer-boundaries',
      comment:
        'プレゼンテーション層は上位層（application、services）とutils、stylesのみ参照可能',
      severity: 'warn',
      from: { path: '^src/components' },
      to: {
        path: '^src/(?!application|services|utils|styles|hooks)',
        pathNot: '^src/(application|services|utils|styles|hooks|components)',
      },
    },

    {
      name: 'application-layer-boundaries',
      comment:
        'アプリケーション層はドメイン層、サービス層、インフラストラクチャ層のみ参照可能',
      severity: 'error',
      from: { path: '^src/application' },
      to: {
        path: '^src/(?!domain|services|infrastructure)',
        pathNot: '^src/(domain|services|infrastructure|application)',
      },
    },

    {
      name: 'service-layer-boundaries',
      comment:
        'サービス層はドメイン層、インフラストラクチャ層、utilsのみ参照可能',
      severity: 'error',
      from: { path: '^src/services' },
      to: {
        path: '^src/(?!domain|infrastructure|utils)',
        pathNot: '^src/(domain|infrastructure|utils|services)',
      },
    },

    {
      name: 'domain-independence',
      comment:
        'ドメイン層は外部ライブラリへの依存禁止（TypeScript型定義のみ許可）',
      severity: 'error',
      from: { path: '^src/domain' },
      to: {
        path: 'node_modules',
        pathNot: '^(typescript|@types)',
      },
    },

    {
      name: 'infrastructure-layer-boundaries',
      comment:
        'インフラストラクチャ層は自分自身とutilsのみ参照可能（外部依存は許可）',
      severity: 'warn',
      from: { path: '^src/infrastructure' },
      to: {
        path: '^src/(?!infrastructure|utils)',
        pathNot: '^src/(infrastructure|utils)',
      },
    },

    // ==============================================================================
    // 循環依存の禁止
    // ==============================================================================

    {
      name: 'no-circular-dependencies',
      comment: 'あらゆる循環依存を禁止',
      severity: 'error',
      from: {},
      to: { circular: true },
    },

    // ==============================================================================
    // 特定パターンの禁止
    // ==============================================================================

    {
      name: 'no-hooks-to-components',
      comment: 'hooksからcomponentsへの依存禁止',
      severity: 'error',
      from: { path: '^src/hooks' },
      to: { path: '^src/components' },
    },

    {
      name: 'no-utils-to-layers',
      comment: 'utilsから他のアーキテクチャ層への依存禁止',
      severity: 'error',
      from: { path: '^src/utils' },
      to: {
        path: '^src/(components|application|services|domain|infrastructure)',
      },
    },

    // ==============================================================================
    // テストファイルのルール
    // ==============================================================================

    {
      name: 'no-test-in-production',
      comment: 'プロダクションコードからテストファイルへの依存禁止',
      severity: 'error',
      from: {
        path: '^src',
        pathNot: '\\.(test|spec)\\.(js|ts|tsx)$',
      },
      to: {
        path: '\\.(test|spec)\\.(js|ts|tsx)$',
      },
    },
  ],

  allowed: [
    // ==============================================================================
    // 許可されたパターン
    // ==============================================================================

    {
      comment: 'TypeScript型定義ファイルは全レイヤーから参照可能',
      from: { path: '^src' },
      to: { path: '\\.d\\.ts$' },
    },

    {
      comment: 'CSSファイルはプレゼンテーション層から参照可能',
      from: { path: '^src/components' },
      to: { path: '\\.(css|scss)$' },
    },

    {
      comment: 'テストファイルは同一ディレクトリ内の実装ファイル参照可能',
      from: { path: '\\.(test|spec)\\.(js|ts|tsx)$' },
      to: { path: '^src' },
    },
  ],

  options: {
    // TypeScript設定
    doNotFollow: {
      path: 'node_modules',
    },

    exclude: {
      // 除外パターン
      path: ['node_modules', '\\.d\\.ts$', 'dist', 'coverage'],
    },

    // TypeScript事前コンパイル依存関係を含める
    tsPreCompilationDeps: true,

    // TypeScript設定ファイル
    tsConfig: {
      fileName: './tsconfig.json',
    },

    // 拡張解決オプション
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
  },
}
