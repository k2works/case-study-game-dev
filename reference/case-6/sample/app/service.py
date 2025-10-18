from src.api.domain import Boston, Cinema, Iris, Survived


class Service:
    def __init__(self) -> None:
        pass

    def predict_iris(self, x):
        iris = Iris()
        return iris.predict(x)

    def predict_cinema(self, x):
        cinema = Cinema()
        return cinema.predict(x)

    def predict_survived(self, x):
        servived = Survived()
        return servived.predict(x)

    def predict_boston(self, rm, lstat, ptratio):
        boston = Boston()
        return boston.predict(rm, lstat, ptratio)
