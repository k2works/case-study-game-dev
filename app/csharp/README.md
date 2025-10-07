# PuyoPuyo TDD - Unity C# 版

テスト駆動開発（TDD）で実装するぷよぷよゲーム - Unity C# 版

## クイックスタート

### 1. 環境構築

```bash
# Cake のインストール
dotnet tool restore
```

### 2. ゲームシーンのセットアップ（自動）

```bash
dotnet cake --target=Setup
```

このコマンドで以下が自動的に作成されます：
- `Assets/Scenes/GameScene.unity`
- Canvas、BoardView、PairView、GameController の配置
- すべてのコンポーネントの参照設定

### 3. Unity Editor で実行

Unity Hub からプロジェクトを開いて、`Assets/Scenes/GameScene.unity` を開き、Play ボタン（▶）を押します。

## 操作方法

- **←→**: 左右移動
- **Z**: 左回転
- **X**: 右回転
- **↓**: 高速落下

## 前提条件

- Unity Hub
- Unity Editor 2022.3.0f1 LTS
- .NET SDK 6.0 以上

## 開発コマンド

### テスト実行

```bash
dotnet cake --target=Test
```

全ての単体テストを実行します（現在 27 テスト）。

### コード品質チェック

```bash
dotnet cake --target=Check
```

フォーマットとテストを実行します。

### シーンの再生成

```bash
dotnet cake --target=Setup
```

ゲームシーンを再生成します。既存のシーンがある場合は上書きされます。

### その他のコマンド

```bash
# ビルド
dotnet cake --target=Build

# コードフォーマット
dotnet cake --target=Format

# ファイル監視モード
dotnet cake --target=Watch

# CI環境での完全ビルド
dotnet cake --target=CI
```

## プロジェクト構造

```
app/csharp/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/              # ゲームロジック（TDD で実装）
│   │   │   ├── Board.cs       # 6x12 のゲーム盤
│   │   │   ├── Pair.cs        # ぷよペア（回転・移動）
│   │   │   └── PuyoColor.cs   # ぷよの色定義
│   │   ├── View/              # UI・ビジュアル
│   │   │   ├── BoardView.cs   # Board の視覚化
│   │   │   ├── PairView.cs    # Pair の視覚化
│   │   │   └── GameController.cs  # ゲームループ・入力
│   │   └── Editor/            # エディタ拡張
│   │       └── SceneSetup.cs  # シーン自動生成
│   ├── Tests/
│   │   └── EditMode/
│   │       ├── BoardTest.cs   # Board のテスト（6テスト）
│   │       └── PairTest.cs    # Pair のテスト（20テスト）
│   └── Scenes/
│       └── GameScene.unity    # メインゲームシーン（自動生成）
├── build.cake                 # Cake ビルド自動化スクリプト
├── .gitignore
└── README.md
```

## イテレーション

### イテレーション0: 環境構築 ✅

- [x] プロジェクト構造の作成
- [x] Git によるバージョン管理
- [x] Unity Test Framework のセットアップ
- [x] Cake によるビルド自動化

### イテレーション1: Board の実装 ✅

- [x] Board クラスの作成（6列×12行）
- [x] ぷよの配置・取得
- [x] 範囲チェック
- [x] 6 テストが成功

### イテレーション2: Pair の実装 ✅

- [x] ぷよペアの作成
- [x] 回転機能（左右90度）
- [x] 衝突判定
- [x] 10 テストが成功

### イテレーション3: 移動と回転 ✅

- [x] 左右下移動
- [x] 壁キック（回転時の自動調整）
- [x] 移動可能判定
- [x] 20 テストが成功（累計27テスト）

### デバッグUI ✅

- [x] グリッド表示
- [x] ぷよペアの視覚化
- [x] キーボード入力
- [x] 自動落下
- [x] シーン自動生成

## 技術スタック

- **Unity**: 2022.3.0f1 LTS
- **C#**: .NET Standard 2.1
- **テストフレームワーク**: NUnit (Unity Test Framework)
- **ビルドツール**: Cake (C# Make) 5.1.0
- **開発手法**: Test-Driven Development (TDD)

## テスト

```bash
# テスト実行
dotnet cake --target=Test
```

現在のテストカバレッジ：
- BoardTest: 6 テスト
- PairTest: 20 テスト
- 合計: 27 テスト（全て成功✅）

## 参考資料

- [ぷよぷよから始めるテスト駆動開発入門_CSharp版.md](../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_CSharp版.md)
