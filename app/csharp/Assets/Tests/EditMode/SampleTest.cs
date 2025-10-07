using NUnit.Framework;

namespace PuyoPuyo.Tests
{
    public class SampleTest
    {
        [Test]
        public void TestExample()
        {
            // Arrange（準備）
            int expected = 4;

            // Act（実行）
            int actual = 2 + 2;

            // Assert（検証）
            Assert.AreEqual(expected, actual);
        }
    }
}
