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

    [<CLIMutable>]
    type BostonData =
        { [<LoadColumn(0)>]
          CRIME: string

          [<LoadColumn(5)>]
          RM: float32

          [<LoadColumn(10)>]
          PTRATIO: float32

          [<LoadColumn(12)>]
          LSTAT: float32

          [<LoadColumn(13)>]
          PRICE: float32 }

    [<CLIMutable>]
    type BostonFeatures =
        { RM: float32
          LSTAT: float32
          PTRATIO: float32
          RM2: float32
          LSTAT2: float32
          PTRATIO2: float32

          [<ColumnName("RM_x_LSTAT")>]
          RMxLSTAT: float32

          PRICE: float32 }

    [<CLIMutable>]
    type BostonPrediction =
        { [<ColumnName("Score")>]
          Price: float32 }
