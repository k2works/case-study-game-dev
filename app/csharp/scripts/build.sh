#!/bin/bash
# Unity ビルドスクリプト

source ./unity-config.sh

echo "🔨 Unity プロジェクトをビルド中..."
"$UNITY_PATH" -batchmode -nographics \
  -projectPath "$PROJECT_PATH" \
  -buildTarget StandaloneLinux64 \
  -quit \
  -logFile "$PROJECT_PATH/build.log"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ ビルドが成功しました"
else
    echo "❌ ビルドが失敗しました"
    echo "詳細: build.log を確認してください"
fi

exit $EXIT_CODE
