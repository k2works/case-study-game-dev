# TypeScript Machine Learning Project

TypeScript で機械学習を実装するプロジェクトです。TDD（テスト駆動開発）アプローチで開発しています。

## 📋 目次

- [プロジェクト構成](#プロジェクト構成)
- [セットアップ](#セットアップ)
- [使い方](#使い方)
- [開発](#開発)

## 🗂️ プロジェクト構成

```
app/typescript/
├── src/                      # ソースコード
│   ├── models/               # 機械学習モデル
│   ├── types/                # TypeScript 型定義
│   └── utils/                # ユーティリティ関数
├── test/                     # テストコード
│   └── models/               # モデルのテスト
├── scripts/                  # 訓練・予測スクリプト
├── notebooks/                # Jupyter Notebook
├── data/                     # データセット（CSV ファイル）
├── models/                   # 訓練済みモデル（JSON ファイル）
├── vite.config.ts            # Vite 設定
├── tsconfig.json             # TypeScript 設定
├── eslint.config.js          # ESLint 設定
├── .prettierrc               # Prettier 設定
└── package.json              # パッケージ管理
```

## 🚀 セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Jupyter Lab のセットアップ（オプション）

Jupyter Notebook で TypeScript を実行したい場合は、以下の手順でセットアップしてください。

#### 前提条件

- Python 3.8 以上がインストールされていること
- Jupyter Lab がインストールされていること

```bash
# Python のバージョン確認
python --version

# Jupyter Lab のインストール（未インストールの場合）
pip install jupyterlab
```

#### tslab（TypeScript カーネル）のセットアップ

```bash
# tslab をグローバルにインストール
npm install -g tslab

# Jupyter Lab に tslab カーネルを登録
tslab install

# カーネルが登録されたか確認
jupyter kernelspec list
# → tslab と jslab が表示されれば成功
```

#### Jupyter Lab の起動

```bash
# プロジェクトルートで起動
cd app/typescript
jupyter lab
```

ブラウザが開き、Jupyter Lab の画面が表示されます。

**ノートブックの作成**:

1. 「File」→「New」→「Notebook」を選択
2. カーネル選択で「TypeScript」を選択
3. ノートブックが作成されます

**既存のノートブックを開く**:

- `notebooks/iris-exploration.ipynb` を開いて実行できます

## 📚 使い方

### テストの実行

```bash
# テストを実行（watch モード）
npm test

# テストを 1 回だけ実行
npm run test:run

# カバレッジ付きでテストを実行
npm run test:coverage
```

### コード品質チェック

```bash
# すべての品質チェックを実行（lint + format + type-check + test）
npm run quality

# ESLint でコードをチェック
npm run lint

# ESLint でコードを自動修正
npm run lint:fix

# Prettier でフォーマットをチェック
npm run format:check

# Prettier でコードをフォーマット
npm run format

# TypeScript の型チェック
npm run type-check
```

### モデルの訓練と予測

#### Iris 分類モデル

```bash
# モデルを訓練
npm run train:iris

# 訓練済みモデルで予測
npm run predict:iris
```

訓練済みモデルは `models/iris_classifier.json` に保存されます。

## 🧪 開発

### TDD サイクル

このプロジェクトは TDD（テスト駆動開発）で開発しています。

1. **🔴 Red**: 失敗するテストを書く
2. **🟢 Green**: テストを通す最小限の実装
3. **🔧 Refactor**: テストを保ちながらコードを改善

### 新しいモデルの追加

1. `test/models/` にテストファイルを作成
2. `src/models/` にモデルクラスを実装
3. `scripts/` に訓練・予測スクリプトを作成
4. `notebooks/` に探索用ノートブックを作成（オプション）

### コーディング規約

- **TypeScript の strict モード**: 有効
- **ESLint**: コードの静的解析
- **Prettier**: コードフォーマット
- **型安全性**: any の使用を最小限に

## 📊 実装済みモデル

### 1. Iris 分類モデル

- **データセット**: Fisher の Iris データセット（150 サンプル、3 クラス）
- **アルゴリズム**: 決定木（Decision Tree）
- **特徴量**: がく片の長さ・幅、花弁の長さ・幅
- **精度**: 90%以上

**ファイル**:

- モデル: `src/models/IrisClassifier.ts`
- テスト: `test/models/IrisClassifier.test.ts`
- 訓練スクリプト: `scripts/train-iris.ts`
- 予測スクリプト: `scripts/predict-iris.ts`
- ノートブック: `notebooks/iris-exploration.ipynb`

## 🛠️ 技術スタック

### 主要ライブラリ

- **TypeScript**: 型安全な JavaScript
- **Vite**: 高速なビルドツール
- **Vitest**: テストフレームワーク
- **data-forge**: データ処理ライブラリ（pandas 風）
- **ml-cart**: 決定木アルゴリズム
- **ml-regression**: 回帰アルゴリズム

### 開発ツール

- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマッター
- **tsx**: TypeScript スクリプトランナー
- **tslab**: Jupyter Notebook の TypeScript カーネル

## 📖 参考資料

- [TypeScript 公式ドキュメント](https://www.typescriptlang.org/)
- [Vitest ドキュメント](https://vitest.dev/)
- [data-forge ドキュメント](https://www.data-forge-js.com/)
- [Jupyter Lab ドキュメント](https://jupyterlab.readthedocs.io/)
- [tslab リポジトリ](https://github.com/yunabe/tslab)

## 📝 ライセンス

ISC
