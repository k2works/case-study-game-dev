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
