using UnityEngine;
using PuyoPuyo.Core;

namespace PuyoPuyo.View
{
    /// <summary>
    /// ゲーム全体を管理するコントローラー
    /// </summary>
    public class GameController : MonoBehaviour
    {
        [SerializeField] private BoardView boardView;
        [SerializeField] private PairView pairView;
        [SerializeField] private float fallInterval = 1f; // 自動落下の間隔（秒）

        private Board board;
        private Pair currentPair;
        private float fallTimer;

        private void Start()
        {
            // Board を初期化
            board = new Board();
            boardView.Initialize(board);

            // 最初の Pair を生成
            SpawnNewPair();
            pairView.Initialize(currentPair, boardView);

            fallTimer = fallInterval;
        }

        private void Update()
        {
            if (currentPair == null) return;

            // キーボード入力処理
            HandleInput();

            // 自動落下
            fallTimer -= Time.deltaTime;
            if (fallTimer <= 0f)
            {
                fallTimer = fallInterval;
                if (!currentPair.CanMoveDown(board))
                {
                    PlacePairOnBoard();
                    SpawnNewPair();
                    pairView.SetPair(currentPair);
                }
                else
                {
                    currentPair.MoveDown(board);
                }
            }
        }

        private void HandleInput()
        {
            // 左右移動
            if (Input.GetKeyDown(KeyCode.LeftArrow))
            {
                currentPair.MoveLeft(board);
            }
            else if (Input.GetKeyDown(KeyCode.RightArrow))
            {
                currentPair.MoveRight(board);
            }

            // 回転
            if (Input.GetKeyDown(KeyCode.Z))
            {
                currentPair.RotateLeft(board);
            }
            else if (Input.GetKeyDown(KeyCode.X))
            {
                currentPair.RotateRight(board);
            }

            // 高速落下
            if (Input.GetKey(KeyCode.DownArrow))
            {
                if (currentPair.CanMoveDown(board))
                {
                    currentPair.MoveDown(board);
                }
            }
        }

        private void SpawnNewPair()
        {
            // ランダムな色で新しい Pair を生成（中央上部）
            PuyoColor axisColor = GetRandomColor();
            PuyoColor childColor = GetRandomColor();
            currentPair = new Pair(2, 1, axisColor, childColor);
        }

        private PuyoColor GetRandomColor()
        {
            int colorIndex = Random.Range(1, 5); // 1-4 (Red, Blue, Green, Yellow)
            return (PuyoColor)colorIndex;
        }

        private void PlacePairOnBoard()
        {
            // Board に Pair を配置
            board.Set(currentPair.AxisY, currentPair.AxisX, currentPair.AxisColor);
            board.Set(currentPair.ChildY, currentPair.ChildX, currentPair.ChildColor);
        }
    }
}
