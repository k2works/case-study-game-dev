# PuyoPuyoMAUI

.NET MAUI を使用したぷよぷよゲームの実装

## 必要な環境

- .NET 9.0 SDK
- Visual Studio 2022 または Rider（.NET MAUI ワークロード付き）

## プロジェクト構成

- **PuyoPuyoMAUI** - .NET MAUI アプリケーション
- **PuyoPuyoMAUI.Core** - ドメインロジック（クラスライブラリ）
- **PuyoPuyoMAUI.Tests** - xUnit テストプロジェクト

## ビルドとテスト

このプロジェクトでは、ビルド自動化に **Cake** を使用しています。

### タスク一覧

利用可能なタスク：

```bash
# Windows (PowerShell)
.\build.ps1 --target=<タスク名>

# Linux / macOS
./build.sh --target=<タスク名>
```

#### 主要なタスク

- **Build** - プロジェクトをビルド（デフォルト）
  ```bash
  .\build.ps1
  # または
  .\build.ps1 --target=Build
  ```

- **Test** - テストを実行
  ```bash
  .\build.ps1 --target=Test
  ```

- **Clean** - ビルド成果物を削除
  ```bash
  .\build.ps1 --target=Clean
  ```

- **Restore** - パッケージを復元
  ```bash
  .\build.ps1 --target=Restore
  ```

- **Format** - コードを自動フォーマット
  ```bash
  .\build.ps1 --target=Format
  ```

- **Lint** - 静的解析を実行（警告をエラーとして扱う）
  ```bash
  .\build.ps1 --target=Lint
  ```

- **Setup** - 初回セットアップ（復元＋ビルド＋テスト）
  ```bash
  .\build.ps1 --target=Setup
  ```

- **Check** - フォーマット＋Lint＋テスト
  ```bash
  .\build.ps1 --target=Check
  ```

### dotnet CLI を直接使用する場合

Cake を使わずに直接 dotnet CLI を使用することもできます：

```bash
# ビルド
dotnet build

# テスト実行
dotnet test

# フォーマット
dotnet format

# クリーン
dotnet clean
```

## 開発ワークフロー

1. **初回セットアップ**
   ```bash
   .\build.ps1 --target=Setup
   ```

2. **開発サイクル**
   - コードを変更
   - テストを書く
   - テストを実行
     ```bash
     .\build.ps1 --target=Test
     ```

3. **コミット前のチェック**
   ```bash
   .\build.ps1 --target=Check
   ```

## コーディング規約

- インデント: スペース 4 つ
- 改行コード: CRLF (Windows)
- 文字コード: UTF-8
- メソッドの循環的複雑度: 7 以下

詳細は `.editorconfig` を参照してください。

## ライセンス

このプロジェクトはケーススタディ用のサンプルコードです。
