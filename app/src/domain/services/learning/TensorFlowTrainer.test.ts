import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type ModelArchitecture,
  TensorFlowTrainer,
  type TrainingConfig,
} from './TensorFlowTrainer'

// TensorFlow.jsのモック
vi.mock('@tensorflow/tfjs', () => ({
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    fit: vi.fn(() =>
      Promise.resolve({
        history: {
          loss: [0.5, 0.3, 0.2],
          val_loss: [0.6, 0.4, 0.3],
          accuracy: [0.7, 0.8, 0.9],
          val_accuracy: [0.65, 0.75, 0.85],
        },
      }),
    ),
    evaluate: vi.fn(() => Promise.resolve([
      { data: vi.fn(() => Promise.resolve([0.2])) },
      { data: vi.fn(() => Promise.resolve([0.9])) }
    ])),
    predict: vi.fn(() => ({
      dataSync: () => [0.1, 0.9],
    })),
    save: vi.fn(() => Promise.resolve()),
    summary: vi.fn(),
    dispose: vi.fn(),
  })),
  layers: {
    dense: vi.fn(() => ({ name: 'dense_layer' })),
    dropout: vi.fn(() => ({ name: 'dropout_layer' })),
    conv2d: vi.fn(() => ({ name: 'conv2d_layer' })),
    maxPooling2d: vi.fn(() => ({ name: 'maxPooling2d_layer' })),
    flatten: vi.fn(() => ({ name: 'flatten_layer' })),
  },
  tensor2d: vi.fn((data) => ({
    shape: [data.length, data[0].length],
    dispose: vi.fn(),
    dataSync: () => data.flat(),
  })),
  tensor1d: vi.fn((data) => ({
    shape: [data.length],
    dispose: vi.fn(),
    dataSync: () => data,
  })),
  split: vi.fn(() => []),
  loadLayersModel: vi.fn(() =>
    Promise.resolve({
      predict: vi.fn(() => ({
        dataSync: () => [0.1, 0.9, 0.3, 0.7],
      })),
      evaluate: vi.fn(() => Promise.resolve([0.2, 0.9])),
    }),
  ),
  dispose: vi.fn(),
  train: {
    adam: vi.fn(() => ({ name: 'adam_optimizer' })),
  },
}))

describe('TensorFlowTrainer', () => {
  let trainer: TensorFlowTrainer

  const sampleTrainingData = {
    features: [
      [0.5, 0.2, 0.6, 0.33, 0.25, 0.25, 0.25, 0.25],
      [0.4, 0.3, 0.7, 0.5, 0.3, 0.2, 0.3, 0.2],
    ],
    rewards: [1.0, 0.8],
  }

  const sampleValidationData = {
    features: [
      [0.6, 0.4, 0.5, 0.2, 0.3, 0.3, 0.2, 0.2],
      [0.3, 0.5, 0.8, 0.4, 0.2, 0.4, 0.2, 0.2],
    ],
    rewards: [0.9, 0.7],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    trainer = new TensorFlowTrainer()
  })

  describe('基本機能', () => {
    it('トレーナーが正しく初期化される', () => {
      expect(trainer).toBeDefined()
      expect(typeof trainer.createModel).toBe('function')
      expect(typeof trainer.trainModel).toBe('function')
      expect(typeof trainer.evaluateModel).toBe('function')
    })

    it('Denseモデルを作成できる', () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 64, activation: 'relu' },
          { type: 'dropout', rate: 0.3 },
          { type: 'dense', units: 32, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      // Act
      const model = trainer.createModel(architecture)

      // Assert
      expect(model).toBeDefined()
      expect(model.add).toHaveBeenCalledTimes(4)
      expect(model.compile).toHaveBeenCalled()
    })

    it('CNNモデルを作成できる', () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'cnn',
        inputShape: [6, 13, 1], // フィールドサイズ (幅x高さxチャンネル)
        layers: [
          { type: 'conv2d', filters: 32, kernelSize: 3, activation: 'relu' },
          { type: 'maxPooling2d', poolSize: 2 },
          { type: 'conv2d', filters: 64, kernelSize: 3, activation: 'relu' },
          { type: 'flatten' },
          { type: 'dense', units: 64, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      // Act
      const model = trainer.createModel(architecture)

      // Assert
      expect(model).toBeDefined()
      expect(model.add).toHaveBeenCalledTimes(6)
      expect(model.compile).toHaveBeenCalled()
    })

    it('モデルを学習できる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 32, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const config: TrainingConfig = {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2,
        learningRate: 0.001,
        verbose: 0,
      }

      const model = trainer.createModel(architecture)

      // Act
      const result = await trainer.trainModel(
        model,
        sampleTrainingData,
        sampleValidationData,
        config,
      )

      // Assert
      expect(result).toBeDefined()
      expect(result.history).toBeDefined()
      expect(result.trainLoss).toBeGreaterThanOrEqual(0)
      expect(result.trainAccuracy).toBeGreaterThanOrEqual(0)
      expect(result.validationLoss).toBeGreaterThanOrEqual(0)
      expect(result.validationAccuracy).toBeGreaterThanOrEqual(0)
      expect(model.fit).toHaveBeenCalled()
    })
  })

  describe('モデル評価', () => {
    it('モデルを評価できる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const model = trainer.createModel(architecture)

      // Act
      const result = await trainer.evaluateModel(model, sampleValidationData)

      // Assert
      expect(result).toBeDefined()
      expect(result.loss).toBeGreaterThanOrEqual(0)
      expect(result.accuracy).toBeGreaterThanOrEqual(0)
      expect(result.accuracy).toBeLessThanOrEqual(1)
      expect(model.evaluate).toHaveBeenCalled()
    })

    it('モデルで予測できる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const model = trainer.createModel(architecture)
      const features = sampleTrainingData.features

      // Act
      const predictions = trainer.predict(model, features)

      // Assert
      expect(predictions).toBeDefined()
      expect(Array.isArray(predictions)).toBe(true)
      expect(predictions.length).toBeGreaterThan(0)
      predictions.forEach((pred) => {
        expect(pred).toBeGreaterThanOrEqual(0)
        expect(pred).toBeLessThanOrEqual(1)
      })
      expect(model.predict).toHaveBeenCalled()
    })
  })

  describe('モデル保存・読み込み', () => {
    it('モデルを保存できる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const model = trainer.createModel(architecture)
      const savePath = 'indexeddb://puyo-ai-model'

      // Act
      await trainer.saveModel(model, savePath)

      // Assert
      expect(model.save).toHaveBeenCalledWith(savePath)
    })

    it('モデルを読み込みできる', async () => {
      // Arrange
      const modelPath = 'indexeddb://puyo-ai-model'

      // Act
      const model = await trainer.loadModel(modelPath)

      // Assert
      expect(model).toBeDefined()
      expect(model.predict).toBeDefined()
      expect(model.evaluate).toBeDefined()
    })

    it('不正なパスでモデル読み込みエラーを処理する', async () => {
      // Arrange
      const invalidPath = 'invalid://path'
      const { loadLayersModel } = await import('@tensorflow/tfjs')
      vi.mocked(loadLayersModel).mockRejectedValueOnce(
        new Error('Model not found'),
      )

      // Act & Assert
      await expect(trainer.loadModel(invalidPath)).rejects.toThrow(
        'Failed to load model',
      )
    })
  })

  describe('クロスバリデーション', () => {
    it('k-foldクロスバリデーションを実行できる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const config: TrainingConfig = {
        epochs: 3,
        batchSize: 16,
        validationSplit: 0,
        learningRate: 0.001,
        verbose: 0,
      }

      const data = {
        features: [
          ...sampleTrainingData.features,
          ...sampleValidationData.features,
        ],
        rewards: [
          ...sampleTrainingData.rewards,
          ...sampleValidationData.rewards,
        ],
      }

      // Act
      const results = await trainer.crossValidate(architecture, data, config, 3)

      // Assert
      expect(results).toBeDefined()
      expect(results.foldResults).toHaveLength(3)
      expect(results.meanAccuracy).toBeGreaterThanOrEqual(0)
      expect(results.meanAccuracy).toBeLessThanOrEqual(1)
      expect(results.stdAccuracy).toBeGreaterThanOrEqual(0)
      expect(results.meanLoss).toBeGreaterThanOrEqual(0)
      expect(results.stdLoss).toBeGreaterThanOrEqual(0)

      results.foldResults.forEach((fold, index) => {
        expect(fold.fold).toBe(index + 1)
        expect(fold.trainLoss).toBeGreaterThanOrEqual(0)
        expect(fold.trainAccuracy).toBeGreaterThanOrEqual(0)
        expect(fold.validationLoss).toBeGreaterThanOrEqual(0)
        expect(fold.validationAccuracy).toBeGreaterThanOrEqual(0)
      })
    })
  })

  describe('エラーハンドリング', () => {
    it('無効なアーキテクチャでエラーを投げる', () => {
      // Arrange
      const invalidArchitecture = {
        type: 'invalid' as ModelArchitecture['type'],
        inputShape: [8],
        layers: [{ type: 'dense', units: 10, activation: 'relu' }],
      }

      // Act & Assert
      expect(() => trainer.createModel(invalidArchitecture)).toThrow(
        'Unsupported model type',
      )
    })

    it('空のレイヤー配列でエラーを投げる', () => {
      // Arrange
      const emptyArchitecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [],
      }

      // Act & Assert
      expect(() => trainer.createModel(emptyArchitecture)).toThrow(
        'Model must have at least one layer',
      )
    })

    it('無効な学習データでエラーを投げる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const config: TrainingConfig = {
        epochs: 1,
        batchSize: 32,
        validationSplit: 0.2,
        learningRate: 0.001,
        verbose: 0,
      }

      const model = trainer.createModel(architecture)
      const emptyData = { features: [], rewards: [] }

      // Act & Assert
      await expect(
        trainer.trainModel(model, emptyData, emptyData, config),
      ).rejects.toThrow('Training data cannot be empty')
    })

    it('特徴量と報酬の数が一致しない場合エラーを投げる', async () => {
      // Arrange
      const architecture: ModelArchitecture = {
        type: 'dense',
        inputShape: [8],
        layers: [
          { type: 'dense', units: 16, activation: 'relu' },
          { type: 'dense', units: 1, activation: 'sigmoid' },
        ],
      }

      const config: TrainingConfig = {
        epochs: 1,
        batchSize: 32,
        validationSplit: 0.2,
        learningRate: 0.001,
        verbose: 0,
      }

      const model = trainer.createModel(architecture)
      const mismatchedData = {
        features: [[0.5, 0.2, 0.6, 0.33, 0.25, 0.25, 0.25, 0.25]],
        rewards: [1.0, 0.8], // 特徴量は1つだが報酬は2つ
      }

      // Act & Assert
      await expect(
        trainer.trainModel(model, mismatchedData, sampleValidationData, config),
      ).rejects.toThrow('Features and rewards must have the same length')
    })
  })

  describe('データ前処理', () => {
    it('学習データを正しくテンソルに変換する', () => {
      // Arrange
      const data = {
        features: [
          [0.1, 0.2, 0.3],
          [0.4, 0.5, 0.6],
        ],
        rewards: [0.8, 0.9],
      }

      // Act
      const { featureTensor, rewardTensor } = trainer.prepareTrainingData(data)

      // Assert
      expect(featureTensor).toBeDefined()
      expect(rewardTensor).toBeDefined()
      expect(featureTensor.shape).toEqual([2, 3])
      expect(rewardTensor.shape).toEqual([2])
    })

    it('テンソルリソースを適切に解放する', () => {
      // Arrange
      const data = {
        features: [
          [0.1, 0.2, 0.3],
          [0.4, 0.5, 0.6],
        ],
        rewards: [0.8, 0.9],
      }

      // Act
      const { featureTensor, rewardTensor } = trainer.prepareTrainingData(data)
      trainer.disposeTensors([featureTensor, rewardTensor])

      // Assert
      expect(featureTensor.dispose).toHaveBeenCalled()
      expect(rewardTensor.dispose).toHaveBeenCalled()
    })
  })
})
