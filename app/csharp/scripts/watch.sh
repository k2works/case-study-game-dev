#!/bin/bash
# Unity テストの監視と自動実行スクリプト

source ./unity-config.sh

echo "=== Unity Test Watcher ==="
echo "ファイル変更を監視中..."
echo "終了するには Ctrl+C を押してください"
echo ""

# 初回実行
echo "🔄 初回チェック実行..."
./scripts/check.sh || true
echo ""

# ファイル監視
if command -v fswatch &> /dev/null; then
    # macOS
    fswatch -o -e ".*" -i "\\.cs$" Assets/ | while read; do
        echo "📝 変更検出: $(date '+%H:%M:%S')"
        ./scripts/check.sh || true
        echo ""
    done
elif command -v inotifywait &> /dev/null; then
    # Linux
    while true; do
        inotifywait -r -e modify,create,delete --include '\.cs$' Assets/
        echo "📝 変更検出: $(date '+%H:%M:%S')"
        ./scripts/check.sh || true
        echo ""
    done
else
    echo "❌ ファイル監視ツールがインストールされていません"
    echo "macOS: brew install fswatch"
    echo "Linux: sudo apt-get install inotify-tools"
    exit 1
fi
