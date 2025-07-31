# Vercel設定ガイド

## 概要

このドキュメントでは、ぷよぷよゲームアプリケーションをVercelにデプロイするための設定手順を説明します。

## 前提条件

- GitHubアカウント
- Vercelアカウント
- 本プロジェクトのリポジトリへのアクセス権限

## 手順

### 1. Vercelアカウントの作成・ログイン

1. [Vercel](https://vercel.com/)にアクセス
2. GitHubアカウントでサインアップ/ログイン

### 2. プロジェクトのインポート

1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. GitHubリポジトリから本プロジェクトを選択
3. 「Import」をクリック

### 3. プロジェクト設定

#### Framework Preset
- **Framework Preset**: `Vite`を選択（自動検出される場合あり）

#### Build and Output Settings
- **Build Command**: `npm run build`（自動検出される）
- **Output Directory**: `dist`（自動検出される）
- **Install Command**: `npm install`（自動検出される）

#### Root Directory
- **Root Directory**: `app`を指定
- 「Include source files outside of the Root Directory in the Build Step」にチェック

### 4. 環境変数の設定（オプション）

必要に応じて以下の環境変数を設定：

| 変数名 | 説明 | 値の例 |
|--------|------|--------|
| `NODE_ENV` | Node.js実行環境 | `production` |

### 5. デプロイ実行

「Deploy」ボタンをクリックしてデプロイを開始

### 6. GitHub Actions用のシークレット設定

自動デプロイを有効にするため、GitHubリポジトリのSecretsに以下を設定：

#### 6.1 Vercel Tokenの取得

1. Vercelダッシュボードで右上のプロフィール→「Settings」
2. 左メニューから「Tokens」
3. 「Create Token」で新しいトークンを作成
4. トークン名を入力（例：`github-actions`）
5. スコープは「Full Account」を選択
6. 生成されたトークンをコピー

#### 6.2 Organization IDの取得

1. Vercelダッシュボードで右上のプロフィール→「Settings」
2. 左メニューから「General」
3. 「Your ID」をコピー

#### 6.3 Project IDの取得

1. Vercelダッシュボードでプロジェクトを選択
2. 「Settings」タブをクリック
3. 「General」セクションで「Project ID」をコピー

#### 6.4 GitHubリポジトリのSecrets設定

1. GitHubリポジトリの「Settings」→「Secrets and variables」→「Actions」
2. 以下のSecretを追加：

| Secret名 | 説明 | 値 |
|----------|------|-----|
| `VERCEL_TOKEN` | Vercelアクセストークン | 手順6.1で取得したトークン |
| `ORG_ID` | Vercel組織ID | 手順6.2で取得したID |
| `PROJECT_ID` | VercelプロジェクトID | 手順6.3で取得したID |

## 手動デプロイ

手動でVercelにデプロイする場合：

```bash
# Vercel CLIのインストール
npm i -g vercel@latest

# アプリケーションディレクトリに移動
cd app

# 初回設定
vercel login

# アプリケーションのビルド
npm run build

# デプロイ（環境変数を使用）
export VERCEL_ORG_ID=your_org_id
export VERCEL_PROJECT_ID=your_project_id
vercel --prod

# または既存プロジェクトへのデプロイ
vercel link
vercel --prod
```

## 自動デプロイの動作確認

1. `case-1`ブランチに変更をプッシュ
2. GitHub Actionsが実行されることを確認
3. アプリケーションがビルドされる
4. Vercel CLIを使用してデプロイが実行される
5. Vercelダッシュボードで新しいデプロイメントを確認

## トラブルシューティング

### よくある問題と解決方法

#### ビルドエラー

**問題**: `npm run build`でエラーが発生
**解決**: 
- `app/`ディレクトリがRoot Directoryに設定されているか確認
- Build Commandが正しく設定されているか確認

#### デプロイが実行されない

**問題**: GitHub Actionsは成功するがVercelデプロイが実行されない
**解決**:
- GitHub Secretsがすべて正しく設定されているか確認
- `case-1`ブランチにプッシュしているか確認

#### 404エラー

**問題**: デプロイ後にアクセスすると404エラー
**解決**:
- Output Directoryが`dist`に設定されているか確認
- `vercel.json`の`rewrites`設定を確認
- SPAの場合、すべてのルートを`/index.html`にリダイレクトする設定が必要

#### "name" property deprecated 警告

**問題**: `vercel.json`で名前プロパティの警告が出る
**解決**:
- `vercel.json`から`name`プロパティを削除
- プロジェクト名はVercelダッシュボードで管理

#### spawn sh ENOENT エラー

**問題**: `vercel build`で`spawn sh ENOENT`エラーが発生
**解決**:
- Vercelビルドの代わりにnpmビルドを使用
- `npm run build`でアプリケーションをビルドしてから`vercel --prod`でデプロイ
- GitHub Actionsではubuntu-latestランナーを使用

#### パス不存在エラー

**問題**: `The provided path "~/work/.../app/app" does not exist`エラーが発生
**解決方法1**: 環境変数を使用したデプロイ
- `VERCEL_ORG_ID`と`VERCEL_PROJECT_ID`環境変数を設定
- 既存のプロジェクト設定の影響を回避
  ```bash
  cd app
  export VERCEL_ORG_ID=your_org_id
  export VERCEL_PROJECT_ID=your_project_id
  vercel --prod --token=TOKEN --yes
  ```

**解決方法2**: 手動プロジェクト設定
- `.vercel/project.json`を手動作成してプロジェクト情報を設定
- `working-directory`を正しく設定
- Vercelプロジェクト設定でRoot Directoryが正しく設定されているか確認
- GitHub Actionsで以下のコマンドを実行：
  ```bash
  mkdir -p .vercel
  echo '{"orgId":"ORG_ID","projectId":"PROJECT_ID"}' > .vercel/project.json
  ```

#### 未知のオプションエラー

**問題**: `Error: unknown or unexpected option: --org`エラーが発生
**解決**:
- `--org`オプションは使用しない
- 代わりに`VERCEL_ORG_ID`環境変数を使用
- サポートされているオプションのみを使用：`--prod`, `--token`, `--yes`

## 関連ファイル

- `app/vercel.json` - Vercel設定ファイル
- `.github/workflows/ci.yml` - GitHub Actionsワークフロー
- `app/package.json` - ビルドスクリプト設定

## 参考資料

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel GitHub Integration](https://vercel.com/docs/git/vercel-for-github)
- [GitHub Actions Secrets](https://docs.github.com/ja/actions/security-guides/encrypted-secrets)