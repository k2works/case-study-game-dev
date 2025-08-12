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
      severity: 'error',
      from: {
        path: '^src/components',
        pathNot: '\\.(test|spec)\\.(js|ts|tsx)$|GameBoard\\.tsx$',
      },
      to: {
        path: '^src/(?!application|services|utils|styles|hooks|types\\.ts)',
        pathNot:
          '^src/(application|services|utils|styles|hooks|components|types\\.ts)',
      },
    },

    {
      name: 'application-layer-boundaries',
      comment:
        'アプリケーション層はドメイン層、サービス層、インフラストラクチャ層のみ参照可能',
      severity: 'error',
      from: { path: '^src/application' },
      to: {
        path: '^src/(?!domain|services|infrastructure|types\\.ts)',
        pathNot: '^src/(domain|services|infrastructure|application|types\\.ts)',
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
        'インフラストラクチャ層は依存性注入のため例外的に他層への参照を許可',
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
      comment: 'CSSファイルは全てのコンポーネントから参照可能',
      from: { path: '^src' },
      to: { path: '\\.(css|scss)$' },
    },

    {
      comment: 'テストファイルは同一ディレクトリ内の実装ファイル参照可能',
      from: { path: '\\.(test|spec)\\.(js|ts|tsx)$' },
      to: { path: '^src' },
    },

    {
      comment: 'テストファイルからドメイン層への直接参照は例外的に許可',
      from: { path: '^src/components/.*\\.(test|spec)\\.(js|ts|tsx)$' },
      to: { path: '^src/domain' },
    },

    {
      comment: 'main.tsxはエントリーポイントとして例外的にすべて参照可能',
      from: { path: '^src/main\\.tsx$' },
      to: { path: '^src' },
    },

    {
      comment: 'App.tsxはルートコンポーネントとして例外的にすべて参照可能',
      from: { path: '^src/App\\.tsx$' },
      to: { path: '^src' },
    },

    {
      comment: '同一レイヤー内の相互参照は許可',
      from: { path: '^src/components' },
      to: { path: '^src/components' },
    },

    {
      comment: '同一レイヤー内の相互参照は許可',
      from: { path: '^src/domain' },
      to: { path: '^src/domain' },
    },

    {
      comment: '同一レイヤー内の相互参照は許可',
      from: { path: '^src/services' },
      to: { path: '^src/services' },
    },

    {
      comment: '同一レイヤー内の相互参照は許可',
      from: { path: '^src/infrastructure' },
      to: { path: '^src/infrastructure' },
    },

    {
      comment: '同一レイヤー内の相互参照は許可',
      from: { path: '^src/application' },
      to: { path: '^src/application' },
    },

    {
      comment: 'エントリーポイントは外部ライブラリ参照可能',
      from: { path: '^src/main\\.tsx$' },
      to: { path: 'node_modules' },
    },

    {
      comment: 'プレゼンテーション層からアプリケーション層は許可',
      from: { path: '^src/components' },
      to: { path: '^src/application' },
    },

    {
      comment: 'プレゼンテーション層からサービス層は許可',
      from: { path: '^src/components' },
      to: { path: '^src/services' },
    },

    {
      comment: 'プレゼンテーション層からhooks/utilsは許可',
      from: { path: '^src/components' },
      to: { path: '^src/(hooks|utils)' },
    },

    {
      comment: 'アプリケーション層からドメイン層・サービス層・インフラ層は許可',
      from: { path: '^src/application' },
      to: { path: '^src/(domain|services|infrastructure)' },
    },

    {
      comment: 'サービス層からドメイン層・インフラ層・utilsは許可',
      from: { path: '^src/services' },
      to: { path: '^src/(domain|infrastructure|utils)' },
    },

    {
      comment: 'インフラ層からutilsは許可',
      from: { path: '^src/infrastructure' },
      to: { path: '^src/utils' },
    },

    {
      comment:
        'DIセットアップは例外的にサービス層・アプリケーション層を参照可能',
      from: { path: '^src/infrastructure/di/setup' },
      to: { path: '^src/(services|application)' },
    },

    {
      comment: 'main.tsx から vite/client（開発用）は許可',
      from: { path: '^src/main\\.tsx$' },
      to: { path: 'vite/client' },
    },

    {
      comment:
        'GameBoardはゲームの中核コンポーネントのため例外的にドメイン参照許可',
      from: { path: '^src/components/GameBoard\\.tsx$' },
      to: { path: '^src/domain' },
    },

    {
      comment: '共通型定義（src/types.ts）は全レイヤーから参照可能',
      from: { path: '^src' },
      to: { path: '^src/types\\.ts$' },
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
