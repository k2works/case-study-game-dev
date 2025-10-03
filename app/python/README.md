# ぷよぷよ TDD (Python)

## 概要

Pyxel を使って実装したシンプルな「ぷよぷよ」風ゲームの Python 実装です。テスト駆動開発（TDD）をベースに、ゲームの主要コンポーネントと状態遷移を小さな単位で検証できるようにしています。

### 目的
- TDD の題材として、小さなゲームを通じて設計とリファクタリングの反復を学ぶ
- Python と Pyxel による 2D ゲーム開発の最小構成を知る

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Python       | 3.12       | `.python-version` に準拠 |
| uv           | 任意       | 依存関係管理（推奨） |
| tox          | 任意       | 複数タスク実行の統合 |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Qick Start

uv を使う場合（推奨）:

```bash
# 依存関係の同期（開発用も含む）
uv sync --all-extras --dev

# ゲームを起動
uv run python main.py
```

pip/venv を使う場合:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -e .[dev]
python main.py
```

### 構築

プロジェクトの依存関係は `pyproject.toml` に定義されています。

```bash
# uv を使う
uv sync --all-extras --dev

# もしくは venv + pip を使う
python -m venv .venv
source .venv/bin/activate
pip install -e .[dev]
```

**[⬆ back to top](#構成)**

### 配置

ローカルでの実行を前提としています。Pyxel はウィンドウを開いて動作するため、GUI が利用可能な環境で起動してください。

**[⬆ back to top](#構成)**

### 運用

ゲームの起動:

```bash
python main.py
```

ウィンドウサイズやタイトルは `app/python/main.py` 内で `pyxel.init(...)` にて設定しています。

- タイトル画面でスペースキーを押すとゲーム開始
- ゲームオーバー画面でスペースキーを押すと再初期化

**[⬆ back to top](#構成)**

### 開発

テスト:

```bash
# 直接 pytest を実行
pytest -q

# カバレッジ付き
pytest --cov=lib --cov-report=term-missing

# tox 経由
uv run tox -e test
```

静的解析・整形・型チェック:

```bash
# Lint
ruff check .

# フォーマット
ruff format .

# 型チェック
mypy lib test

# tox でまとめて
uv run tox -e lint
uv run tox -e format
uv run tox -e type
uv run tox -e coverage
```

プロジェクト構成（抜粋）:

- `main.py`: エントリーポイント（Pyxel 初期化とゲームループ）
- `lib/`: ゲームロジック（Config, Game, Player, Stage, PuyoImage, Score など）
- `test/`: ユニットテスト（pytest）

**[⬆ back to top](#構成)**

## 参照

- Pyxel: https://github.com/kitao/pyxel
- テストおよび TDD の参考: `docs/reference/` ディレクトリ
