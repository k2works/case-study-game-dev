#!/bin/bash
# 統合品質チェックスクリプト

set -e  # エラーで停止

echo "=== 品質チェック開始 ==="
echo ""

# フォーマットチェック
echo "1. コードフォーマットチェック"
./scripts/format.sh
echo ""

# テスト実行
echo "2. テスト実行"
./scripts/test.sh
echo ""

echo "=== ✅ すべてのチェックが完了しました ==="
