#!/usr/bin/env bash

##########################################################################
# Cake ビルドスクリプト（bash版）
##########################################################################

TARGET="Default"
CONFIGURATION="Debug"

# 引数のパース
while [[ $# -gt 0 ]]; do
    case $1 in
        --target=*)
            TARGET="${1#*=}"
            shift
            ;;
        --configuration=*)
            CONFIGURATION="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo -e "\033[32mCake ビルドスクリプトを実行中...\033[0m"
echo -e "\033[36mTarget: $TARGET\033[0m"
echo -e "\033[36mConfiguration: $CONFIGURATION\033[0m"
echo ""

# Cake を実行
dotnet dotnet-cake build.cake --target="$TARGET" --configuration="$CONFIGURATION"

exit $?
