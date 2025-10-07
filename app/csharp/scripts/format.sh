#!/bin/bash
# C# コードフォーマットスクリプト

echo "✨ コードフォーマット実行中..."

# .csproj ファイルを探す
CSPROJ_FILE=$(find . -name "*.csproj" | head -1)

if [ -z "$CSPROJ_FILE" ]; then
    echo "❌ .csproj ファイルが見つかりません"
    echo "ℹ️  Unity Editor でプロジェクトを開いて .csproj ファイルを生成してください"
    exit 1
fi

dotnet format "$CSPROJ_FILE" --verify-no-changes

if [ $? -eq 0 ]; then
    echo "✅ コードフォーマットOK"
else
    echo "🔄 コードフォーマット適用中..."
    dotnet format "$CSPROJ_FILE"
    echo "✅ コードフォーマット完了"
fi
