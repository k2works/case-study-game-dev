# MkDocs GitHub Actions設定手順

このドキュメントでは、GitHub ActionsでMkDocsを自動化し、GitHub Pagesにデプロイする手順を説明します。

## 前提条件

- GitHubリポジトリがすでに作成されている
- Node.jsプロジェクトが設定済み（`package.json`が存在する）
- MkDocsプロジェクトが設定済み（`mkdocs.yml`が存在する）
- GitHub Pagesを使用する権限がある

## 手順

### 1. GitHub Actionsワークフローファイルの作成

リポジトリのルートに`.github/workflows`ディレクトリを作成し、その中に`mkdocs.yml`を作成します。

```yaml
name: Deploy MkDocs

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout the repository
        uses: actions/checkout@v3

      - name: Use Node.js latest
        uses: actions/setup-node@v3
        with:
          node-version: latest
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Deploy HTML files
        run: npm run docs:build

      - name: mkdocs deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          deploy_key: ${{ secrets.ACTIONS_DEPLOY_KEY }}
          publish_dir: ./site
```

### 2. デプロイキーの設定

このワークフローはデプロイキーを使用してGitHub Pagesにデプロイします。

#### デプロイキーの生成

1. ローカル環境でSSHキーペアを生成：
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com" -f github-actions-deploy
   ```

2. 生成された2つのファイル：
   - `github-actions-deploy` (秘密鍵)
   - `github-actions-deploy.pub` (公開鍵)

#### GitHubでの設定

1. **Deploy Keys**の設定（公開鍵）：
   - リポジトリの **Settings** → **Deploy keys** → **Add deploy key**
   - Title: `GitHub Actions`
   - Key: `github-actions-deploy.pub`の内容をコピー&ペースト
   - **Allow write access**にチェック
   - **Add key**をクリック

2. **Secrets**の設定（秘密鍵）：
   - リポジトリの **Settings** → **Secrets and variables** → **Actions**
   - **New repository secret**をクリック
   - Name: `ACTIONS_DEPLOY_KEY`
   - Value: `github-actions-deploy`（秘密鍵）の内容をコピー&ペースト
   - **Add secret**をクリック

### 3. package.jsonスクリプトの設定

`package.json`に以下のスクリプトが必要です：

```json
{
  "scripts": {
    "docs:build": "mkdocs build"
  }
}
```

### 4. GitHub Pagesの設定

1. GitHubリポジトリページにアクセス
2. **Settings** タブをクリック
3. 左側のメニューから **Pages** を選択
4. **Source** セクションで以下を設定：
   - **Source**: `Deploy from a branch`を選択
   - **Branch**: `gh-pages`を選択
   - **Folder**: `/ (root)`を選択

### 5. ローカルでのテスト

デプロイ前にローカルで動作確認：

```bash
# npmパッケージのインストール
npm install

# ローカルサーバーの起動
npm run docs:dev

# ビルドのテスト
npm run docs:build
```

### 6. デプロイの実行

1. 変更をコミット
2. mainブランチにプッシュ
3. GitHub Actionsが自動的に実行される
4. Actions タブで進行状況を確認

### 7. デプロイの確認

デプロイが成功したら、以下のURLでサイトにアクセス可能：

```
https://<username>.github.io/<repository-name>/
```

## トラブルシューティング

### よくある問題と解決方法

#### 1. デプロイキーのエラー

デプロイキーが正しく設定されていない場合：
- Deploy Keysに公開鍵が追加されているか確認
- Secretsに秘密鍵が正しく設定されているか確認
- "Allow write access"がチェックされているか確認

#### 2. ビルドエラー

`npm run docs:build`が失敗する場合：
- `package.json`にスクリプトが定義されているか確認
- MkDocsがインストールされているか確認
- `mkdocs.yml`の設定が正しいか確認

#### 3. デプロイ後404エラー

- GitHub Pagesの設定で`gh-pages`ブランチが選択されているか確認
- デプロイが成功しているか Actions タブで確認
- `mkdocs.yml`の`site_url`設定を確認：
  ```yaml
  site_url: https://<username>.github.io/<repository-name>/
  ```

#### 4. peaceiris/actions-gh-pages@v3 の権限エラー

```
Error: Action failed with error: The process '/usr/bin/git' failed with exit code 128
```

このエラーが発生した場合：
- デプロイキーの権限を確認
- リポジトリのDefault branchがprotectedでないか確認

### デバッグ方法

ワークフローにデバッグステップを追加：

```yaml
- name: Debug - List files
  run: |
    echo "Current directory:"
    pwd
    echo "Files in current directory:"
    ls -la
    echo "Files in site directory:"
    ls -la site/
```

## カスタマイズ

### 複数ブランチのサポート

異なるブランチを異なる環境にデプロイする場合：

```yaml
on:
  push:
    branches:
      - main
      - develop
      - 'release/*'
```

### Node.jsバージョンの固定

特定のNode.jsバージョンを使用する場合：

```yaml
- name: Use Node.js
  uses: actions/setup-node@v3
  with:
    node-version: '18.x'  # 特定のバージョンを指定
    cache: 'npm'
```

### カスタムドメインの設定

1. `docs/CNAME`ファイルを作成し、カスタムドメインを記載
2. `mkdocs.yml`に以下を追加：
   ```yaml
   extra_files:
     - CNAME
   ```

### 環境変数の使用

秘密情報や設定値を環境変数として使用：

```yaml
- name: Deploy HTML files
  env:
    SITE_URL: ${{ secrets.SITE_URL }}
  run: npm run docs:build
```

## 参考リンク

- [MkDocs公式ドキュメント](https://www.mkdocs.org/)
- [GitHub Actions公式ドキュメント](https://docs.github.com/en/actions)
- [GitHub Pages公式ドキュメント](https://docs.github.com/en/pages)
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)