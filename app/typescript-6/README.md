# ぷよぷよゲーム (Electron + React + TypeScript)

## 概要

### 目的

テスト駆動開発（TDD）を実践しながら、Electron + React + TypeScript でぷよぷよゲームを実装する。

### 前提

| ソフトウェア | バージョン | 備考                   |
| :----------- | :--------- | :--------------------- |
| Node.js      | 18.x 以上  | LTS 推奨               |
| npm          | 9.x 以上   |                        |
| TypeScript   | ~5.8.3     |                        |
| Electron     | ^33.2.1    | デスクトップアプリ化   |
| React        | ^18.3.1    | UI フレームワーク      |
| Vitest       | ^3.2.4     | テストフレームワーク   |
| Zod          | ^4.1.12    | スキーマバリデーション |

## 構成

- [Quick Start](#quick-start)
- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

```bash
# 依存パッケージのインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm run test

# 全体チェック（lint + format + test）
npm run check
```

### 構築

#### 初期セットアップ

```bash
# プロジェクトの初期化
npm init -y

# 依存パッケージのインストール
npm install

# 全体チェックの実行
npm run check
```

#### プロジェクト構造

```
app/typescript-6/
├── src/
│   ├── main/              # Electron メインプロセス
│   │   └── index.ts
│   ├── preload/           # プリロードスクリプト
│   │   └── index.ts
│   └── renderer/          # React レンダラープロセス
│       ├── index.html
│       └── src/
│           ├── App.tsx
│           ├── App.test.tsx
│           ├── main.tsx
│           ├── schemas/   # Zod スキーマ定義
│           └── test/      # テストセットアップ
├── out/                   # ビルド出力先
├── coverage/              # カバレッジレポート
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── electron.vite.config.ts
├── eslint.config.js
├── gulpfile.js
└── README.md
```

**[⬆ back to top](#構成)**

### 配置

#### ビルド

```bash
# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

#### Electron アプリケーションのパッケージング

```bash
# 現在のプラットフォーム用にビルド
npm run dist

# Windows 用ビルド（NSIS インストーラー + ポータブル版）
npm run build:win

# macOS 用ビルド（DMG + ZIP）
npm run build:mac

# Linux 用ビルド（AppImage + deb）
npm run build:linux

# すべてのプラットフォーム用にビルド
npm run build:all
```

**ビルド成果物：**

- Windows ZIP: `dist/ぷよぷよゲーム-0.1.0-win.zip` (約 108MB)
- Windows アンパッケージ版: `dist/win-unpacked/ぷよぷよゲーム.exe` (約 181MB)
- macOS: `dist/ぷよぷよゲーム-X.X.X.dmg`
- macOS: `dist/ぷよぷよゲーム-X.X.X-mac.zip`
- Linux: `dist/ぷよぷよゲーム-X.X.X.AppImage`
- Linux: `dist/ぷよぷよゲーム_X.X.X_amd64.deb`

**注意**:
- Windows 版はコード署名なしでビルドされます（開発環境用）
- 本番環境では適切なコード署名証明書を設定することを推奨します

**アイコンファイルの準備：**

アプリケーションのアイコンをカスタマイズする場合は、以下のファイルを `build/` ディレクトリに配置してください：

- `build/icon.ico` - Windows 用アイコン（256x256px 以上）
- `build/icon.icns` - macOS 用アイコン（512x512px 以上）
- `build/icon.png` - Linux 用アイコン（512x512px）

詳細は `build/README.md` を参照してください。

**[⬆ back to top](#構成)**

### 運用

#### 開発サーバー

```bash
# 開発サーバーの起動（Electron アプリが自動起動）
npm run dev
```

#### ファイル監視（Guard モード）

```bash
# ファイル変更時に自動で lint + format + test を実行
npm run guard
```

#### テスト

```bash
# テストの実行
npm run test

# テストの watch モード
npm run test:watch

# カバレッジレポートの生成
npm run test:coverage
```

#### コード品質管理

```bash
# ESLint チェック
npm run lint

# ESLint 自動修正
npm run lint:fix

# Prettier フォーマット
npm run format

# Prettier チェック
npm run format:check

# 全体チェック（lint + format + test）
npm run check
```

#### リリース

```bash
# リリース前チェック（lint + format + test + coverage + build）
npm run prerelease

# リモートブランチへプッシュ
npm run release

# 完全リリースフロー（prerelease + release）
npm run fullrelease
```

**リリースフロー：**

1. **リリース前チェック**: `npm run prerelease`
   - コード整形（lint + format）
   - 依存関係チェック
   - 全テスト実行
   - カバレッジ測定
   - プロダクションビルド

2. **リモートプッシュ**: `npm run release`
   - 現在のブランチをリモートにプッシュ

3. **プルリクエスト作成**: GitHub で PR を作成
   - ブランチ: case-X → main
   - 変更内容のサマリーを記載

4. **コードレビューとマージ**: レビュー承認後にマージ

**[⬆ back to top](#構成)**

### 開発

#### 開発手法

このプロジェクトでは、**テスト駆動開発（TDD）** を採用しています。

**TDD のサイクル：**

1. **Red（赤）**: 失敗するテストを書く
2. **Green（緑）**: テストを通す最小限のコードを実装
3. **Refactor（リファクタリング）**: コードの品質を改善

#### Gulp タスク

```bash
# タスク一覧の表示
npx gulp --tasks

# 個別タスクの実行
npx gulp test          # テスト実行
npx gulp lint          # ESLint チェック
npx gulp format        # Prettier フォーマット
npx gulp checkAndFix   # 全体チェック（自動修正付き）
npx gulp guard         # ファイル監視モード

# リリースタスク
npx gulp prerelease    # リリース前チェック（lint + format + test + coverage + build）
npx gulp release       # リモートプッシュ
npx gulp fullRelease   # 完全リリース（prerelease + release）
```

#### コード品質基準

- **循環的複雑度**: 最大 7
- **認知的複雑度**: 最大 4
- **テストカバレッジ**: 目標 80% 以上

#### ディレクトリ構造の規約

```
src/renderer/src/
├── components/     # React コンポーネント
├── game/          # ゲームロジック
├── schemas/       # Zod スキーマ定義
├── hooks/         # カスタムフック
├── utils/         # ユーティリティ関数
└── test/          # テストユーティリティ
```

#### Git コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/ja/) 形式に従います。

**タイプ：**

- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `test`: テストの追加・修正
- `docs`: ドキュメントのみの変更
- `chore`: ビルドプロセスや補助ツールの変更

**例：**

```bash
git commit -m 'feat: ぷよの回転機能を実装'
git commit -m 'test: ぷよ消去のテストケースを追加'
git commit -m 'refactor: メソッドの抽出'
```

#### 技術スタック

**フレームワーク：**

- Electron: デスクトップアプリケーションフレームワーク
- React: UI フレームワーク
- TypeScript: 型安全な開発

**開発ツール：**

- Vite: 高速ビルドツール
- Vitest: テストフレームワーク
- ESLint: 静的コード解析
- Prettier: コードフォーマッター
- Gulp: タスクランナー

**ライブラリ：**

- Zod: スキーマバリデーション
- @testing-library/react: React コンポーネントテスト

**[⬆ back to top](#構成)**

## 参照

- [Electron 公式ドキュメント](https://www.electronjs.org/docs/latest/)
- [React 公式ドキュメント](https://react.dev/)
- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Vitest 公式ドキュメント](https://vitest.dev/)
- [Zod 公式ドキュメント](https://zod.dev/)
- [テスト駆動開発 by Kent Beck](https://www.ohmsha.co.jp/book/9784274217883/)
- [Clean Code by Robert C. Martin](https://www.kadokawa.co.jp/product/301806000678/)

## ライセンス

MIT
