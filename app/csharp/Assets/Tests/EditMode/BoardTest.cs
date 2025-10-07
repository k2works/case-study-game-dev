using NUnit.Framework;
using PuyoPuyo.Core;

namespace PuyoPuyo.Tests
{
    public class BoardTest
    {
        [Test]
        public void ボードを作成すると6列12行で初期化される()
        {
            // Arrange & Act
            var board = new Board();

            // Assert
            Assert.AreEqual(6, board.Cols);
            Assert.AreEqual(12, board.Rows);
        }

        [Test]
        public void 新規作成したボードはすべての位置が空である()
        {
            // Arrange
            var board = new Board();

            // Act & Assert
            for (int row = 0; row < board.Rows; row++)
            {
                for (int col = 0; col < board.Cols; col++)
                {
                    Assert.AreEqual(PuyoColor.None, board.Get(row, col));
                }
            }
        }

        [Test]
        public void ぷよを配置して取得できる()
        {
            // Arrange
            var board = new Board();

            // Act
            board.Set(0, 2, PuyoColor.Red);

            // Assert
            Assert.AreEqual(PuyoColor.Red, board.Get(0, 2));
        }

        [Test]
        public void 異なる位置に異なる色のぷよを配置できる()
        {
            // Arrange
            var board = new Board();

            // Act
            board.Set(0, 1, PuyoColor.Blue);
            board.Set(1, 2, PuyoColor.Green);
            board.Set(2, 3, PuyoColor.Yellow);

            // Assert
            Assert.AreEqual(PuyoColor.Blue, board.Get(0, 1));
            Assert.AreEqual(PuyoColor.Green, board.Get(1, 2));
            Assert.AreEqual(PuyoColor.Yellow, board.Get(2, 3));
        }

        [Test]
        public void 範囲内の座標はIsInBoundsがtrueを返す()
        {
            // Arrange
            var board = new Board();

            // Act & Assert
            Assert.IsTrue(board.IsInBounds(0, 0));
            Assert.IsTrue(board.IsInBounds(11, 5));
            Assert.IsTrue(board.IsInBounds(5, 3));
        }

        [Test]
        public void 範囲外の座標はIsInBoundsがfalseを返す()
        {
            // Arrange
            var board = new Board();

            // Act & Assert
            Assert.IsFalse(board.IsInBounds(-1, 2)); // 上に出る
            Assert.IsFalse(board.IsInBounds(12, 2)); // 下に出る
            Assert.IsFalse(board.IsInBounds(5, -1)); // 左に出る
            Assert.IsFalse(board.IsInBounds(5, 6));  // 右に出る
        }
    }
}
