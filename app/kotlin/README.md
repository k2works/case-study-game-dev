# テスト駆動開発から始める機械学習入門 - Kotlin版

テスト駆動開発（TDD）を実践しながら Kotlin で機械学習を学ぶプロジェクトです。

## 🎯 プロジェクト概要

このプロジェクトでは、以下の4つの実践的な機械学習モデルを TDD で実装します：

- **Iris 分類**: アヤメの花を3種類に分類（多クラス分類の基礎）
- **Cinema 予測**: 映画の興行収入を予測（線形回帰の基礎）
- **Survived 分類**: タイタニック号の乗客の生存を予測（二値分類の実践）
- **Boston 予測**: ボストンの住宅価格を予測（特徴量エンジニアリングの実践）

最後には、これら4つのモデルを Ktor で Web API 化します。

## 🛠️ 技術スタック

- **言語**: Kotlin 1.9.21
- **ビルドツール**: Gradle 8.0+
- **機械学習**: Smile 3.0.2
- **データ処理**: Krangl 0.18.4
- **Web API**: Ktor 2.3.7
- **テスト**: JUnit 5 + Kotest 5.8.0
- **品質管理**: Detekt 1.23.4, Kover 0.7.5

## 📦 セットアップ

### 前提条件

- JDK 17 以上
- Gradle 8.0 以上

### インストール

```bash
# プロジェクトをクローン
git clone <repository-url>
cd app/kotlin

# 依存関係を解決
./gradlew build
```

## 🚀 使い方

### テストの実行

```bash
# すべてのテストを実行
./gradlew test

# 特定のテストクラスを実行
./gradlew test --tests BasicTest

# テスト結果の表示
./gradlew test --info
```

### 品質チェック

```bash
# 静的解析（Detekt）
./gradlew detekt

# カバレッジレポート生成
./gradlew koverHtmlReport

# カバレッジ検証（最低80%）
./gradlew koverVerify

# すべての品質チェックを実行
./gradlew clean test detekt koverVerify
```

### アプリケーションの実行

```bash
# アプリケーションを実行
./gradlew run
```

## 📁 プロジェクト構造

```
ml-tdd-kotlin/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── ml/              # 機械学習モデル本体
│   │   │       ├── DataLoader.kt
│   │   │       ├── IrisClassifier.kt
│   │   │       ├── CinemaPredictor.kt
│   │   │       ├── SurvivedClassifier.kt
│   │   │       └── BostonPredictor.kt
│   │   └── resources/
│   │       └── data/            # データセット
│   │           └── iris.csv
│   └── test/
│       └── kotlin/
│           └── ml/              # テストコード
│               ├── BasicTest.kt
│               ├── SmileBasicsTest.kt
│               └── DataLoaderTest.kt
├── model/                       # 訓練済みモデルの保存先
├── script/                      # モデル訓練・評価スクリプト
├── notebook/                    # Kotlin Notebook
├── build.gradle.kts
├── settings.gradle.kts
├── detekt.yml
└── README.md
```

## 📚 学習の進め方

1. **2章**: 環境セットアップとTDD体験
2. **4章**: Iris 分類モデル（分類問題の基礎）
3. **5章**: Cinema 興行収入予測（回帰問題の基礎）
4. **6章**: Survived 生存予測（実践的な分類問題）
5. **7章**: Boston 住宅価格予測（特徴量エンジニアリング）
6. **8章**: Web API 化（Ktor による REST API 実装）

## 🎓 学習目標

- **TDD の実践**: Red-Green-Refactor サイクルを体験
- **機械学習の基礎**: 分類・回帰問題の理解と実装
- **データ前処理**: 欠損値処理、外れ値除外、特徴量エンジニアリング
- **モデル評価**: 正解率、R²、MAE、RMSE の理解
- **Web API 開発**: Ktor による機械学習 API の構築

## 📊 品質指標

- **テストカバレッジ**: 80% 以上
- **Detekt チェック**: すべて通過
- **コーディング規約**: Kotlin 標準規約に準拠

## 📖 参考資料

- [Kotlin 公式ドキュメント](https://kotlinlang.org/docs/home.html)
- [Smile 機械学習ライブラリ](https://haifengl.github.io/smile/)
- [Krangl データ処理ライブラリ](https://github.com/holgerbrandl/krangl)
- [Ktor Web フレームワーク](https://ktor.io/)

## 📝 ライセンス

MIT License
