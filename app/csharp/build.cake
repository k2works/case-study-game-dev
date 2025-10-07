// build.cake

///////////////////////////////////////////////////////////////////////////////
// 引数
///////////////////////////////////////////////////////////////////////////////

var target = Argument("target", "Default");
var configuration = Argument("configuration", "Release");

///////////////////////////////////////////////////////////////////////////////
// Unity パス設定
///////////////////////////////////////////////////////////////////////////////

var unityPath = @"C:\Program Files\Unity\Hub\Editor\2022.3.0f1\Editor\Unity.exe";
var projectPath = MakeAbsolute(Directory("./")).FullPath;

///////////////////////////////////////////////////////////////////////////////
// タスク定義
///////////////////////////////////////////////////////////////////////////////

Task("Test")
    .Description("Unity テストを実行")
    .Does(() =>
{
    Information("🧪 Unity テスト実行中...");

    var exitCode = StartProcess(unityPath, new ProcessSettings {
        Arguments = new ProcessArgumentBuilder()
            .Append("-batchmode")
            .Append("-nographics")
            .AppendQuoted("-projectPath", projectPath)
            .Append("-runTests")
            .Append("-testPlatform EditMode")
            .AppendQuoted("-testResults", $"{projectPath}/TestResults.xml")
            .AppendQuoted("-logFile", $"{projectPath}/test.log"),
        WorkingDirectory = projectPath
    });

    if (exitCode == 0)
    {
        Information("✅ すべてのテストが成功しました");
    }
    else
    {
        Error("❌ テストが失敗しました");
        Error($"詳細: {projectPath}/test.log を確認してください");
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

Task("Setup")
    .Description("ゲームシーンを自動セットアップ")
    .Does(() =>
{
    Information("🎮 ゲームシーンをセットアップ中...");

    var exitCode = StartProcess(unityPath, new ProcessSettings {
        Arguments = new ProcessArgumentBuilder()
            .Append("-batchmode")
            .Append("-nographics")
            .AppendQuoted("-projectPath", projectPath)
            .Append("-executeMethod PuyoPuyo.Editor.SceneSetup.CreateGameSceneFromCommandLine")
            .AppendQuoted("-logFile", $"{projectPath}/setup.log"),
        WorkingDirectory = projectPath
    });

    if (exitCode == 0)
    {
        Information("✅ ゲームシーンのセットアップが完了しました");
        Information("   シーン: Assets/Scenes/GameScene.unity");
    }
    else
    {
        Error("❌ セットアップが失敗しました");
        Error($"詳細: {projectPath}/setup.log を確認してください");
        throw new Exception("セットアップが失敗しました");
    }
});

Task("Play")
    .Description("Unity でゲームを実行")
    .Does(() =>
{
    Information("▶️  Unity Editor でゲームを起動中...");

    StartProcess(unityPath, new ProcessSettings {
        Arguments = new ProcessArgumentBuilder()
            .AppendQuoted("-projectPath", projectPath)
            .Append("-executeMethod UnityEditor.EditorApplication.EnterPlaymode"),
        WorkingDirectory = projectPath
    });
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
