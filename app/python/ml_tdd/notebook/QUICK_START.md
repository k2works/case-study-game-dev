# 🚀 クイックスタートガイド

Iris 分類チュートリアルノートブックをすぐに実行するための手順です。

## ⚡ 3 ステップで開始

### ステップ 1: ディレクトリに移動

```bash
cd app/python/ml_tdd/notebook
```

### ステップ 2: Jupyter Notebook を起動

**方法 1: tox を使う（推奨）**

```bash
uv run tox -e notebook
```

または Jupyter Lab を使う場合：

```bash
uv run tox -e notebook-lab
```

**方法 2: 直接起動**

```bash
uv run jupyter notebook
```

または Jupyter Lab を使う場合：

```bash
uv run jupyter lab
```

### ステップ 3: ノートブックを開いて実行

ブラウザが自動的に開きます：

1. `iris_classification_tutorial.ipynb` をクリック
2. メニューから `Kernel > Restart & Clear Output` を選択（重要！）
3. メニューから `Cell > Run All` を選択
4. すべてのセルが実行されるのを待つ（約 30 秒〜1 分）

**重要**: 初回実行時は必ずカーネルを再起動してから実行してください。これにより日本語フォントが正しく設定されます。

## 📊 実行結果

以下が自動的に生成されます：

- データの可視化グラフ（ペアプロット）
- 混同行列のヒートマップ
- 予測結果の散布図
- モデルファイル（`../model/iris_model_notebook.pkl`）

## 🎯 学習の流れ

ノートブックでは以下を段階的に学習します：

```
📂 データ読み込み
  ↓
📊 データ可視化・分析
  ↓
✂️  訓練/テストデータに分割
  ↓
🎓 モデルの訓練
  ↓
📈 性能評価（正解率 91%）
  ↓
🔮 新しいデータで予測
  ↓
💾 モデルの保存・読み込み
```

## ⚠️ トラブルシューティング

### Jupyter が起動しない

```bash
# パッケージの再インストール
uv remove jupyter
uv add jupyter
```

### グラフが表示されない

```bash
# matplotlib のバックエンド設定
uv add ipympl
```

ノートブックの最初のセルに以下を追加：

```python
%matplotlib inline
```

### 日本語が文字化けする

ノートブックの最初のセルに以下を追加：

```python
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['MS Gothic', 'Yu Gothic', 'DejaVu Sans']
```

## 💡 ヒント

- **初めての方**: セルを 1 つずつ実行して、結果を確認しながら進めましょう
- **パラメータ変更**: `max_depth` の値を変えて、性能への影響を観察しましょう
- **データ追加**: 新しいサンプルを追加して、予測結果を確認しましょう

## 📖 詳細情報

詳細な説明は [README.md](./README.md) を参照してください。

---

**準備完了！今すぐ実行してみましょう！** 🎉
