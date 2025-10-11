# ぷよぷよ TDD - リリースノート

## バージョン 1.0.0

### 概要

Test Driven Development (TDD) で作成したぷよぷよゲームの最初のリリースです。

### 実装機能

#### ゲーム機能
- ✅ ステージの実装 (6×13 マス)
- ✅ ぷよの配置と表示
- ✅ プレイヤー操作 (左右移動、回転、落下)
- ✅ ぷよの落下処理
- ✅ 4つ以上つながったぷよの消去
- ✅ 連鎖処理とスコア計算
- ✅ 全消しボーナス (3600 点)
- ✅ ゲームオーバー判定
- ✅ リセット機能

#### 操作方法
- **←/→ キー**: ぷよを左右に移動
- **↑ キー / Z キー**: ぷよを右回転
- **X キー**: ぷよを左回転
- **↓ キー**: ぷよを高速落下
- **リセットボタン**: ゲームをリセット

#### スコアシステム
- 基本スコア: `消去数 × 10 × 連鎖ボーナス`
- 連鎖ボーナス:
  - 1連鎖: ×1
  - 2連鎖: ×8
  - 3連鎖: ×16
  - 4連鎖: ×32
  - 5連鎖: ×64
  - 6連鎖: ×96
  - 7連鎖: ×128
  - 8連鎖以上: ×160
- 全消しボーナス: +3600 点

### 技術仕様

#### プラットフォーム
- Kotlin Multiplatform
- Compose Desktop
- JVM 21

#### テストカバレッジ
- 総合カバレッジ: **78%**
- テスト数: **58 テスト**
- UI テスト: **5 テスト**

#### 品質管理
- ✅ 単体テスト: JUnit
- ✅ UI テスト: Compose Test
- ✅ コードスタイル: ktlint
- ✅ 静的解析: Detekt
- ✅ カバレッジ測定: JaCoCo

### インストール方法

#### 必要環境
- Java Runtime Environment (JRE) 21 以上
- ダウンロード: https://adoptium.net/

#### 実行方法

**推奨: 起動スクリプトを使用**

1. リリースファイルをダウンロード・解凍
2. 起動スクリプトをダブルクリック:
   - **Windows**: `puyo-puyo-tdd.bat`
   - **Linux/macOS**: `puyo-puyo-tdd.sh`

**代替: コマンドラインから実行**

```bash
java -jar puyo-puyo-tdd-windows-x64-1.0.0.jar
```

**注意事項:**
- JAR ファイルを直接ダブルクリックすると、環境によっては起動しない場合があります
- その場合は必ず起動スクリプトを使用してください
- Java 21 がインストールされていない場合、起動スクリプトがエラーメッセージを表示します

### ビルド方法

開発者向け: ソースコードから JAR をビルドする場合

```bash
# プロジェクトのルートディレクトリで
cd app/kotlin/puyo-puyo-tdd

# 実行可能 JAR をビルド
./gradlew packageUberJarForCurrentOS

# 生成された JAR は以下の場所に作成されます
# build/compose/jars/puyo-puyo-tdd-windows-x64-1.0.0.jar
```

### テストの実行

```bash
# すべてのテストを実行
./gradlew jvmTest

# カバレッジレポートを生成
./gradlew jacocoTestReport

# コードスタイルチェック
./gradlew ktlintCheck

# 静的解析
./gradlew detekt

# すべてのチェックを実行
./gradlew checkAll
```

### リリースパッケージ構成

リリースパッケージには以下のファイルが含まれています:

```
puyo-puyo-tdd-release/
├── puyo-puyo-tdd-windows-x64-1.0.0.jar  (31MB)
├── puyo-puyo-tdd.bat                     (Windows 起動スクリプト)
├── puyo-puyo-tdd.sh                      (Linux/macOS 起動スクリプト)
└── README.txt                            (クイックスタートガイド)
```

### 配布方法

リリースパッケージを配布する場合:

1. `build/compose/jars/` ディレクトリの以下のファイルを圧縮:
   - `puyo-puyo-tdd-windows-x64-1.0.0.jar`
   - `puyo-puyo-tdd.bat`
   - `puyo-puyo-tdd.sh`
   - `README.txt`

2. ZIP ファイルとして配布:
   - 推奨ファイル名: `puyo-puyo-tdd-v1.0.0.zip`

### 既知の問題

- JAR ファイルを直接ダブルクリックすると、環境によっては起動しない場合があります
  - **対処法**: 起動スクリプト（.bat または .sh）を使用してください

### 今後の予定

- [ ] ネクストぷよの表示
- [ ] サウンドエフェクト
- [ ] ハイスコアの保存
- [ ] 難易度設定
- [ ] おじゃまぷよの実装

### ライセンス

このプロジェクトは学習目的で作成されたものです。

### 開発者

Test Driven Development によって開発されました。

---

## リリース履歴

### v1.0.0 (2025-10-11)
- 初回リリース
- 基本的なぷよぷよゲームの実装
- TDD によるテストカバレッジ 78% 達成
