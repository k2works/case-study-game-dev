import unittest

from domain import Boston, Iris, Cinema, Survived


class TestIris(unittest.TestCase):

    def test_predict(self):
        iris = Iris()
        x = [[1.4, 2.3, 4.4, 2.3]]
        result = iris.predict(x)
        self.assertEqual(result[0], "Iris-virginica")


class TestCinema(unittest.TestCase):

    def test_predict(self):
        cinema = Cinema()
        x = [[291, 1044, 8808.994, 0]]
        result = cinema.predict(x)
        self.assertEqual(result[0], 9632.416575385569)


class TestSurvived(unittest.TestCase):

    def test_predict(self):
        seruvived = Survived()
        x = [[3, 22, 1, 0, 7.25, 1]]
        result = seruvived.predict(x)
        self.assertEqual(result[0], 0)


class TestBoston(unittest.TestCase):

    def test_predict(self):
        boston = Boston()
        rm = 3.561
        lstat = 7.12
        ptratio = 20.2
        result = boston.predict(rm, lstat, ptratio)
        self.assertEqual(result[0][0], 0.21583895618321347)


if __name__ == '__main__':
    unittest.main()
