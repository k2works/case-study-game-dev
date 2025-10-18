# Iris 分類チュートリアル Notebook

このディレクトリには、TDD で実装した Iris 分類器を使った機械学習の完全チュートリアルが含まれています。

## 📚 Notebook の内容

### `iris_classification_tutorial.ipynb`

学習から予測までの一連の流れを網羅したインタラクティブなチュートリアル。

**主な内容:**

1. **データの読み込みと前処理**
   - CSV からのデータ読み込み
   - 欠損値の補完
   - データの基本統計

2. **データの可視化**
   - ペアプロット
   - 特徴量間の関係の理解

3. **データの分割**
   - 訓練データ（70%）とテストデータ（30%）への分割
   - 層化抽出によるクラス比率の保持

4. **モデルの訓練**
   - 決定木分類器の訓練
   - パラメータ設定（max_depth=3）

5. **モデルの評価**
   - 正解率の計算
   - 混同行列の作成
   - 分類レポートの生成
   - 過学習のチェック

6. **予測の実行**
   - 新しいデータでの分類予測
   - 結果の可視化

7. **モデルの保存と読み込み**
   - pickle によるモデルの永続化
   - 保存したモデルの再利用

## 🚀 実行方法

### 1. 必要なパッケージのインストール

Jupyter Notebook と可視化用のパッケージをインストールします：

```bash
# プロジェクトルートから実行
cd app/python/ml_tdd

# 必要なパッケージを追加
uv add jupyter matplotlib seaborn

# または pip を使用
# uv pip install jupyter matplotlib seaborn
```

### 2. Jupyter Notebook の起動

```bash
# notebook ディレクトリに移動
cd notebook

# Jupyter Notebook を起動
uv run jupyter notebook

# または Jupyter Lab を使用する場合
# uv add jupyterlab
# uv run jupyter lab
```

### 3. ブラウザでノートブックを開く

自動的にブラウザが開きます。`iris_classification_tutorial.ipynb` を選択して実行してください。

### 4. セルの実行

- **全セルを実行**: メニューバーから `Cell > Run All`
- **セルを順次実行**: `Shift + Enter` で各セルを実行

## 📊 期待される結果

ノートブックを実行すると、以下の成果物が得られます：

1. **データの可視化**
   - Iris データセットのペアプロット
   - 特徴量間の相関関係の可視化

2. **モデル性能の評価**
   - 訓練データ正解率: 約 96%
   - テストデータ正解率: 約 91%
   - 混同行列のヒートマップ
   - 詳細な分類レポート

3. **予測結果の可視化**
   - 新しいデータの分類結果
   - 散布図による予測の可視化

4. **保存されたモデル**
   - `../model/iris_model_notebook.pkl`

## 🔧 トラブルシューティング

### ImportError が発生する場合

```bash
# パスの設定を確認
import sys
sys.path.append('..')  # notebook から親ディレクトリを追加
```

### matplotlib で日本語が表示されない場合

日本語フォントの警告（`UserWarning: Glyph ... missing from font(s) Arial`）が表示される場合：

**解決方法 1: カーネルを再起動**

1. Jupyter Notebook のメニューから `Kernel > Restart & Clear Output`
2. 最初のセル（環境セットアップ）から順に実行し直す

**解決方法 2: 手動でフォント設定**

ノートブックの最初のセルに以下を追加：

```python
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm

# フォントキャッシュをクリア
fm._load_fontmanager(try_read_cache=False)

# 日本語フォントを明示的に指定
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['BIZ UDGothic', 'MS Gothic', 'Yu Gothic', 'Meiryo']
plt.rcParams['axes.unicode_minus'] = False
```

**解決方法 3: Jupyter Notebook を完全に再起動**

```bash
# Jupyter を停止（Control-C を2回）
# その後、再度起動
cd app/python/ml_tdd/notebook
uv run jupyter notebook
```

ノートブックを開いて、`Kernel > Restart & Clear Output` を選択してから全セルを実行し直してください。

### Jupyter Notebook が起動しない場合

```bash
# Jupyter のバージョンを確認
uv run jupyter --version

# 再インストール
uv remove jupyter
uv add jupyter
```

## 📝 学習のポイント

### 初心者向け

- セルを上から順に実行していくことで、機械学習の流れを体験できます
- 各セルのコメントを読んで、何をしているか理解しましょう
- 変数の値を変更して、結果がどう変わるか試してみましょう

### 中級者向け

- `max_depth` パラメータを変更して、モデルの性能への影響を確認
- 異なる `test_size` でデータを分割して、性能の変化を観察
- 新しい特徴量を追加して、モデルの改善を試みる

### 上級者向け

- クロスバリデーションを追加して、性能をより正確に評価
- 他のアルゴリズム（Random Forest、SVM など）と比較
- ハイパーパラメータチューニングを実装

## 🎯 次のステップ

このノートブックをマスターしたら、以下に挑戦してみましょう：

1. **他のデータセット**
   - Cinema データセット（回帰問題）
   - Boston データセット（回帰問題）
   - Survived データセット（分類問題）

2. **高度な手法**
   - アンサンブル学習（Random Forest、Gradient Boosting）
   - 特徴量エンジニアリング
   - ハイパーパラメータの最適化

3. **本番環境への展開**
   - FastAPI による Web API 化
   - Docker によるコンテナ化
   - クラウドへのデプロイ

## 📖 参考資料

- [scikit-learn 公式ドキュメント](https://scikit-learn.org/)
- [Jupyter Notebook ドキュメント](https://jupyter-notebook.readthedocs.io/)
- [matplotlib ギャラリー](https://matplotlib.org/stable/gallery/index.html)
- [seaborn チュートリアル](https://seaborn.pydata.org/tutorial.html)

---

**🎉 Happy Learning!**
