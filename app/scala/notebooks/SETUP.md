# Jupyter Notebook セットアップガイド

## 概要

Scala の Jupyter Notebook を使用するには、Scala カーネル（Almond）のインストールが必要です。

## 前提条件

- Java 17 以上
- Jupyter Notebook または JupyterLab
- coursier（Scala のアプリケーションランチャー）

## セットアップ手順

### 1. Jupyter のインストール（未インストールの場合）

```bash
# Python と pip がインストール済みであることを確認
python --version
pip --version

# Jupyter Notebook をインストール
pip install notebook

# または JupyterLab をインストール
pip install jupyterlab
```

### 2. coursier のインストール

#### Windows (PowerShell)

```powershell
# Scoop を使用（推奨）
scoop install coursier

# または直接ダウンロード
Invoke-WebRequest -Uri "https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-win32.exe" -OutFile "$env:USERPROFILE\cs.exe"
```

#### Linux/Mac

```bash
# Homebrew を使用（Mac）
brew install coursier/formulas/coursier

# または curl を使用
curl -fL "https://github.com/coursier/launchers/raw/master/cs-x86_64-pc-linux.gz" | gzip -d > cs
chmod +x cs
sudo mv cs /usr/local/bin/
```

### 3. Almond カーネルのインストール

```bash
# Scala 2.13 用の Almond をインストール
cs launch almond:0.13.14 --scala 2.13.12 -- --install

# インストールされたカーネルを確認
jupyter kernelspec list
```

**出力例:**
```
Available kernels:
  scala213    /Users/username/Library/Jupyter/kernels/scala213
  python3     /usr/local/share/jupyter/kernels/python3
```

### 4. Spark 依存関係の追加

**重要:** Almond カーネルでは、Spark の依存関係が自動的にロードされません。Notebook を使用する際は、**最初のセル**で必ず ivy インポートを実行してください。

`iris_exploration.ipynb` には既に最初のセルに以下が含まれています：

```scala
// Spark 依存関係の読み込み
import $ivy.`org.apache.spark::spark-sql:3.5.0`
import $ivy.`org.apache.spark::spark-mllib:3.5.0`

println("Spark 依存関係が正常にロードされました")
```

このセルを実行すると、Spark のライブラリがダウンロードされ、以降のセルで Spark API が使用可能になります。

### 5. Notebook の起動

```bash
# プロジェクトルートに移動
cd C:\Users\PC202411-1\IdeaProjects\case-study-game-dev\app\scala

# Jupyter Notebook を起動
jupyter notebook

# または JupyterLab を起動
jupyter lab
```

ブラウザが開いたら、`notebooks/iris_exploration.ipynb` を開きます。

## トラブルシューティング

### カーネルが見つからない

```bash
# カーネルを再インストール
cs launch almond:0.13.14 --scala 2.13.12 -- --install --force
```

### Spark の依存関係が解決できない

Notebook の最初のセルで明示的にリポジトリを追加：

```scala
interp.repositories() ++= Seq(
  coursierapi.MavenRepository.of("https://repo1.maven.org/maven2")
)
```

### Windows で winutils エラーが発生する

SparkSession 作成時に以下を設定（Notebook 内）：

```scala
val spark = SparkSession.builder()
  .appName("IrisExploration")
  .master("local[*]")
  .config("spark.driver.bindAddress", "127.0.0.1")
  .config("spark.sql.warehouse.dir", "file:///C:/tmp/spark-warehouse")
  .getOrCreate()
```

## 既存の Notebook の使用

既に作成されている `notebooks/iris_exploration.ipynb` を使用できます：

1. Jupyter Notebook/Lab を起動
2. `notebooks/iris_exploration.ipynb` を開く
3. カーネルとして "Scala 2.13" または "Scala" を選択
4. **最初のセル（Spark 依存関係のロード）を必ず実行**
5. 以降のセルを順番に実行

**注意:** 最初のセルの実行時に Spark ライブラリのダウンロードが行われるため、初回は数分かかる場合があります。

## 代替手段

### Apache Toree の使用

Spark に特化したカーネルを使用する場合：

```bash
# Apache Toree のインストール
pip install toree

# Spark のパスを指定してカーネルをインストール
jupyter toree install --spark_home=/path/to/spark --kernel_name=apache_toree_scala
```

**注意:** Toree は Spark 2.x を想定しているため、Spark 3.x では互換性の問題が発生する可能性があります。

## 参考リンク

- [Almond ドキュメント](https://almond.sh/)
- [Coursier](https://get-coursier.io/)
- [Jupyter Notebook](https://jupyter.org/)
