# IntelliJ IDEA での Jupyter 実行時のエラー対処法

## 問題

IntelliJ IDEA の Jupyter プラグインは uv パッケージマネージャーと互換性がないため、以下のエラーが発生します：

```
com.intellij.jupyter.core.jupyter.connections.exceptions.JupyterManagedPackageInstallException:
パッケージ "notebook" は uv に自動でインストールできないため、Jupyter を起動できません。
```

## 解決策：ブラウザベースの Jupyter を使用

IntelliJ IDE 内ではなく、ブラウザで Jupyter Notebook を実行します。

### 実行手順

#### 方法 1: Jupyter Notebook（推奨）

```bash
# notebook ディレクトリに移動
cd app/python/ml_tdd/notebook

# Jupyter Notebook を起動
uv run jupyter notebook
```

ブラウザが自動的に開き、`iris_classification_tutorial.ipynb` を選択して実行できます。

#### 方法 2: JupyterLab（モダンな UI）

```bash
# JupyterLab を使用する場合（まだインストールされていない場合）
cd app/python/ml_tdd
uv add jupyterlab

# notebook ディレクトリに移動して起動
cd notebook
uv run jupyter lab
```

### セルの実行方法

1. ブラウザで `iris_classification_tutorial.ipynb` を開く
2. **全セルを実行**: メニューバーから `Cell > Run All`
3. **セルを順次実行**: `Shift + Enter` で各セルを実行

### 期待される実行時間

- 全セルの実行: 約 30 秒〜1 分
- データの可視化、モデル訓練、予測結果がすべて表示されます

## 代替案：IntelliJ でコードを編集、ブラウザで実行

1. **IntelliJ IDEA**: `.ipynb` ファイルの編集に使用
2. **ブラウザ**: 実際の実行と可視化に使用

この組み合わせにより、IntelliJ の強力なエディタ機能とブラウザの完全な Jupyter 機能の両方を活用できます。

## トラブルシューティング

### ポートが既に使用されている場合

```bash
# 別のポートを指定
uv run jupyter notebook --port 8889
```

### Jupyter が起動しない場合

```bash
# パッケージの確認
uv pip list | grep jupyter

# 必要に応じて再インストール
uv remove jupyter matplotlib seaborn
uv add jupyter matplotlib seaborn
```

## 参考情報

詳細な使用方法は以下を参照してください：

- [QUICK_START.md](./QUICK_START.md) - 3 ステップで開始
- [README.md](./README.md) - 詳細なガイド
