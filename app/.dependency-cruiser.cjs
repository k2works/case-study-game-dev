/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-domain-to-presentation',
      severity: 'error',
      comment: 'ドメイン層はプレゼンテーション層に依存してはいけない',
      from: {
        path: '^src/domain',
      },
      to: {
        path: '^src/presentation',
      },
    },
    {
      name: 'no-domain-to-infrastructure',
      severity: 'error',
      comment: 'ドメイン層はインフラストラクチャ層に依存してはいけない',
      from: {
        path: '^src/domain',
      },
      to: {
        path: '^src/infrastructure',
      },
    },
    {
      name: 'no-domain-to-application',
      severity: 'error',
      comment: 'ドメイン層はアプリケーション層に依存してはいけない',
      from: {
        path: '^src/domain',
      },
      to: {
        path: '^src/application',
      },
    },
    {
      name: 'no-application-to-presentation',
      severity: 'error',
      comment: 'アプリケーション層はプレゼンテーション層に依存してはいけない',
      from: {
        path: '^src/application',
      },
      to: {
        path: '^src/presentation',
      },
    },
    {
      name: 'no-application-to-infrastructure',
      severity: 'error',
      comment: 'アプリケーション層はインフラストラクチャ層の実装に直接依存してはいけない',
      from: {
        path: '^src/application',
      },
      to: {
        path: '^src/infrastructure',
        pathNot: '^src/infrastructure/ports',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment: '循環依存は許可されない',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: '使用されていないモジュールの検出',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', // 設定ファイル
          '\\.d\\.ts$', // 型定義ファイル
          '(^|/)tsconfig\\..*\\.json$', // TypeScript設定
          '(^src/main\\.tsx$)', // エントリーポイント
          '\\.(test|spec)\\.(js|mjs|cjs|ts|tsx)$', // テストファイル
        ],
      },
      to: {},
    },
    {
      name: 'not-to-test',
      comment: 'プロダクションコードからテストファイルへの依存は許可されない',
      severity: 'error',
      from: {
        pathNot: '\\.(test|spec)\\.(js|mjs|cjs|ts|tsx)$',
      },
      to: {
        path: '\\.(test|spec)\\.(js|mjs|cjs|ts|tsx)$',
      },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    includeOnly: '^src',
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(packages|src|lib|app|bin|test(s?))/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
}