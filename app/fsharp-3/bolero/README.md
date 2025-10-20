# PuyoPuyo

## 概要

### 目的

Bolero (F# + Blazor WebAssembly) を使用したぷよぷよゲームの実装

### 前提

| ソフトウェア | バージョン | 備考 |
| :----------- | :--------- | :--- |
| .NET SDK     | 9.0.0      | global.json で指定 |
| F#           | 8.0        |      |
| Bolero       | 0.*        |      |

## 構成

- [構築](#構築)
- [配置](#配置)
- [運用](#運用)
- [開発](#開発)

## 詳細

### Quick Start

```bash
dotnet restore
dotnet run --project src/PuyoPuyo.Client/PuyoPuyo.Client.fsproj
```

### 構築

#### 依存関係のインストール

```bash
dotnet restore
```

#### ビルド

```bash
dotnet build
```

**[⬆ back to top](#構成)**

### 配置

#### Release ビルド

```bash
dotnet publish -c Release src/PuyoPuyo.Client/PuyoPuyo.Client.fsproj
```

#### 出力先

`src/PuyoPuyo.Client/bin/Release/net8.0/publish/`

**[⬆ back to top](#構成)**

### 運用

#### アプリケーション起動

```bash
dotnet run --project src/PuyoPuyo.Client/PuyoPuyo.Client.fsproj
```

起動後、ブラウザで `https://localhost:5001` にアクセス

**[⬆ back to top](#構成)**

### 開発

#### プロジェクト構造

```
PuyoPuyo/
├── src/
│   └── PuyoPuyo.Client/          # クライアントプロジェクト
│       ├── Domain/                # ドメインロジック
│       │   ├── 測定単位.fs
│       │   ├── ぷよ.fs
│       │   ├── 盤面.fs
│       │   ├── ぷよペア.fs
│       │   ├── スコア.fs
│       │   └── ゲームロジック.fs
│       ├── Elmish/                # Elmish アーキテクチャ
│       │   ├── モデル.fs
│       │   ├── 更新.fs
│       │   └── サブスクリプション.fs
│       ├── Components/            # UI コンポーネント
│       │   └── ゲーム表示.fs
│       ├── Main.fs
│       └── Startup.fs
└── tests/
    └── PuyoPuyo.Tests/           # テストプロジェクト
```

#### テスト実行

```bash
dotnet test
```

#### ウォッチモード（開発サーバー）

```bash
dotnet watch --project src/PuyoPuyo.Client/PuyoPuyo.Client.fsproj
```

ファイルの変更を監視し、自動的に再ビルド・リロードを実行します。

#### リンター実行

```bash
dotnet fsharplint lint PuyoPuyo.sln
```

#### コード整形

```bash
dotnet fantomas src/ tests/
```

**[⬆ back to top](#構成)**

## 参照

- [Bolero Documentation](https://fsbolero.io/)
- [F# Documentation](https://learn.microsoft.com/ja-jp/dotnet/fsharp/)
- [Elmish Documentation](https://elmish.github.io/elmish/)
- [Blazor WebAssembly](https://learn.microsoft.com/ja-jp/aspnet/core/blazor/)
