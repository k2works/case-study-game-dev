// build.cake

///////////////////////////////////////////////////////////////////////////////
// 引数
///////////////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

///////////////////////////////////////////////////////////////////////////////
// タスク定義
///////////////////////////////////////////////////////////////////////////////

Task("Clean")
    .Does(() =>
{
    DotNetClean("./PuyoPuyo.sln");
    CleanDirectories("./src/**/bin");
    CleanDirectories("./src/**/obj");
    CleanDirectories("./tests/**/bin");
    CleanDirectories("./tests/**/obj");
});

Task("Restore")
    .IsDependentOn("Clean")
    .Does(() =>
{
    DotNetRestore("./PuyoPuyo.sln");
});

Task("Build")
    .IsDependentOn("Restore")
    .Does(() =>
{
    DotNetBuild("./PuyoPuyo.sln", new DotNetBuildSettings
    {
        Configuration = configuration,
        NoRestore = true
    });
});

Task("Test")
    .Description("Run tests using xUnit v3 in-process runner")
    .Does(() =>
{
    // テストプロジェクトのみをビルド（MAUIプロジェクトのビルド問題を回避）
    DotNetBuild("./tests/PuyoPuyo.Tests/PuyoPuyo.Tests.fsproj", new DotNetBuildSettings
    {
        Configuration = configuration
    });

    // xUnit v3のin-process runnerを使用してテストを実行
    var exitCode = StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "run --project ./tests/PuyoPuyo.Tests/PuyoPuyo.Tests.fsproj --no-build"
    });

    if (exitCode != 0)
    {
        throw new Exception("Tests failed. Please check the test results above.");
    }
});

Task("Coverage")
    .Description("Run tests with code coverage using coverlet")
    .Does(() =>
{
    // カバレッジ出力ディレクトリをクリーンアップ
    CleanDirectory("./coverage");

    // coverletを使用してテストを実行
    var exitCode = StartProcess("dotnet", new ProcessSettings
    {
        Arguments = $"test ./tests/PuyoPuyo.Tests/PuyoPuyo.Tests.fsproj " +
                    "--configuration " + configuration + " " +
                    "/p:CollectCoverage=true " +
                    "/p:CoverletOutputFormat=cobertura " +
                    "/p:CoverletOutput=../../coverage/coverage.cobertura.xml " +
                    "/p:Exclude=[xunit.*]*%2c[*.Tests]*"
    });

    if (exitCode != 0)
    {
        throw new Exception("Tests with coverage failed. Please check the test results above.");
    }

    Information("Coverage report generated at: ./coverage/coverage.cobertura.xml");
});

Task("Coverage-Report")
    .Description("Generate HTML coverage report using ReportGenerator")
    .IsDependentOn("Coverage")
    .Does(() =>
{
    // ReportGeneratorツールがインストールされているか確認（既にインストール済みの場合はスキップ）
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "tool install --global dotnet-reportgenerator-globaltool",
        RedirectStandardError = true,
        RedirectStandardOutput = true
    });

    // レポート生成
    var exitCode = StartProcess("reportgenerator", new ProcessSettings
    {
        Arguments = "\"-reports:./coverage/coverage.cobertura.xml\" " +
                    "\"-targetdir:./coverage/report\" " +
                    "\"-reporttypes:Html;TextSummary\""
    });

    if (exitCode != 0)
    {
        Warning("Failed to generate full report, but HTML report should be available.");
    }

    Information("HTML coverage report generated at: ./coverage/report/index.html");
});

Task("Run-Windows")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "run --project ./src/PuyoPuyo.App/PuyoPuyo.App.fsproj --framework net9.0-windows10.0.19041.0"
    });
});

Task("Run-Android")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "run --project ./src/PuyoPuyo.App/PuyoPuyo.App.fsproj --framework net9.0-android"
    });
});

Task("Watch")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "watch run --project ./src/PuyoPuyo.App/PuyoPuyo.App.fsproj --framework net9.0-windows10.0.19041.0"
    });
});

Task("Watch-Test")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "watch test --project ./tests/PuyoPuyo.Tests/PuyoPuyo.Tests.fsproj"
    });
});

Task("Format")
    .Description("Format F# code using Fantomas")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "fantomas ."
    });
});

Task("Format-Check")
    .Description("Check F# code formatting using Fantomas")
    .Does(() =>
{
    var exitCode = StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "fantomas --check ."
    });

    if (exitCode != 0)
    {
        throw new Exception("Code formatting check failed. Run 'dotnet cake --target=Format' to fix formatting issues.");
    }
});

Task("Lint")
    .Description("Lint F# code using FSharpLint")
    .Does(() =>
{
    var exitCode = StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "fsharplint lint PuyoPuyo.sln"
    });

    if (exitCode != 0)
    {
        throw new Exception("Linting failed. Please fix the issues reported above.");
    }
});

Task("CheckAll")
    .Description("Run all quality checks: format check, lint, and test")
    .IsDependentOn("Format-Check")
    .IsDependentOn("Lint")
    .IsDependentOn("Test");

///////////////////////////////////////////////////////////////////////////////
// ターゲット
///////////////////////////////////////////////////////////////////////////////

Task("Default")
    .IsDependentOn("Test");

Task("CI")
    .IsDependentOn("Clean")
    .IsDependentOn("Test");

///////////////////////////////////////////////////////////////////////////////
// 実行
///////////////////////////////////////////////////////////////////////////////

RunTarget(target);
