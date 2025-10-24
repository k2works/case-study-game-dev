.PHONY: help build test clean restore format lint watch setup check

# デフォルトターゲット
help:
	@echo "利用可能なコマンド:"
	@echo "  make build         - プロジェクトをビルド"
	@echo "  make test          - テストを実行"
	@echo "  make test-watch    - テストをウォッチモードで実行"
	@echo "  make clean         - ビルド成果物を削除"
	@echo "  make restore       - パッケージを復元"
	@echo "  make format        - コードを自動フォーマット"
	@echo "  make lint          - 静的解析を実行"
	@echo "  make setup         - 初回セットアップ（復元＋ビルド＋テスト）"
	@echo "  make check         - フォーマット＋Lint＋テスト"

# ビルド
build:
	dotnet build

# テスト実行
test:
	dotnet test

# テストをウォッチモードで実行
test-watch:
	dotnet watch test --project PuyoPuyoMAUI.Tests

# クリーン
clean:
	dotnet clean
	rm -rf PuyoPuyoMAUI/bin PuyoPuyoMAUI/obj
	rm -rf PuyoPuyoMAUI.Core/bin PuyoPuyoMAUI.Core/obj
	rm -rf PuyoPuyoMAUI.Tests/bin PuyoPuyoMAUI.Tests/obj

# パッケージ復元
restore:
	dotnet restore

# コードフォーマット
format:
	dotnet format

# 静的解析
lint:
	dotnet build /p:TreatWarningsAsErrors=true

# 初回セットアップ
setup: restore build test
	@echo "セットアップが完了しました"

# フォーマット＋Lint＋テスト
check: format lint test
	@echo "すべてのチェックが完了しました"
