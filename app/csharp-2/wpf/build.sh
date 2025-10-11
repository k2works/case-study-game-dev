#!/usr/bin/env bash
# build.sh

set -euox pipefail

TARGET=${1:-Default}
CONFIGURATION=${2:-Release}
VERBOSITY=${3:-Normal}

# ツールをインストール
dotnet tool restore

# Cake を実行
dotnet cake build.cake --target="$TARGET" --configuration="$CONFIGURATION" --verbosity="$VERBOSITY"
