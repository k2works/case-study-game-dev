import { IrisClassifier } from '../models/IrisClassifier';
import { CinemaPredictor } from '../models/CinemaPredictor';
import { SurvivedClassifier } from '../models/SurvivedClassifier';
import { BostonPredictor } from '../models/BostonPredictor';

/**
 * Iris 分類ドメイン
 */
export class IrisDomain {
  private model: IrisClassifier | null = null;
  private modelPath: string;

  constructor(modelPath: string = 'models/iris_classifier.json') {
    this.modelPath = modelPath;
  }

  async loadModel(): Promise<void> {
    try {
      this.model = new IrisClassifier();
      await this.model.load(this.modelPath);
    } catch (error) {
      throw new Error(`Failed to load Iris model: ${error}`);
    }
  }

  predict(features: number[][]): string[] {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    return this.model.predict(features);
  }
}

/**
 * Cinema 売上予測ドメイン
 */
export class CinemaDomain {
  private model: CinemaPredictor | null = null;
  private modelPath: string;

  constructor(modelPath: string = 'models/cinema_predictor.json') {
    this.modelPath = modelPath;
  }

  async loadModel(): Promise<void> {
    try {
      this.model = new CinemaPredictor();
      await this.model.load(this.modelPath);
    } catch (error) {
      throw new Error(`Failed to load Cinema model: ${error}`);
    }
  }

  predict(features: number[][]): number[] {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    return this.model.predict(features);
  }
}

/**
 * Survived 生存予測ドメイン
 */
export class SurvivedDomain {
  private model: SurvivedClassifier | null = null;
  private modelPath: string;

  constructor(modelPath: string = 'models/survived_classifier.json') {
    this.modelPath = modelPath;
  }

  async loadModel(): Promise<void> {
    try {
      this.model = new SurvivedClassifier();
      await this.model.load(this.modelPath);
    } catch (error) {
      throw new Error(`Failed to load Survived model: ${error}`);
    }
  }

  predict(features: number[][]): number[] {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    return this.model.predict(features);
  }
}

/**
 * Boston 住宅価格予測ドメイン
 */
export class BostonDomain {
  private model: BostonPredictor | null = null;
  private modelPath: string;

  constructor(modelPath: string = 'models/boston_predictor.json') {
    this.modelPath = modelPath;
  }

  async loadModel(): Promise<void> {
    try {
      this.model = new BostonPredictor();
      await this.model.load(this.modelPath);
    } catch (error) {
      throw new Error(`Failed to load Boston model: ${error}`);
    }
  }

  predict(features: number[][]): number[] {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    // 特徴量を標準化
    const featuresScaled = this.model.standardizeFeatures(features, false);
    // 予測（標準化されたスケールで）
    const predictionsScaled = this.model.predict(featuresScaled);
    // 元のスケールに戻す
    return this.model.inverseTransformPrediction(predictionsScaled);
  }
}
