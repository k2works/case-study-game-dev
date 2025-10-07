#!/bin/bash
# Unity 設定ファイル

# Unity のパス（OS とバージョンに応じて変更してください）
# macOS の場合
# UNITY_PATH="/Applications/Unity/Hub/Editor/2022.3.0f1/Unity.app/Contents/MacOS/Unity"

# Linux の場合（例）
# UNITY_PATH="/usr/bin/unity-editor"

# Windows の場合（Git Bash）
UNITY_PATH="/c/Program Files/Unity/Hub/Editor/2022.3.0f1/Editor/Unity.exe"

export UNITY_PATH
export PROJECT_PATH="$(pwd)"
