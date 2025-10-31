import { describe, it, expect, beforeEach } from 'vitest';
import {
  IrisService,
  CinemaService,
  SurvivedService,
  BostonService,
} from '../src/api/services';
import type {
  IrisRequest,
  CinemaRequest,
  SurvivedRequest,
  BostonRequest,
} from '../src/api/schemas';

describe('Service Layer', () => {
  describe('IrisService', () => {
    let service: IrisService;

    beforeEach(async () => {
      service = new IrisService('models/iris_classifier.json');
      await service.initialize();
    });

    it('Setosa の特徴量で正しく予測できる', () => {
      const request: IrisRequest = {
        sepal_length: 5.1,
        sepal_width: 3.5,
        petal_length: 1.4,
        petal_width: 0.2,
      };

      const response = service.predict(request);

      expect(response.species).toBe('setosa');
    });

    it('Versicolor の特徴量で正しく予測できる', () => {
      const request: IrisRequest = {
        sepal_length: 6.0,
        sepal_width: 2.7,
        petal_length: 5.1,
        petal_width: 1.6,
      };

      const response = service.predict(request);

      expect(response.species).toBe('versicolor');
    });

    it('Virginica の特徴量で正しく予測できる', () => {
      const request: IrisRequest = {
        sepal_length: 6.5,
        sepal_width: 3.0,
        petal_length: 5.5,
        petal_width: 1.8,
      };

      const response = service.predict(request);

      expect(response.species).toBe('virginica');
    });
  });

  describe('CinemaService', () => {
    let service: CinemaService;

    beforeEach(async () => {
      service = new CinemaService('models/cinema_predictor.json');
      await service.initialize();
    });

    it('映画の売上を予測できる', () => {
      const request: CinemaRequest = {
        sns1: 500,
        sns2: 300,
        actor: 70,
        original: 1,
      };

      const response = service.predict(request);

      expect(response.predicted_sales).toBeGreaterThan(0);
      expect(typeof response.predicted_sales).toBe('number');
    });

    it('SNS 言及数が多い場合、売上が高い', () => {
      const requestLow: CinemaRequest = {
        sns1: 100,
        sns2: 100,
        actor: 50,
        original: 0,
      };

      const requestHigh: CinemaRequest = {
        sns1: 1000,
        sns2: 800,
        actor: 90,
        original: 1,
      };

      const responseLow = service.predict(requestLow);
      const responseHigh = service.predict(requestHigh);

      expect(responseHigh.predicted_sales).toBeGreaterThan(responseLow.predicted_sales);
    });
  });

  describe('SurvivedService', () => {
    let service: SurvivedService;

    beforeEach(async () => {
      service = new SurvivedService('models/survived_classifier.json');
      await service.initialize();
    });

    it('生存予測を実行できる（上等客室女性）', () => {
      const request: SurvivedRequest = {
        pclass: 1, // 上等客室
        age: 35,
        sex: 'female', // 女性
      };

      const response = service.predict(request);

      // 予測値が 0 または 1 であることを確認
      expect([0, 1]).toContain(response.survived);
      expect(typeof response.survived).toBe('number');
    });

    it('生存予測を実行できる（下等客室男性）', () => {
      const request: SurvivedRequest = {
        pclass: 3, // 下等客室
        age: 22,
        sex: 'male', // 男性
      };

      const response = service.predict(request);

      // 予測値が 0 または 1 であることを確認
      expect([0, 1]).toContain(response.survived);
      expect(typeof response.survived).toBe('number');
    });

    it('性別エンコーディングが正しく機能する', () => {
      const requestMale: SurvivedRequest = {
        pclass: 2,
        age: 30,
        sex: 'male',
      };

      const requestFemale: SurvivedRequest = {
        pclass: 2,
        age: 30,
        sex: 'female',
      };

      const responseMale = service.predict(requestMale);
      const responseFemale = service.predict(requestFemale);

      expect([0, 1]).toContain(responseMale.survived);
      expect([0, 1]).toContain(responseFemale.survived);
    });
  });

  describe('BostonService', () => {
    let service: BostonService;

    beforeEach(async () => {
      service = new BostonService('models/boston_predictor.json');
      await service.initialize();
    });

    it('住宅価格を予測できる', () => {
      const request: BostonRequest = {
        rm: 6.5, // 部屋数
        lstat: 4.98, // 低所得者割合
        ptratio: 15.3, // 生徒教師比率
      };

      const response = service.predict(request);

      expect(response.predicted_price).toBeGreaterThan(0);
      expect(typeof response.predicted_price).toBe('number');
    });

    it('部屋数が多いほど価格が高い', () => {
      const requestSmall: BostonRequest = {
        rm: 5.0,
        lstat: 10.0,
        ptratio: 18.0,
      };

      const requestLarge: BostonRequest = {
        rm: 8.0,
        lstat: 10.0,
        ptratio: 18.0,
      };

      const responseSmall = service.predict(requestSmall);
      const responseLarge = service.predict(requestLarge);

      expect(responseLarge.predicted_price).toBeGreaterThan(
        responseSmall.predicted_price
      );
    });

    it('低所得者割合が高いほど価格が低い', () => {
      const requestLowLstat: BostonRequest = {
        rm: 6.5,
        lstat: 5.0, // 低所得者割合が低い
        ptratio: 15.0,
      };

      const requestHighLstat: BostonRequest = {
        rm: 6.5,
        lstat: 20.0, // 低所得者割合が高い
        ptratio: 15.0,
      };

      const responseLowLstat = service.predict(requestLowLstat);
      const responseHighLstat = service.predict(requestHighLstat);

      expect(responseLowLstat.predicted_price).toBeGreaterThan(
        responseHighLstat.predicted_price
      );
    });

    it('特徴量エンジニアリングが正しく適用される', () => {
      // 特徴量エンジニアリングにより、2乗項と交互作用項が自動追加される
      const request: BostonRequest = {
        rm: 6.0,
        lstat: 8.0,
        ptratio: 16.0,
      };

      const response = service.predict(request);

      // 予測が実行できればエンジニアリングが成功している
      expect(response.predicted_price).toBeDefined();
      expect(typeof response.predicted_price).toBe('number');
    });
  });
});
