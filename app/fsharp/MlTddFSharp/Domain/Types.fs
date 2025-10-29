namespace MlTddFSharp.Domain

module Types =
    open Microsoft.ML.Data

    [<CLIMutable>]
    type IrisData =
        { [<LoadColumn(0)>]
          SepalLength: float32

          [<LoadColumn(1)>]
          SepalWidth: float32

          [<LoadColumn(2)>]
          PetalLength: float32

          [<LoadColumn(3)>]
          PetalWidth: float32

          [<LoadColumn(4)>]
          Species: string }

    [<CLIMutable>]
    type IrisPrediction =
        { [<ColumnName("PredictedLabel")>]
          PredictedSpecies: string

          Score: float32[] }

    [<CLIMutable>]
    type CinemaData =
        { [<LoadColumn(0)>]
          CinemaId: int

          [<LoadColumn(1)>]
          SNS1: float32

          [<LoadColumn(2)>]
          SNS2: float32

          [<LoadColumn(3)>]
          Actor: float32

          [<LoadColumn(4)>]
          Original: float32

          [<LoadColumn(5)>]
          Sales: float32 }

    [<CLIMutable>]
    type CinemaPrediction =
        { [<ColumnName("Score")>]
          PredictedSales: float32 }

    [<CLIMutable>]
    type SurvivedData =
        { [<LoadColumn(0)>]
          PassengerId: int

          [<LoadColumn(1)>]
          Survived: bool

          [<LoadColumn(2)>]
          Pclass: float32

          [<LoadColumn(3)>]
          Sex: string

          [<LoadColumn(4)>]
          Age: float32 }

    [<CLIMutable>]
    type SurvivedPrediction =
        { [<ColumnName("PredictedLabel")>]
          Survived: bool

          Score: float32 }
