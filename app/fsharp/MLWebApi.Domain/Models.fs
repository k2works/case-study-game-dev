namespace MLWebApi.Domain

/// API リクエスト/レスポンスモデル
module Models =
    // Iris 予測リクエスト
    type IrisPredictRequest =
        { SepalLength: float32
          SepalWidth: float32
          PetalLength: float32
          PetalWidth: float32 }

    // Iris 予測レスポンス
    type IrisPredictResponse =
        { PredictedSpecies: string
          Confidence: float32 }

    // Cinema 予測リクエスト
    type CinemaPredictRequest =
        { SNS1: float32
          SNS2: float32
          Actor: float32
          Original: float32 }

    // Cinema 予測レスポンス
    type CinemaPredictResponse = { PredictedSales: float32 }

    // Survived 予測リクエスト
    type SurvivedPredictRequest =
        { Pclass: float32
          Sex: string
          Age: float32 }

    // Survived 予測レスポンス
    type SurvivedPredictResponse =
        { Survived: bool
          Probability: float32 }

    // Boston 予測リクエスト
    type BostonPredictRequest =
        { CRIME: string
          RM: float32
          LSTAT: float32
          PTRATIO: float32 }

    // Boston 予測レスポンス
    type BostonPredictResponse = { PredictedPrice: float32 }
