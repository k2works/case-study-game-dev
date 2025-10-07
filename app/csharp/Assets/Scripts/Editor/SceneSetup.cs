using UnityEngine;
using UnityEngine.UI;
using UnityEditor;
using UnityEditor.SceneManagement;
using PuyoPuyo.View;

namespace PuyoPuyo.Editor
{
    /// <summary>
    /// ゲームシーンを自動生成するエディタスクリプト
    /// </summary>
    public class SceneSetup
    {
        [MenuItem("PuyoPuyo/Setup Game Scene")]
        public static void SetupGameScene()
        {
            CreateGameScene();
            Debug.Log("✅ Game Scene のセットアップが完了しました");
        }

        /// <summary>
        /// コマンドラインから実行するための静的メソッド
        /// </summary>
        public static void CreateGameSceneFromCommandLine()
        {
            CreateGameScene();
            EditorApplication.Exit(0);
        }

        private static void CreateGameScene()
        {
            // 新しいシーンを作成
            var scene = EditorSceneManager.NewScene(NewSceneSetup.DefaultGameObjects, NewSceneMode.Single);

            // Canvas を作成
            GameObject canvasObj = new GameObject("Canvas");
            Canvas canvas = canvasObj.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;

            CanvasScaler scaler = canvasObj.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(800, 600);

            canvasObj.AddComponent<GraphicRaycaster>();

            // EventSystem を作成（入力処理に必要）
            GameObject eventSystemObj = new GameObject("EventSystem");
            eventSystemObj.AddComponent<UnityEngine.EventSystems.EventSystem>();
            eventSystemObj.AddComponent<UnityEngine.EventSystems.StandaloneInputModule>();

            // GameController を作成
            GameObject gameControllerObj = new GameObject("GameController");
            GameController gameController = gameControllerObj.AddComponent<GameController>();

            // BoardView を作成
            GameObject boardViewObj = new GameObject("BoardView");
            boardViewObj.transform.SetParent(canvasObj.transform);
            RectTransform boardRect = boardViewObj.AddComponent<RectTransform>();
            boardRect.anchorMin = new Vector2(0, 1); // Top-Left
            boardRect.anchorMax = new Vector2(0, 1);
            boardRect.pivot = new Vector2(0, 1);
            boardRect.anchoredPosition = new Vector2(50, -50);
            BoardView boardView = boardViewObj.AddComponent<BoardView>();

            // PairView を作成
            GameObject pairViewObj = new GameObject("PairView");
            pairViewObj.transform.SetParent(canvasObj.transform);
            RectTransform pairRect = pairViewObj.AddComponent<RectTransform>();
            pairRect.anchorMin = new Vector2(0, 1); // Top-Left
            pairRect.anchorMax = new Vector2(0, 1);
            pairRect.pivot = new Vector2(0, 1);
            pairRect.anchoredPosition = new Vector2(50, -50);
            PairView pairView = pairViewObj.AddComponent<PairView>();

            // GameController に参照を設定
            SerializedObject serializedController = new SerializedObject(gameController);
            serializedController.FindProperty("boardView").objectReferenceValue = boardView;
            serializedController.FindProperty("pairView").objectReferenceValue = pairView;
            serializedController.FindProperty("fallInterval").floatValue = 1.0f;
            serializedController.ApplyModifiedProperties();

            // シーンを保存
            System.IO.Directory.CreateDirectory("Assets/Scenes");
            EditorSceneManager.SaveScene(scene, "Assets/Scenes/GameScene.unity");

            Debug.Log("ゲームシーンを Assets/Scenes/GameScene.unity に保存しました");
        }
    }
}
