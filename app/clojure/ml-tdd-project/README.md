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
├── resources/                     # リソースファイル
│   └── data/                      # データセット
│       ├── iris.csv
│       ├── cinema.csv
│       ├── survived.csv
│       └── boston.csv
├── model/                         # 訓練済みモデル
├── notebooks/                     # Jupyter Notebook
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
