#!/usr/bin/env bash

TARGET=${1:-Default}
CONFIGURATION=${2:-Release}

dotnet cake --target="$TARGET" --configuration="$CONFIGURATION"
