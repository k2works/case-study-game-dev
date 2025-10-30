# Jupyter Notebooks

このディレクトリには、データ探索とモデル実験用の Jupyter Notebook が含まれています。

## 📋 Notebook 一覧

### iris-exploration.ipynb

Iris データセットの探索と分類モデルの実験用ノートブックです。

**内容**:

1. データの読み込みと確認
2. 統計情報の計算
3. データのフィルタリング
4. 分類モデルの訓練
5. モデルの評価と予測

## 🚀 Jupyter Lab の起動

```bash
# プロジェクトルートから起動
cd app/typescript
jupyter lab
```

ブラウザが開き、Jupyter Lab の画面が表示されます。

## 📝 ノートブックの使い方

### 新しいノートブックを作成

1. Jupyter Lab で「File」→「New」→「Notebook」を選択
2. カーネルで「TypeScript」を選択
3. ノートブックが作成されます

### 既存のノートブックを開く

1. ファイルブラウザから `.ipynb` ファイルをクリック
2. セルを上から順に実行（Shift + Enter）

### ショートカットキー

- `Shift + Enter`: セルを実行して次のセルに移動
- `Ctrl + Enter`: セルを実行（移動しない）
- `A`: 上に新しいセルを追加
- `B`: 下に新しいセルを追加
- `M`: Markdown セルに変換
- `Y`: Code セルに変換
- `DD`: セルを削除

## 💡 Tips

### ライブラリのインポート

各ノートブックの最初のセルで必要なライブラリをインポートします：

```typescript
import { DataFrame } from 'data-forge';
import * as fs from 'fs';
import { IrisClassifier } from '../src/models/IrisClassifier';
```

### データの読み込み

相対パスでデータファイルを読み込みます：

```typescript
const csvContent = fs.readFileSync('../data/iris.csv', 'utf-8');
```

### 結果の表示

`console.log()` や `console.table()` で結果を表示できます：

```typescript
console.log('データ行数:', df.count());
console.table(df.head(5).toArray());
```

## 🔧 トラブルシューティング

### カーネルが表示されない

tslab カーネルが登録されていない可能性があります：

```bash
# tslab をインストール
npm install -g tslab

# カーネルを登録
tslab install

# 登録されているか確認
jupyter kernelspec list
```

### モジュールが見つからない

プロジェクトルートで依存関係をインストールしてください：

```bash
cd app/typescript
npm install
```

### パスが解決されない

ノートブックは `notebooks/` ディレクトリから実行されるため、相対パスは `../` を使います：

- データ: `../data/iris.csv`
- モデル: `../src/models/IrisClassifier`
- 訓練済みモデル: `../models/iris_classifier.json`

### IDE で TypeScript エラーが表示される

`notebooks/tsconfig.json` が正しく設定されているか確認してください。このファイルは親ディレクトリの `tsconfig.json` を継承し、notebooks 専用の設定を追加しています：

```json
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "..",
    "paths": {
      "@/*": ["../src/*"]
    }
  },
  "include": ["**/*.ts", "../src/**/*.ts"]
}
```

この設定により、notebooks 内から `../src/models/IrisClassifier` のようにインポートできます。

## 📚 参考資料

- [Jupyter Lab ドキュメント](https://jupyterlab.readthedocs.io/)
- [tslab リポジトリ](https://github.com/yunabe/tslab)
- [data-forge ドキュメント](https://www.data-forge-js.com/)
