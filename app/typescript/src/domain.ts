import { IrisClassifier } from './models/IrisClassifier';
import { CinemaPredictor } from './models/CinemaPredictor';
import { SurvivedClassifier } from './models/SurvivedClassifier';
import { BostonPredictor } from './models/BostonPredictor';

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
 * TODO: BostonPredictor に save/load メソッドを追加後に実装
 */
export class BostonDomain {
  private model: BostonPredictor | null = null;
  // @ts-expect-error - TODO: BostonPredictor に load メソッドを追加後に使用
  private modelPath: string;

  constructor(modelPath: string = 'models/boston_predictor.json') {
    this.modelPath = modelPath;
  }

  async loadModel(): Promise<void> {
    // TODO: BostonPredictor に load メソッドを追加
    throw new Error('BostonDomain.loadModel() is not yet implemented');
    /*
    try {
      this.model = new BostonPredictor();
      await this.model.load(this.modelPath);
    } catch (error) {
      throw new Error(`Failed to load Boston model: ${error}`);
    }
    */
  }

  predict(features: number[][]): number[] {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    return this.model.predict(features);
  }
}
