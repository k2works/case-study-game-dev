#!/bin/bash
# Jupyter 環境セットアップスクリプト

set -e

echo "=== Jupyter 環境のセットアップ ==="
echo ""

# Python バージョンチェック
echo "1. Python バージョン確認..."
if ! command -v python3 &> /dev/null; then
    echo "エラー: Python 3 がインストールされていません"
    exit 1
fi

python3 --version
echo ""

# 仮想環境の作成
echo "2. Python 仮想環境を作成..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   仮想環境を作成しました"
else
    echo "   仮想環境は既に存在します"
fi
echo ""

# 仮想環境のアクティベート
echo "3. 仮想環境をアクティベート..."
source venv/bin/activate
echo ""

# パッケージのインストール
echo "4. 必要なパッケージをインストール..."
pip install --upgrade pip
pip install -r requirements.txt
echo ""

# Jupyter カーネル登録
echo "5. Jupyter カーネルを登録..."
python -m ipykernel install --user --name=ml-tdd-rust --display-name="ML TDD Rust"
echo ""

echo "=== セットアップ完了 ==="
echo ""
echo "Jupyter Notebook を起動するには:"
echo "  source venv/bin/activate"
echo "  jupyter notebook notebooks/"
echo ""
echo "または Jupyter Lab を起動するには:"
echo "  source venv/bin/activate"
echo "  jupyter lab notebooks/"
