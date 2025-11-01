# ml-tdd-project

TDD で学ぶ Clojure 機械学習プログラミング

このプロジェクトは、テスト駆動開発（TDD）を実践しながら Clojure で機械学習を学ぶためのプロジェクトです。

## プロジェクト構造

```
ml-tdd-project/
├── src/                           # ソースコード
│   └── ml_tdd_project/
│       ├── core.clj              # メインエントリーポイント
│       ├── ml/                    # 機械学習モデル
│       │   ├── iris_classifier.clj      # アヤメ分類モデル
│       │   ├── cinema_predictor.clj     # 映画興行収入予測モデル
│       │   ├── survived_classifier.clj  # 生存予測モデル
│       │   └── boston_predictor.clj     # 住宅価格予測モデル
│       └── api/                   # Web API
│           └── handler.clj
├── test/                          # テストコード
│   └── ml_tdd_project/
│       ├── core_test.clj
│       └── ml/
│           ├── iris_classifier_test.clj
│           ├── cinema_predictor_test.clj
│           ├── survived_classifier_test.clj
│           └── boston_predictor_test.clj
├── scripts/                       # 実行スクリプト
│   ├── run_iris_classifier.clj      # Iris 分類器実行スクリプト
│   ├── run_cinema_predictor.clj     # Cinema 予測器実行スクリプト
│   ├── run_survived_classifier.clj  # Survived 分類器実行スクリプト
│   └── run_boston_predictor.clj     # Boston 予測器実行スクリプト
├── resources/                     # リソースファイル
│   └── data/                      # データセット
│       ├── iris.csv
│       ├── cinema.csv
│       ├── Survived.csv
│       └── Boston.csv
├── model/                         # 訓練済みモデル
├── notebooks/                     # Jupyter Notebook
│   ├── iris_classifier.ipynb      # Iris 分類器ノートブック
│   └── cinema_predictor.ipynb     # Cinema 予測器ノートブック
└── project.clj                    # プロジェクト設定
```

## 必要要件

- Java 11+
- Leiningen 2.9+

## セットアップ

依存関係のインストール：

```bash
lein deps
```

## テスト実行

すべてのテストを実行：

```bash
lein test
```

特定のテストのみ実行：

```bash
lein test ml-tdd-project.ml.iris-classifier-test
```

## 実行スクリプト

### Iris 分類器

Iris 分類器を実行するスクリプト：

```bash
lein run -m clojure.main scripts/run_iris_classifier.clj
```

このスクリプトは以下を実行します：
- データの読み込みと分割
- モデルの訓練
- テストデータでの予測
- 正解率の計算
- 混同行列の表示

### Cinema 興行収入予測器

Cinema 予測器を実行するスクリプト：

```bash
lein run -m clojure.main scripts/run_cinema_predictor.clj
```

このスクリプトは以下を実行します：
- データの読み込みと分割
- 線形回帰モデルの訓練
- テストデータでの予測
- RMSE と R² の計算
- サンプル予測の表示

### Survived 生存予測器

Survived 分類器を実行するスクリプト：

```bash
lein run -m clojure.main scripts/run_survived_classifier.clj
```

このスクリプトは以下を実行します：
- データの読み込みと分割
- 決定木モデルの訓練（前処理含む）
- テストデータでの予測
- 正解率、適合率、再現率、F1 スコアの計算
- 混同行列の表示

### Boston 住宅価格予測器

Boston 予測器を実行するスクリプト：

```bash
lein run -m clojure.main scripts/run_boston_predictor.clj
```

このスクリプトは以下を実行します：
- データの読み込みと分割
- CRIME カテゴリカル変数のダミー変数化
- 欠損値の補完（平均値で補完）
- 線形回帰モデルの訓練
- テストデータでの予測
- RMSE と R² の計算
- 予測値と実際の値の統計表示

## Jupyter Notebook

### Clojupyter のインストール

Jupyter Notebook で Clojure コードを実行するには、まず Clojupyter カーネルをインストールします：

```bash
lein jupyter-install
```

インストール後、利用可能なカーネルを確認：

```bash
jupyter kernelspec list
```

`clojupyter-0.4.332332` カーネルが表示されればインストール成功です。

### Notebook の起動

インタラクティブな実験と可視化には Jupyter Notebook を使用します：

```bash
jupyter notebook
```

#### Iris 分類器ノートブック

ブラウザで Jupyter が開いたら：
1. `notebooks/iris_classifier.ipynb` を開く
2. カーネルとして `clojupyter-0.4.332332` を選択
3. セルを実行して Iris 分類器を試す

Notebook には以下が含まれます：
- データの探索的分析
- モデルの訓練と評価
- パラメータチューニングの実験

#### Cinema 予測器ノートブック

ブラウザで Jupyter が開いたら：
1. `notebooks/cinema_predictor.ipynb` を開く
2. カーネルとして `clojupyter-0.4.332332` を選択
3. セルを実行して Cinema 予測器を試す

Notebook には以下が含まれます：
- データの読み込みと前処理
- 線形回帰モデルの訓練と評価
- 予測精度の分析
- 残差の統計

### トラブルシューティング

**エラー: `SyntaxError: unterminated string literal`**

このエラーは、Python カーネルで Clojure コードを実行しようとしている場合に発生します。

**解決方法**:

1. Jupyter Notebook で `Kernel` メニューを開く
2. `Change Kernel` を選択
3. `Clojure (clojupyter-0.4.332332)` を選択

または、Notebook を閉じて再度開くと、正しいカーネルが自動的に選択されます。

## 品質チェック

コードフォーマット：

```bash
lein cljfmt check   # チェックのみ
lein cljfmt fix     # 自動修正
```

静的解析：

```bash
lein kibit
```

## Web API

機械学習モデルを Web API として公開しています。

### API の起動

```bash
lein run
```

サーバーが起動したら、ブラウザで以下にアクセスできます：

- **Swagger UI**: http://localhost:3000/api-docs
- **Swagger JSON**: http://localhost:3000/api/swagger.json

### エンドポイント

#### ヘルスチェック

```bash
curl http://localhost:3000/api/health
```

レスポンス：
```json
{"status":"ok"}
```

#### Iris 予測

```bash
curl -X POST http://localhost:3000/api/predict/iris \
  -H "Content-Type: application/json" \
  -d '{
    "sepal-length": 5.1,
    "sepal-width": 3.5,
    "petal-length": 1.4,
    "petal-width": 0.2
  }'
```

#### Boston 住宅価格予測

```bash
curl -X POST http://localhost:3000/api/predict/boston \
  -H "Content-Type: application/json" \
  -d '{
    "CRIME": "low",
    "ZN": 0,
    "INDUS": 8.14,
    "CHAS": 0,
    "NOX": 0.538,
    "RM": 5.95,
    "AGE": 82,
    "DIS": 3.99,
    "RAD": 4,
    "TAX": 307,
    "PTRATIO": 21,
    "B": 232.6,
    "LSTAT": 27.71
  }'
```

## 使用ライブラリ

- **Smile**: 機械学習ライブラリ
- **tech.ml.dataset**: データ操作
- **tablecloth**: データフレーム操作
- **Ring/Compojure**: Web フレームワーク
- **Cheshire**: JSON 処理

## License

Copyright © 2025 FIXME

This program and the accompanying materials are made available under the
terms of the Eclipse Public License 2.0 which is available at
https://www.eclipse.org/legal/epl-2.0.

This Source Code may also be made available under the following Secondary
Licenses when the conditions for such availability set forth in the Eclipse
Public License, v. 2.0 are satisfied: GNU General Public License as published by
the Free Software Foundation, either version 2 of the License, or (at your
option) any later version, with the GNU Classpath Exception which is available
at https://www.gnu.org/software/classpath/license.html.
