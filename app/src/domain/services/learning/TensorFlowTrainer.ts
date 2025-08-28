import * as tf from '@tensorflow/tfjs'

export interface ModelArchitecture {
  type: 'dense' | 'cnn'
  inputShape: number[]
  layers: ModelLayerConfig[]
}

export interface ModelLayerConfig {
  type: 'dense' | 'dropout' | 'conv2d' | 'maxPooling2d' | 'flatten'
  units?: number
  activation?: string
  rate?: number
  filters?: number
  kernelSize?: number
  poolSize?: number
}

export interface TrainingConfig {
  epochs: number
  batchSize: number
  validationSplit: number
  learningRate: number
  verbose: number
}

export interface TrainingData {
  features: number[][]
  rewards: number[]
}

export interface ModelTrainingResult {
  history: {
    loss: number[]
    val_loss: number[]
    accuracy: number[]
    val_accuracy: number[]
  }
  trainLoss: number
  trainAccuracy: number
  validationLoss: number
  validationAccuracy: number
}

export interface ModelEvaluationResult {
  loss: number
  accuracy: number
}

export interface NormalizedFeatures {
  vector: number[]
  metadata: {
    featureNames: string[]
  }
}

export interface CrossValidationResults {
  foldResults: FoldResult[]
  meanAccuracy: number
  stdAccuracy: number
  meanLoss: number
  stdLoss: number
}

export interface FoldResult {
  fold: number
  trainLoss: number
  trainAccuracy: number
  validationLoss: number
  validationAccuracy: number
}

export class TensorFlowTrainer {
  createModel(architecture: ModelArchitecture): tf.Sequential {
    this.validateArchitecture(architecture)

    const model = tf.sequential()

    if (architecture.type === 'dense') {
      this.buildDenseModel(model, architecture)
    } else if (architecture.type === 'cnn') {
      this.buildCNNModel(model, architecture)
    } else {
      throw new Error(`Unsupported model type: ${architecture.type}`)
    }

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['accuracy'],
    })

    return model
  }

  async trainModel(
    model: tf.Sequential,
    trainingData: TrainingData,
    validationData: TrainingData,
    config: TrainingConfig,
  ): Promise<ModelTrainingResult> {
    this.validateTrainingData(trainingData)
    this.validateTrainingData(validationData)

    const { featureTensor, rewardTensor } =
      this.prepareTrainingData(trainingData)
    const { featureTensor: valFeatureTensor, rewardTensor: valRewardTensor } =
      this.prepareTrainingData(validationData)

    try {
      const history = await model.fit(featureTensor, rewardTensor, {
        epochs: config.epochs,
        batchSize: config.batchSize,
        validationData: [valFeatureTensor, valRewardTensor],
        verbose: config.verbose,
      })

      console.log('TensorFlow training completed. History structure:', {
        hasHistory: !!history.history,
        historyKeys: history.history ? Object.keys(history.history) : [],
        lossLength: history.history.loss
          ? (history.history.loss as number[]).length
          : 0,
        accuracyLength: history.history.accuracy
          ? (history.history.accuracy as number[]).length
          : 0,
        valLossLength: history.history.val_loss
          ? (history.history.val_loss as number[]).length
          : 0,
        valAccuracyLength: history.history.val_accuracy
          ? (history.history.val_accuracy as number[]).length
          : 0,
      })

      const trainLoss = this.getLastValue(history.history.loss as number[])
      const trainAccuracy = this.getLastValue(
        history.history.accuracy as number[],
      )
      const validationLoss = this.getLastValue(
        history.history.val_loss as number[],
      )
      const validationAccuracy = this.getLastValue(
        history.history.val_accuracy as number[],
      )

      return {
        history: {
          loss: history.history.loss as number[],
          val_loss: history.history.val_loss as number[],
          accuracy: history.history.accuracy as number[],
          val_accuracy: history.history.val_accuracy as number[],
        },
        trainLoss,
        trainAccuracy,
        validationLoss,
        validationAccuracy,
      }
    } finally {
      this.disposeTensors([
        featureTensor,
        rewardTensor,
        valFeatureTensor,
        valRewardTensor,
      ])
    }
  }

  async evaluateModel(
    model: tf.Sequential,
    data: TrainingData,
  ): Promise<ModelEvaluationResult> {
    this.validateTrainingData(data)

    const { featureTensor, rewardTensor } = this.prepareTrainingData(data)

    try {
      const result = await model.evaluate(featureTensor, rewardTensor)
      const resultArray = Array.isArray(result) ? result : [result]

      const loss = await resultArray[0].data()
      const accuracy =
        resultArray.length > 1 ? await resultArray[1].data() : [0]

      return {
        loss: loss[0],
        accuracy: accuracy[0],
      }
    } finally {
      this.disposeTensors([featureTensor, rewardTensor])
    }
  }

  predict(model: tf.Sequential, features: number[][]): number[] {
    const featureTensor = tf.tensor2d(features)

    try {
      const predictions = model.predict(featureTensor) as tf.Tensor
      const predictionData = predictions.dataSync()

      return Array.from(predictionData)
    } finally {
      featureTensor.dispose()
    }
  }

  async saveModel(model: tf.Sequential, path: string): Promise<void> {
    await model.save(path)
  }

  async loadModel(path: string): Promise<tf.LayersModel> {
    try {
      return await tf.loadLayersModel(path)
    } catch (error) {
      throw new Error(`Failed to load model: ${(error as Error).message}`)
    }
  }

  async crossValidate(
    architecture: ModelArchitecture,
    data: TrainingData,
    config: TrainingConfig,
    kFolds: number,
  ): Promise<CrossValidationResults> {
    const foldSize = Math.floor(data.features.length / kFolds)
    const foldResults: FoldResult[] = []

    for (let fold = 0; fold < kFolds; fold++) {
      const { trainData, validationData } = this.createFold(
        data,
        fold,
        foldSize,
      )

      const model = this.createModel(architecture)
      const result = await this.trainModel(
        model,
        trainData,
        validationData,
        config,
      )

      foldResults.push({
        fold: fold + 1,
        trainLoss: result.trainLoss,
        trainAccuracy: result.trainAccuracy,
        validationLoss: result.validationLoss,
        validationAccuracy: result.validationAccuracy,
      })

      model.dispose()
    }

    return this.calculateCrossValidationStats(foldResults)
  }

  prepareTrainingData(data: TrainingData): {
    featureTensor: tf.Tensor2D
    rewardTensor: tf.Tensor1D
  } {
    const featureTensor = tf.tensor2d(data.features)
    const rewardTensor = tf.tensor1d(data.rewards)

    return { featureTensor, rewardTensor }
  }

  disposeTensors(tensors: tf.Tensor[]): void {
    tensors.forEach((tensor) => tensor.dispose())
  }

  private validateArchitecture(architecture: ModelArchitecture): void {
    if (architecture.type !== 'dense' && architecture.type !== 'cnn') {
      throw new Error(`Unsupported model type: ${architecture.type}`)
    }

    if (architecture.layers.length === 0) {
      throw new Error('Model must have at least one layer')
    }
  }

  private buildDenseModel(
    model: tf.Sequential,
    architecture: ModelArchitecture,
  ): void {
    architecture.layers.forEach((layerConfig, index) => {
      if (layerConfig.type === 'dense') {
        const layer = tf.layers.dense({
          units: layerConfig.units!,
          activation: layerConfig.activation as
            | 'relu'
            | 'sigmoid'
            | 'softmax'
            | undefined,
          inputShape: index === 0 ? architecture.inputShape : undefined,
        })
        model.add(layer)
      } else if (layerConfig.type === 'dropout') {
        const layer = tf.layers.dropout({ rate: layerConfig.rate! })
        model.add(layer)
      }
    })
  }

  private buildCNNModel(
    model: tf.Sequential,
    architecture: ModelArchitecture,
  ): void {
    architecture.layers.forEach((layerConfig, index) => {
      this.addCNNLayer(
        model,
        layerConfig,
        index === 0 ? architecture.inputShape : undefined,
      )
    })
  }

  private addCNNLayer(
    model: tf.Sequential,
    layerConfig: ModelLayerConfig,
    inputShape?: number[],
  ): void {
    if (layerConfig.type === 'conv2d') {
      this.addConv2dLayer(model, layerConfig, inputShape)
    } else if (layerConfig.type === 'maxPooling2d') {
      this.addMaxPooling2dLayer(model, layerConfig)
    } else if (layerConfig.type === 'flatten') {
      model.add(tf.layers.flatten())
    } else if (layerConfig.type === 'dense') {
      this.addDenseLayerToCNN(model, layerConfig)
    }
  }

  private addConv2dLayer(
    model: tf.Sequential,
    layerConfig: ModelLayerConfig,
    inputShape?: number[],
  ): void {
    const layer = tf.layers.conv2d({
      filters: layerConfig.filters!,
      kernelSize: layerConfig.kernelSize!,
      activation: layerConfig.activation as
        | 'relu'
        | 'sigmoid'
        | 'softmax'
        | undefined,
      inputShape,
    })
    model.add(layer)
  }

  private addMaxPooling2dLayer(
    model: tf.Sequential,
    layerConfig: ModelLayerConfig,
  ): void {
    const layer = tf.layers.maxPooling2d({
      poolSize: layerConfig.poolSize!,
    })
    model.add(layer)
  }

  private addDenseLayerToCNN(
    model: tf.Sequential,
    layerConfig: ModelLayerConfig,
  ): void {
    const layer = tf.layers.dense({
      units: layerConfig.units!,
      activation: layerConfig.activation as
        | 'relu'
        | 'sigmoid'
        | 'softmax'
        | undefined,
    })
    model.add(layer)
  }

  private validateTrainingData(data: TrainingData): void {
    if (data.features.length === 0) {
      throw new Error('Training data cannot be empty')
    }

    if (data.features.length !== data.rewards.length) {
      throw new Error('Features and rewards must have the same length')
    }
  }

  private getLastValue(values: number[]): number {
    if (!values || !Array.isArray(values) || values.length === 0) {
      console.warn('getLastValue: Invalid or empty values array:', values)
      return 0
    }
    return values[values.length - 1] || 0
  }

  private createFold(
    data: TrainingData,
    fold: number,
    foldSize: number,
  ): { trainData: TrainingData; validationData: TrainingData } {
    const start = fold * foldSize
    const end = Math.min(start + foldSize, data.features.length)

    const validationFeatures = data.features.slice(start, end)
    const validationRewards = data.rewards.slice(start, end)

    const trainFeatures = [
      ...data.features.slice(0, start),
      ...data.features.slice(end),
    ]
    const trainRewards = [
      ...data.rewards.slice(0, start),
      ...data.rewards.slice(end),
    ]

    return {
      trainData: { features: trainFeatures, rewards: trainRewards },
      validationData: {
        features: validationFeatures,
        rewards: validationRewards,
      },
    }
  }

  private calculateCrossValidationStats(
    foldResults: FoldResult[],
  ): CrossValidationResults {
    const accuracies = foldResults.map((result) => result.validationAccuracy)
    const losses = foldResults.map((result) => result.validationLoss)

    const meanAccuracy = this.calculateMean(accuracies)
    const stdAccuracy = this.calculateStandardDeviation(
      accuracies,
      meanAccuracy,
    )
    const meanLoss = this.calculateMean(losses)
    const stdLoss = this.calculateStandardDeviation(losses, meanLoss)

    return {
      foldResults,
      meanAccuracy,
      stdAccuracy,
      meanLoss,
      stdLoss,
    }
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    const variance =
      values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      values.length
    return Math.sqrt(variance)
  }
}
