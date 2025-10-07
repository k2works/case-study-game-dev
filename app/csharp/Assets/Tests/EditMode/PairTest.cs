using NUnit.Framework;
using PuyoPuyo.Core;

namespace PuyoPuyo.Tests
{
    public class PairTest
    {
        [Test]
        public void ぷよペアを作成すると軸ぷよと子ぷよが設定される()
        {
            // Arrange & Act
            var pair = new Pair(2, 0, PuyoColor.Red, PuyoColor.Blue);

            // Assert
            Assert.AreEqual(2, pair.AxisX);
            Assert.AreEqual(0, pair.AxisY);
            Assert.AreEqual(PuyoColor.Red, pair.AxisColor);
            Assert.AreEqual(PuyoColor.Blue, pair.ChildColor);
        }

        [Test]
        public void 初期状態では子ぷよは軸ぷよの上にある()
        {
            // Arrange & Act
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);

            // Assert
            Assert.AreEqual(2, pair.ChildX);
            Assert.AreEqual(0, pair.ChildY); // 軸ぷよの上（Y座標が1小さい）
        }

        [Test]
        public void 右回転すると子ぷよが時計回りに90度回転する()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);
            // 初期状態: 子ぷよは上 (2, 0)

            // Act
            pair.RotateRight(board);

            // Assert
            Assert.AreEqual(3, pair.ChildX); // 右に移動
            Assert.AreEqual(1, pair.ChildY); // 同じ高さ
        }

        [Test]
        public void 右回転を4回すると元の位置に戻る()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.RotateRight(board);
            pair.RotateRight(board);
            pair.RotateRight(board);
            pair.RotateRight(board);

            // Assert
            Assert.AreEqual(2, pair.ChildX);
            Assert.AreEqual(0, pair.ChildY); // 元の位置
        }

        [Test]
        public void 左回転すると子ぷよが反時計回りに90度回転する()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);
            // 初期状態: 子ぷよは上 (2, 0)

            // Act
            pair.RotateLeft(board);

            // Assert
            Assert.AreEqual(1, pair.ChildX); // 左に移動
            Assert.AreEqual(1, pair.ChildY); // 同じ高さ
        }

        [Test]
        public void ボード範囲内にある場合は衝突しない()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);

            // Act
            bool collision = pair.IsCollision(board, 2, 1, 2, 0);

            // Assert
            Assert.IsFalse(collision);
        }

        [Test]
        public void 軸ぷよがボード範囲外の場合は衝突する()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);

            // Act
            bool collision = pair.IsCollision(board, -1, 1, 2, 0); // 軸ぷよが左端外

            // Assert
            Assert.IsTrue(collision);
        }

        [Test]
        public void 子ぷよがボード範囲外の場合は衝突する()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(0, 1, PuyoColor.Red, PuyoColor.Blue);

            // Act
            bool collision = pair.IsCollision(board, 0, 1, -1, 1); // 子ぷよが左端外

            // Assert
            Assert.IsTrue(collision);
        }

        [Test]
        public void 軸ぷよの位置にぷよがある場合は衝突する()
        {
            // Arrange
            var board = new Board();
            board.Set(2, 1, PuyoColor.Red); // (row=2, col=1) に配置
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);

            // 軸ぷよを (axisX=1, axisY=2) に配置しようとする
            bool collision = pair.IsCollision(board, 1, 2, 2, 0);

            // Assert
            Assert.IsTrue(collision); // 衝突する
        }

        [Test]
        public void 子ぷよの位置にぷよがある場合は衝突する()
        {
            // Arrange
            var board = new Board();
            board.Set(2, 0, PuyoColor.Red); // (row=2, col=0) に配置
            var pair = new Pair(2, 1, PuyoColor.Red, PuyoColor.Blue);

            // Act
            bool collision = pair.IsCollision(board, 2, 1, 0, 2); // 子ぷよが (childX=0, childY=2)

            // Assert
            Assert.IsTrue(collision); // 衝突する
        }

        [Test]
        public void ぷよペアは左に移動できる()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(3, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.MoveLeft(board);

            // Assert
            Assert.AreEqual(2, pair.AxisX);
            Assert.AreEqual(5, pair.AxisY);
        }

        [Test]
        public void ぷよペアは右に移動できる()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(3, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.MoveRight(board);

            // Assert
            Assert.AreEqual(4, pair.AxisX);
            Assert.AreEqual(5, pair.AxisY);
        }

        [Test]
        public void 左端では左に移動できない()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(0, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.MoveLeft(board);

            // Assert - 位置が変わっていないことを確認
            Assert.AreEqual(0, pair.AxisX);
        }

        [Test]
        public void 右端では右に移動できない()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(5, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.MoveRight(board);

            // Assert - 位置が変わっていないことを確認
            Assert.AreEqual(5, pair.AxisX);
        }

        [Test]
        public void ぷよペアは下に移動できる()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(3, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.MoveDown(board);

            // Assert
            Assert.AreEqual(3, pair.AxisX);
            Assert.AreEqual(6, pair.AxisY);
        }

        [Test]
        public void 下にぷよがある場合は下に移動できない()
        {
            // Arrange
            var board = new Board();
            board.Set(6, 3, PuyoColor.Green); // 軸ぷよの下にぷよを配置
            var pair = new Pair(3, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            pair.MoveDown(board);

            // Assert - 位置が変わっていないことを確認
            Assert.AreEqual(5, pair.AxisY);
        }

        [Test]
        public void 下に移動できるかチェックできる()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(3, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            bool canMove = pair.CanMoveDown(board);

            // Assert
            Assert.IsTrue(canMove);
        }

        [Test]
        public void 下にぷよがある場合は移動できないと判定される()
        {
            // Arrange
            var board = new Board();
            board.Set(6, 3, PuyoColor.Green);
            var pair = new Pair(3, 5, PuyoColor.Red, PuyoColor.Blue);

            // Act
            bool canMove = pair.CanMoveDown(board);

            // Assert
            Assert.IsFalse(canMove);
        }

        [Test]
        public void 右端で右回転すると壁キックで左に移動する()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(5, 5, PuyoColor.Red, PuyoColor.Blue);
            // rotation = 0（子ぷよが上）

            // Act
            pair.RotateRight(board); // rotation = 1（子ぷよが右）になるはず

            // Assert - 壁キックで左に移動している
            Assert.AreEqual(4, pair.AxisX);
            Assert.AreEqual(5, pair.ChildX); // 子ぷよは右隣
        }

        [Test]
        public void 左端で左回転すると壁キックで右に移動する()
        {
            // Arrange
            var board = new Board();
            var pair = new Pair(0, 5, PuyoColor.Red, PuyoColor.Blue);
            // rotation = 0（子ぷよが上）

            // Act
            pair.RotateLeft(board); // rotation = 3（子ぷよが左）になるはず

            // Assert - 壁キックで右に移動している
            Assert.AreEqual(1, pair.AxisX);
            Assert.AreEqual(0, pair.ChildX); // 子ぷよは左隣
        }
    }
}
