/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '循環依存を禁止します',
      from: {},
      to: {
        circular: true
      }
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: '使用されていないファイルを警告します',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(?:js|cjs|mjs|ts|json)$', // ドットファイル
          '\\.d\\.ts$', // 型定義ファイル
          '(^|/)(?:test|spec)\\.(?:js|mjs|cjs|ts|ls|coffee|litcoffee|coffee\\.md)$', // テストファイル
          '(^|/)__tests__/', // テストディレクトリ
          '\\.test\\.(?:js|mjs|cjs|ts|tsx)$', // テストファイル
          '\\.spec\\.(?:js|mjs|cjs|ts|tsx)$', // スペックファイル
          'vitest.config.ts',
          'vite.config.ts',
          'electron.vite.config.ts'
        ]
      },
      to: {}
    },
    {
      name: 'no-deprecated-core',
      comment: '非推奨の Node.js コアモジュールの使用を禁止します',
      severity: 'warn',
      from: {},
      to: {
        dependencyTypes: ['core'],
        path: ['^(punycode|domain|constants|sys|_linklist|_stream_wrap)$']
      }
    }
  ],
  options: {
    doNotFollow: {
      path: ['node_modules', 'out', 'dist', 'coverage']
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/(?:@[^/]+/[^/]+|[^/]+)'
      },
      archi: {
        collapsePattern: '^(?:packages|src|lib|app|bin|test|spec)/[^/]+'
      }
    }
  }
}
