#!/bin/bash
# Unity テスト実行スクリプト

source ./unity-config.sh

echo "🧪 Unity テスト実行中..."
"$UNITY_PATH" -batchmode -nographics \
  -projectPath "$PROJECT_PATH" \
  -runTests \
  -testPlatform EditMode \
  -testResults "$PROJECT_PATH/TestResults.xml" \
  -logFile "$PROJECT_PATH/test.log"

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ すべてのテストが成功しました"
else
    echo "❌ テストが失敗しました"
    echo "詳細: test.log を確認してください"
fi

exit $EXIT_CODE
