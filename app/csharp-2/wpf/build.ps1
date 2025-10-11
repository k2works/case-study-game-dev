#!/usr/bin/env pwsh
# build.ps1

[CmdletBinding()]
Param(
    [string]$Target = "Default",
    [string]$Configuration = "Release",
    [ValidateSet("Quiet", "Minimal", "Normal", "Verbose", "Diagnostic")]
    [string]$Verbosity = "Normal"
)

# ツールをインストール
dotnet tool restore
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Cake を実行
dotnet cake build.cake --target=$Target --configuration=$Configuration --verbosity=$Verbosity
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
