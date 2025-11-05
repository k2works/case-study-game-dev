#!/bin/bash
# Machine Learning API Server 起動スクリプト (Linux/macOS)

echo "===================================="
echo " Machine Learning API Server"
echo "===================================="
echo ""

# ログレベルを設定（debug にするとより詳細なログが表示されます）
export RUST_LOG=ml_tdd_rust=info,tower_http=debug

echo "[INFO] データファイルの確認..."
if [ ! -f "data/iris.csv" ]; then
    echo "[ERROR] data/iris.csv が見つかりません"
    echo "[ERROR] カレントディレクトリを確認してください"
    exit 1
fi

echo "[OK] データファイルが見つかりました"
echo ""
echo "[INFO] API サーバーを起動しています..."
echo ""

cargo run --bin ml-api-server
