import { IrisDomain, CinemaDomain, SurvivedDomain, BostonDomain } from './domain';
import {
  IrisRequest,
  IrisResponse,
  CinemaRequest,
  CinemaResponse,
  SurvivedRequest,
  SurvivedResponse,
  BostonRequest,
  BostonResponse,
} from './schemas';

/**
 * Iris 分類サービス
 */
export class IrisService {
  private domain: IrisDomain;

  constructor(modelPath?: string) {
    this.domain = new IrisDomain(modelPath);
  }

  async initialize(): Promise<void> {
    await this.domain.loadModel();
  }

  predict(request: IrisRequest): IrisResponse {
    const features = [
      [
        request.sepal_length,
        request.sepal_width,
        request.petal_length,
        request.petal_width,
      ],
    ];

    const predictions = this.domain.predict(features);
    return { species: predictions[0] };
  }
}

/**
 * Cinema 売上予測サービス
 */
export class CinemaService {
  private domain: CinemaDomain;

  constructor(modelPath?: string) {
    this.domain = new CinemaDomain(modelPath);
  }

  async initialize(): Promise<void> {
    await this.domain.loadModel();
  }

  predict(request: CinemaRequest): CinemaResponse {
    const features = [[request.sns1, request.sns2, request.actor, request.original]];

    const predictions = this.domain.predict(features);
    return { predicted_sales: predictions[0] };
  }
}

/**
 * Survived 生存予測サービス
 */
export class SurvivedService {
  private domain: SurvivedDomain;

  constructor(modelPath?: string) {
    this.domain = new SurvivedDomain(modelPath);
  }

  async initialize(): Promise<void> {
    await this.domain.loadModel();
  }

  predict(request: SurvivedRequest): SurvivedResponse {
    // 性別を数値にエンコード (male=1, female=0)
    const maleEncoded = request.sex === 'male' ? 1 : 0;

    const features = [[request.pclass, request.age, maleEncoded]];

    const predictions = this.domain.predict(features);
    return { survived: predictions[0] };
  }
}

/**
 * Boston 住宅価格予測サービス
 */
export class BostonService {
  private domain: BostonDomain;

  constructor(modelPath?: string) {
    this.domain = new BostonDomain(modelPath);
  }

  async initialize(): Promise<void> {
    await this.domain.loadModel();
  }

  predict(request: BostonRequest): BostonResponse {
    // 特徴量エンジニアリング
    const rm = request.rm;
    const lstat = request.lstat;
    const ptratio = request.ptratio;

    const features = [
      [
        rm,
        lstat,
        ptratio,
        rm ** 2, // RM2
        lstat ** 2, // LSTAT2
        ptratio ** 2, // PTRATIO2
        rm * lstat, // RM_LSTAT
      ],
    ];

    const predictions = this.domain.predict(features);
    return { predicted_price: predictions[0] };
  }
}
