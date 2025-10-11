# ぷよぷよ TDD

## 概要

Test Driven Development (TDD) で作成したぷよぷよゲームです。Kotlin Multiplatform と Compose Desktop を使用して実装されています。

### 目的

- テスト駆動開発 (TDD) の実践的な学習
- Kotlin Multiplatform と Compose Desktop の習得
- よいソフトウェアの開発規律の実践

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| Java         | 21         | JDK 21 以上が必要 |
| Kotlin       | 2.1.0      | Multiplatform 対応 |
| Gradle       | 8.5        | ビルドツール |

## 構成

- [Quick Start](#quick-start)
- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)
- [テスト](#テスト)

## 詳細

### Quick Start

**ゲームをプレイする:**

```bash
# リリース版を実行
cd build/compose/jars
./puyo-puyo-tdd.bat  # Windows
./puyo-puyo-tdd.sh   # Linux/macOS
```

**開発環境で実行:**

```bash
# Gradle タスクで実行
./gradlew run
```

**[⬆ back to top](#構成)**

### 構築

#### 環境構築

1. **Java のインストール**
   ```bash
   # Java バージョンの確認
   java -version

   # Java 21 以上が必要
   # ダウンロード: https://adoptium.net/
   ```

2. **プロジェクトのクローン**
   ```bash
   git clone <repository-url>
   cd case-study-game-dev/app/kotlin/puyo-puyo-tdd
   ```

3. **依存関係のインストール**
   ```bash
   # Gradle Wrapper で自動的に依存関係をダウンロード
   ./gradlew build
   ```

**[⬆ back to top](#構成)**

### 配置

#### 実行可能 JAR のビルド

```bash
# UberJar のビルド (すべての依存関係を含む)
./gradlew packageUberJarForCurrentOS

# 生成された JAR の場所
# build/compose/jars/puyo-puyo-tdd-windows-x64-1.0.0.jar
```

#### プラットフォーム別パッケージのビルド

```bash
# Windows インストーラー (.msi)
./gradlew packageMsi

# macOS イメージ (.dmg)
./gradlew packageDmg

# Linux パッケージ (.deb)
./gradlew packageDeb
```

#### リリースパッケージの作成

```bash
# 完全なリリースパッケージを作成（推奨）
./gradlew release

# または個別にタスクを実行
./gradlew createReleasePackage

# 生成されたパッケージ
# build/release/puyo-puyo-tdd-v1.0.1.zip
```

**パッケージ内容:**
- `puyo-puyo-tdd-windows-x64-1.0.1.jar` - 実行可能 JAR (バージョン非依存の起動スクリプト対応)
- `puyo-puyo-tdd.bat` - Windows 起動スクリプト
- `puyo-puyo-tdd.sh` - Linux/macOS 起動スクリプト
- `README.txt` - クイックスタートガイド
- `README.md` - プロジェクトドキュメント
- `RELEASE.md` - リリースノート

**[⬆ back to top](#構成)**

### 運用

#### ゲームの起動

**推奨方法（起動スクリプト）:**

```bash
# Windows
puyo-puyo-tdd.bat

# Linux/macOS
./puyo-puyo-tdd.sh
```

**代替方法（コマンドライン）:**

```bash
java -jar puyo-puyo-tdd-windows-x64-1.0.0.jar
```

#### 操作方法

| キー | 動作 |
| :--- | :--- |
| ← / → | ぷよを左右に移動 |
| ↑ / Z | ぷよを右回転 |
| X | ぷよを左回転 |
| ↓ | ぷよを高速落下 |
| リセットボタン | ゲームをリセット |

#### ゲームルール

- 4つ以上つながったぷよを消してスコアを獲得
- 連鎖すると高得点（最大 8連鎖以上で ×160 倍）
- 全消しで +3600 点のボーナス
- 新しいぷよが配置できなくなるとゲームオーバー

**[⬆ back to top](#構成)**

### 開発

#### 開発環境でのアプリケーション実行

```bash
# Compose Desktop アプリケーションを起動
./gradlew run
```

#### コードフォーマット

```bash
# ktlint でフォーマットチェック
./gradlew ktlintCheck

# 自動フォーマット
./gradlew ktlintFormat
```

#### 静的解析

```bash
# Detekt で静的解析
./gradlew detekt

# コード品質チェック（ktlint + detekt）
./gradlew qualityCheck
```

#### カスタムタスク

```bash
# すべてのチェックを実行（テスト + 品質チェック）
./gradlew checkAll

# 自動修正可能な問題をすべて修正
./gradlew fixAll
```

**[⬆ back to top](#構成)**

### テスト

#### テストの実行

```bash
# すべてのテストを実行
./gradlew jvmTest

# 特定のテストクラスを実行
./gradlew jvmTest --tests GameAppTest
./gradlew jvmTest --tests StageTest
```

#### テストカバレッジ

```bash
# カバレッジレポートを生成
./gradlew jacocoTestReport

# レポートの確認
# build/reports/jacoco/jacocoTestReport/html/index.html
```

#### テスト構成

| テストスイート | テスト数 | 内容 |
| :------------ | -------: | :--- |
| ConfigTest    | 3        | 設定クラスのテスト |
| GameTest      | 5        | ゲームクラスのテスト |
| StageTest     | 13       | ステージ機能のテスト |
| PlayerTest    | 25       | プレイヤー操作のテスト |
| ScoreTest     | 7        | スコア計算のテスト |
| GameAppTest   | 5        | UI コンポーネントのテスト |
| **合計**      | **58**   | - |

**カバレッジ:** 78% (2,628 / 3,351 命令)

**[⬆ back to top](#構成)**

## プロジェクト構造

```
puyo-puyo-tdd/
├── src/
│   ├── commonMain/kotlin/      # 共通コード
│   │   ├── Config.kt           # ゲーム設定
│   │   ├── Game.kt             # ゲームロジック
│   │   ├── GameApp.kt          # UI コンポーネント
│   │   ├── GameStage.kt        # ステージ描画
│   │   ├── Player.kt           # プレイヤー操作
│   │   ├── Score.kt            # スコア計算
│   │   └── Stage.kt            # ステージロジック
│   ├── commonTest/kotlin/      # 共通テスト
│   │   ├── ConfigTest.kt
│   │   ├── GameTest.kt
│   │   ├── PlayerTest.kt
│   │   ├── ScoreTest.kt
│   │   └── StageTest.kt
│   ├── jvmMain/kotlin/         # JVM 固有コード
│   │   └── Main.kt             # エントリーポイント
│   └── jvmTest/kotlin/         # JVM テスト
│       └── GameAppTest.kt      # UI テスト
├── build.gradle.kts            # ビルド設定
├── RELEASE.md                  # リリースノート
└── README.md                   # このファイル
```

## 技術スタック

### 言語・フレームワーク
- **Kotlin**: 2.1.0 (Multiplatform)
- **Compose Multiplatform**: 1.7.1
- **Compose Desktop**: デスクトップ UI

### ビルド・依存関係管理
- **Gradle**: 8.5
- **Java Toolchain**: 21

### テスト
- **JUnit**: 単体テスト
- **Compose Test**: UI テスト
- **JaCoCo**: カバレッジ測定

### 品質管理
- **ktlint**: コードフォーマット
- **Detekt**: 静的解析

## 開発手法

### TDD サイクル

このプロジェクトは Test Driven Development (TDD) で開発されています。

```
Red (失敗するテストを書く)
  ↓
Green (テストを通す最小限の実装)
  ↓
Refactor (コードを改善)
  ↓
繰り返し
```

### 品質基準

- テストカバレッジ: 70% 以上
- すべてのテストが合格
- ktlint 違反なし
- Detekt 警告なし

## 参照

### ドキュメント
- [RELEASE.md](RELEASE.md) - リリースノート
- [CLAUDE.md](../../../CLAUDE.md) - AI Agent 実行ガイドライン
- [よいソフトウェアとは](../../../docs/reference/よいソフトウェアとは.md) - 開発思想

### 技術リファレンス
- [Kotlin Multiplatform](https://kotlinlang.org/docs/multiplatform.html)
- [Compose Multiplatform](https://www.jetbrains.com/lp/compose-multiplatform/)
- [Test Driven Development](https://www.amazon.co.jp/dp/4274217884)

### 関連ドキュメント
- [ぷよぷよから始めるテスト駆動開発入門 (Kotlin KMP 編)](../../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_Kotlin_KMP.md)
