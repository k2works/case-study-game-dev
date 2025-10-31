import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { MLApiServer } from '../src/api/app';
import type { FastifyInstance } from 'fastify';

describe('ML API Server', () => {
  let server: MLApiServer;
  let app: FastifyInstance;

  beforeAll(async () => {
    server = new MLApiServer();
    await server.initialize();
    app = server.getApp();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe('Health Check', () => {
    it('GET /health should return OK status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });
  });

  describe('Swagger Documentation', () => {
    it('GET /docs should return Swagger UI', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/docs',
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('GET /docs/json should return OpenAPI spec', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/docs/json',
      });

      expect(response.statusCode).toBe(200);
      const spec = JSON.parse(response.body);
      expect(spec.openapi).toBeDefined();
      expect(spec.info.title).toBe('ML Prediction API');
      expect(spec.paths).toBeDefined();
    });
  });

  describe('Iris API', () => {
    it('POST /api/iris/predict で Setosa を予測できる', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/iris/predict',
        payload: {
          sepal_length: 5.1,
          sepal_width: 3.5,
          petal_length: 1.4,
          petal_width: 0.2,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.species).toBe('setosa');
    });

    it('POST /api/iris/predict で Versicolor を予測できる', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/iris/predict',
        payload: {
          sepal_length: 6.0,
          sepal_width: 2.7,
          petal_length: 5.1,
          petal_width: 1.6,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.species).toBe('versicolor');
    });

    it('POST /api/iris/predict で Virginica を予測できる', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/iris/predict',
        payload: {
          sepal_length: 6.5,
          sepal_width: 3.0,
          petal_length: 5.5,
          petal_width: 1.8,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.species).toBe('virginica');
    });

    it('POST /api/iris/predict で無効なリクエストはエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/iris/predict',
        payload: {
          sepal_length: -1, // 負の値は無効
          sepal_width: 3.5,
          petal_length: 1.4,
          petal_width: 0.2,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
      expect(body.details).toBeDefined();
    });
  });

  describe('Cinema API', () => {
    it('POST /api/cinema/predict で売上を予測できる', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/cinema/predict',
        payload: {
          sns1: 500,
          sns2: 300,
          actor: 70,
          original: 1,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.predicted_sales).toBeGreaterThan(0);
      expect(typeof body.predicted_sales).toBe('number');
    });

    it('POST /api/cinema/predict で無効なリクエストはエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/cinema/predict',
        payload: {
          sns1: 500,
          sns2: 300,
          actor: 150, // 範囲外 (0-100)
          original: 1,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
    });
  });

  describe('Survived API', () => {
    it('POST /api/survived/predict で生存予測できる', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/survived/predict',
        payload: {
          pclass: 1,
          age: 35,
          sex: 'female',
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect([0, 1]).toContain(body.survived);
    });

    it('POST /api/survived/predict で無効な性別はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/survived/predict',
        payload: {
          pclass: 1,
          age: 35,
          sex: 'unknown', // 無効な性別
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
    });

    it('POST /api/survived/predict で無効な客室クラスはエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/survived/predict',
        payload: {
          pclass: 5, // 範囲外 (1-3)
          age: 35,
          sex: 'male',
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
    });
  });

  describe('Boston API', () => {
    it('POST /api/boston/predict で住宅価格を予測できる', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/boston/predict',
        payload: {
          rm: 6.5,
          lstat: 4.98,
          ptratio: 15.3,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.predicted_price).toBeGreaterThan(0);
      expect(typeof body.predicted_price).toBe('number');
    });

    it('POST /api/boston/predict で無効な部屋数はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/boston/predict',
        payload: {
          rm: 0, // 正の数でない
          lstat: 4.98,
          ptratio: 15.3,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
    });

    it('POST /api/boston/predict で無効な lstat はエラーを返す', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/boston/predict',
        payload: {
          rm: 6.5,
          lstat: 150, // 範囲外 (0-100)
          ptratio: 15.3,
        },
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
    });
  });
});
