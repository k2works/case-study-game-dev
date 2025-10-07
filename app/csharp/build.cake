// build.cake

///////////////////////////////////////////////////////////////////////////////
// 引数
///////////////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

///////////////////////////////////////////////////////////////////////////////
// タスク定義
///////////////////////////////////////////////////////////////////////////////

Task("Test")
    .Description("Unity テストを実行")
    .Does(() =>
{
    var exitCode = StartProcess("./scripts/test.sh");
    if (exitCode != 0)
    {
        throw new Exception("テストが失敗しました");
    }
});

Task("Build")
    .Description("Unity プロジェクトをビルド")
    .Does(() =>
{
    var exitCode = StartProcess("./scripts/build.sh");
    if (exitCode != 0)
    {
        throw new Exception("ビルドが失敗しました");
    }
});

Task("Format")
    .Description("コードを自動フォーマット")
    .Does(() =>
{
    StartProcess("./scripts/format.sh");
});

Task("Check")
    .Description("すべての品質チェックを実行")
    .IsDependentOn("Format")
    .IsDependentOn("Test");

Task("Watch")
    .Description("ファイル監視モードで自動テスト実行")
    .Does(() =>
{
    StartProcess("./scripts/watch.sh");
});

///////////////////////////////////////////////////////////////////////////////
// ターゲット
///////////////////////////////////////////////////////////////////////////////

Task("Default")
    .IsDependentOn("Check");

Task("CI")
    .Description("CI環境での完全なビルドとテスト")
    .IsDependentOn("Check")
    .IsDependentOn("Build");

///////////////////////////////////////////////////////////////////////////////
// 実行
///////////////////////////////////////////////////////////////////////////////

RunTarget(target);
