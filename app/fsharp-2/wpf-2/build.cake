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
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./PuyoPuyo.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true
    });
});

Task("Run")
    .Does(() =>
{
    DotNetRun("./src/PuyoPuyo.App/PuyoPuyo.App.fsproj");
});

Task("Watch")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "watch run --project ./src/PuyoPuyo.App/PuyoPuyo.App.fsproj"
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
    .Description("コードを自動フォーマット")
    .Does(() =>
{
    StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "fantomas src tests"
    });
});

Task("Format-Check")
    .Description("コードフォーマットをチェック")
    .Does(() =>
{
    var exitCode = StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "fantomas src tests --check"
    });

    if (exitCode != 0)
    {
        throw new Exception("コードフォーマットエラーが検出されました。dotnet cake --target=Format で修正してください。");
    }
});

Task("Lint")
    .Description("静的コード解析を実行")
    .Does(() =>
{
    var exitCode = StartProcess("dotnet", new ProcessSettings
    {
        Arguments = "fsharplint lint PuyoPuyo.sln"
    });

    if (exitCode != 0)
    {
        throw new Exception("静的コード解析でエラーが検出されました。");
    }
});

Task("Coverage")
    .Description("テストカバレッジを測定")
    .IsDependentOn("Build")
    .Does(() =>
{
    DotNetTest("./PuyoPuyo.sln", new DotNetTestSettings
    {
        Configuration = configuration,
        NoBuild = true,
        NoRestore = true,
        ArgumentCustomization = args => args
            .Append("/p:CollectCoverage=true")
            .Append("/p:CoverletOutputFormat=opencover")
            .Append("/p:CoverletOutput=./coverage/")
    });

    Information("カバレッジレポート: ./tests/PuyoPuyo.Tests/coverage/coverage.opencover.xml");
});

///////////////////////////////////////////////////////////////////////////////
// ターゲット
///////////////////////////////////////////////////////////////////////////////

Task("Default")
    .IsDependentOn("Test");

Task("CI")
    .Description("CI環境での完全なビルドとテスト")
    .IsDependentOn("Clean")
    .IsDependentOn("Format-Check")
    .IsDependentOn("Lint")
    .IsDependentOn("Test")
    .IsDependentOn("Coverage");

///////////////////////////////////////////////////////////////////////////////
// 実行
///////////////////////////////////////////////////////////////////////////////

RunTarget(target);
