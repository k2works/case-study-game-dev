# PuyoPuyo TDD - Unity C# 版

テスト駆動開発（TDD）で実装するぷよぷよゲーム - Unity C# 版

## 前提条件

- Unity Hub
- Unity Editor 2022.3 LTS 以上
- .NET SDK 6.0 以上
- Git
- Git Bash（Windows の場合）

## セットアップ

### 1. Unity プロジェクトの作成

1. Unity Hub を開く
2. プロジェクトを開く → このディレクトリを選択
3. Unity Editor 2022.3 LTS を使用してプロジェクトを開く

### 2. Unity のパスを設定

`unity-config.sh` を編集して、お使いの環境の Unity のパスを設定してください：

```bash
# Windows の場合（例）
UNITY_PATH="/c/Program Files/Unity/Hub/Editor/2022.3.0f1/Editor/Unity.exe"

# macOS の場合（例）
# UNITY_PATH="/Applications/Unity/Hub/Editor/2022.3.0f1/Unity.app/Contents/MacOS/Unity"

# Linux の場合（例）
# UNITY_PATH="/usr/bin/unity-editor"
```

### 3. Cake のインストール

```bash
# .NET ローカルツールマニフェストを作成
dotnet new tool-manifest

# Cake をインストール
dotnet tool install Cake.Tool
```

### 4. スクリプトに実行権限を付与

```bash
chmod +x unity-config.sh
chmod +x scripts/*.sh
```

## 開発コマンド

### Cake を使用する方法（推奨）

```bash
# テスト実行
dotnet cake --target=Test

# ビルド
dotnet cake --target=Build

# コードフォーマット
dotnet cake --target=Format

# すべてのチェック
dotnet cake --target=Check

# ファイル監視モード（開発中はこれを起動）
dotnet cake --target=Watch

# CI環境でのビルド
dotnet cake --target=CI
```

### スクリプトを直接使用する方法

```bash
# テスト実行
./scripts/test.sh

# ビルド
./scripts/build.sh

# コードフォーマット
./scripts/format.sh

# すべてのチェック
./scripts/check.sh

# ファイル監視モード
./scripts/watch.sh
```

## プロジェクト構造

```
app/csharp/
├── Assets/
│   ├── Scripts/
│   │   ├── Core/          # コアゲームロジック
│   │   ├── UI/            # ユーザーインターフェース
│   │   └── Utilities/     # ユーティリティクラス
│   └── Tests/
│       └── EditMode/      # EditMode テスト
├── scripts/
│   ├── test.sh            # テスト実行スクリプト
│   ├── build.sh           # ビルドスクリプト
│   ├── format.sh          # フォーマットスクリプト
│   ├── check.sh           # チェックスクリプト
│   └── watch.sh           # ファイル監視スクリプト
├── unity-config.sh        # Unity パス設定
├── build.cake             # Cake ビルド自動化スクリプト
├── .config/
│   └── dotnet-tools.json  # .NET ローカルツール設定
├── .gitignore             # Git除外設定
└── README.md              # このファイル
```

## イテレーション

### イテレーション0: 環境の構築 ✅

- [x] プロジェクト構造の作成
- [x] Git によるバージョン管理
- [x] Unity Test Framework のセットアップ
- [x] Cake によるビルド自動化

### イテレーション1: ボードの実装（予定）

- [ ] ボードの作成
- [ ] セルの状態管理
- [ ] ぷよの配置

## 参考資料

- [ぷよぷよから始めるテスト駆動開発入門_CSharp版.md](../../docs/reference/case-5/ぷよぷよから始めるテスト駆動開発入門_CSharp版.md)
