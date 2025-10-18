# データで学ぶ Python! TDD ではじめる機械学習プログラミング

テスト駆動開発（TDD）を実践しながら Python で機械学習を学ぶプロジェクトです。

## プロジェクト概要

このプロジェクトは、以下のチュートリアルに基づいて段階的に機械学習モデルを開発していきます：

### 実装する機械学習モデル

**分類問題**（離散的な値を予測）:
- Chapter 4: **Iris 分類** - アヤメの花を 3 種類に分類（多クラス分類の基礎）
- Chapter 6: **Survived 分類** - タイタニック号の乗客の生存を予測（二値分類の実践）

**回帰問題**（連続的な値を予測）:
- Chapter 5: **Cinema 予測** - 映画の興行収入を予測（線形回帰の基礎）
- Chapter 7: **Boston 予測** - ボストンの住宅価格を予測（特徴量エンジニアリングの実践）

**Web API 化**:
- Chapter 8: **FastAPI による API 化** - 4つのモデルを統合した Web API

## 開発環境

### 必要なツール

**開発の基盤**:
- **Python 3.10+**: プログラミング言語本体（型ヒント機能を活用）
- **uv**: 爆速パッケージマネージャー（従来の pip より 10-100倍速い！）

**品質管理ツール**:
- **Ruff**: コード品質チェック（コードをキレイに保つ）
- **mypy**: 型チェック（バグを事前に発見）
- **pytest**: テストフレームワーク（TDD の要）
- **tox**: タスクランナー（複数環境での品質チェックとタスク管理）

**機械学習ライブラリ**:
- **scikit-learn**: 機械学習の定番ライブラリ（モデル構築に使用）
- **pandas**: データ分析ライブラリ（データ操作の必需品）
- **FastAPI**: 高性能 Web API フレームワーク（最終章で API 化に使用）

### セットアップ手順

```bash
# プロジェクトディレクトリに移動
cd app/python/ml_tdd

# uv による依存関係のインストール
uv sync

# 開発用依存関係のインストール
uv sync --extra dev
```

### 品質チェックの実行

#### タスクランナー（推奨）

tox を使ってすべての品質チェックを一度に実行できます：

```bash
# すべての品質チェックとテストを実行（推奨）
uv run tox -e all

# 品質チェック系タスク
uv run tox -e test        # テストのみ
uv run tox -e lint        # リンターのみ
uv run tox -e type        # 型チェックのみ
uv run tox -e coverage    # カバレッジレポートのみ
uv run tox -e format      # フォーマットのみ

# 開発系タスク
uv run tox -e notebook    # Jupyter Notebook を起動
uv run tox -e notebook-lab # Jupyter Lab を起動
uv run tox -e train       # モデル訓練を実行
uv run tox -e predict     # 予測を実行
```

#### 個別コマンドの実行

```bash
# テスト実行
uv run pytest -v

# リンターのみ実行
uv run ruff check .

# 型チェックのみ実行
uv run mypy src test

# コードフォーマット
uv run ruff format .
```

## プロジェクト構造

```
ml_tdd/
├── src/                       # ソースコード
│   ├── __init__.py
│   └── ml/                    # 機械学習モデル本体
│       ├── __init__.py
│       ├── iris_classifier.py       # アヤメ分類モデル
│       ├── cinema_predictor.py      # 映画興行収入予測モデル
│       ├── survived_classifier.py   # 生存予測モデル
│       └── boston_predictor.py      # 住宅価格予測モデル
├── test/                      # テストコード
│   ├── __init__.py
│   └── test_basic.py          # 基本的な環境確認テスト
├── data/                      # データセット
│   ├── iris.csv
│   ├── cinema.csv
│   ├── Survived.csv
│   └── Boston.csv
├── model/                     # 訓練済みモデルの保存先
│   └── .gitkeep
├── pyproject.toml             # プロジェクト設定ファイル
├── tox.ini                    # タスクランナー設定ファイル
└── README.md                  # このファイル
```

## 開発フロー

本プロジェクトでは TDD（テスト駆動開発）のサイクルに従います：

1. **Red**: 失敗するテストを書く
2. **Green**: テストを通す最小限のコードを書く
3. **Refactor**: コードをリファクタリングする

### 品質基準

- **コードカバレッジ**: 80% 以上を目標
- **循環的複雑度**: 7 以下を維持
- **型ヒント**: 100% の使用率
- **Ruff チェック**: すべてのチェックに合格
- **mypy チェック**: エラー 0 件

## 学習の進め方

各章は以下の構成になっています：

1. **学習目標**: その章で何を学ぶかを明確化
2. **実装した機能**: 実際に作るコードの全体像
3. **TDD 実践例**: Red-Green-Refactor の実例
4. **主要な学習ポイント**: 深掘りした技術解説
5. **技術的成果**: その章での達成事項まとめ

最初の章から順番に進めることをおすすめしますが、気になる章から始めても OK です！

## 参考資料

- [チュートリアルドキュメント](../../../docs/reference/case-6/テスト駆動開発から始める機械学習入門.md)
- [scikit-learn 公式ドキュメント](https://scikit-learn.org/)
- [pandas 公式ドキュメント](https://pandas.pydata.org/)
- [FastAPI 公式ドキュメント](https://fastapi.tiangolo.com/)
- [uv パッケージマネージャー](https://github.com/astral-sh/uv)
- [Ruff 公式ドキュメント](https://docs.astral.sh/ruff/)
