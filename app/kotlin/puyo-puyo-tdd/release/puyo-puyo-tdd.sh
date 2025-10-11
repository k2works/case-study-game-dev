#!/bin/bash
# ぷよぷよ TDD 起動スクリプト (Linux/macOS)

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JAR_FILE="$SCRIPT_DIR/puyo-puyo-tdd-windows-x64-1.0.0.jar"

# Java のバージョンチェック
if ! command -v java &> /dev/null; then
    echo "エラー: Java が見つかりません。"
    echo "Java 21 以上をインストールしてください。"
    echo ""
    echo "ダウンロード: https://adoptium.net/"
    exit 1
fi

# JAR ファイルの存在確認
if [ ! -f "$JAR_FILE" ]; then
    echo "エラー: JAR ファイルが見つかりません。"
    echo "場所: $JAR_FILE"
    exit 1
fi

# ゲームを起動
echo "ぷよぷよ TDD を起動しています..."
java -jar "$JAR_FILE"
