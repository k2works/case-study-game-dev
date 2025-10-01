# PuyoPuyo (Bolero WebAssembly)

## 概要

Bolero フレームワークを使用した F# ベースのぷよぷよゲーム実装。Blazor WebAssembly 上で動作し、Elmish パターンによる関数型アーキテクチャを採用しています。

### 目的

- F# と Bolero を使った WebAssembly ゲーム開発の実証
- Elmish パターン（Model-View-Update）による関数型 UI 設計
- ドメイン駆動設計に基づいたゲームロジックの実装

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| .NET SDK     | 8.0        | 必須 |
| F#           | 8.0        |      |
| Bolero       | 0.24.38    |      |

## 構成

- [構築](#構築)
- [配置](#配置)
- [開発](#開発)
- [アーキテクチャ](#アーキテクチャ)

## 詳細

### Quick Start

```bash
# プロジェクトディレクトリに移動
cd app/fsharp/bolero/src

# 依存関係の復元
dotnet restore

# 開発サーバー起動
dotnet run

# ブラウザで http://localhost:5000 にアクセス
```

### 構築

#### 初回セットアップ

```bash
# .NET SDK のインストール確認
dotnet --version

# プロジェクトの復元
cd app/fsharp/bolero/src
dotnet restore
```

#### ビルド

```bash
# デバッグビルド
dotnet build

# リリースビルド
dotnet build -c Release
```

**[⬆ back to top](#構成)**

### 配置

#### 開発環境

```bash
# ホットリロード付き開発サーバー
dotnet watch run
```

#### プロダクションビルド

```bash
# 最適化ビルド
dotnet publish -c Release

# 出力先: bin/Release/net8.0/publish/wwwroot
```

#### 静的ファイルホスティング

```bash
# publish/wwwroot を任意の静的ホスティングサービスにデプロイ
# 例: GitHub Pages, Netlify, Vercel など
```

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構造

```
src/
├── Domain/              # ドメインロジック
│   ├── Types.fs        # 基本型定義
│   ├── Board.fs        # ボード操作
│   ├── Puyo.fs         # ぷよペア管理
│   └── GameLogic.fs    # ゲームルール
├── Elmish/             # Elmish パターン
│   ├── Model.fs        # アプリケーション状態
│   ├── Commands.fs     # 副作用処理
│   └── Update.fs       # 状態更新ロジック
├── Main.fs             # UI コンポーネント
├── Startup.fs          # アプリケーション起動
└── wwwroot/            # 静的リソース
    ├── css/
    └── index.html
```

#### テスト実行

```bash
# 全テスト実行
cd ../tests
dotnet test

# カバレッジ付き実行
dotnet test --collect:"XPlat Code Coverage"
```

#### コーディング規約

- F# の標準的な命名規則に従う
- 関数型プログラミングの原則を遵守
- 副作用は Elmish の Commands に集約
- ドメインロジックは純粋関数として実装

**[⬆ back to top](#構成)**

## アーキテクチャ

### Elmish パターン

```
┌─────────────────────────────────────────┐
│              View (UI)                   │
│          (Main.fs)                       │
└───────────────┬─────────────────────────┘
                │ Dispatch Message
                ▼
┌─────────────────────────────────────────┐
│            Update                        │
│      (Update.fs)                         │
│  Model → Message → Model                │
└───────────┬───────────┬─────────────────┘
            │           │
            │           └─→ Commands (副作用)
            ▼
┌─────────────────────────────────────────┐
│           Model (状態)                    │
│        (Model.fs)                        │
└─────────────────────────────────────────┘
```

### ドメインモデル

- **不変データ構造**: すべてのドメインオブジェクトは immutable
- **純粋関数**: ゲームロジックは副作用なし
- **型安全性**: F# の型システムによる不正状態の防止

### 主要な機能

- ぷよペアの操作（左右移動、回転、落下）
- 連鎖判定と消去処理
- 浮遊ぷよの落下処理
- スコア計算とゲームオーバー判定
- キーボード入力対応

## 参照

- [Bolero 公式ドキュメント](https://fsbolero.io/)
- [Elmish ガイド](https://elmish.github.io/elmish/)
- [F# ドキュメント](https://learn.microsoft.com/ja-jp/dotnet/fsharp/)
- [ぷよぷよルール](https://puyo.sega.jp/portal/howto.html)
