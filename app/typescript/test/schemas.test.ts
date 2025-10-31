import { describe, it, expect } from 'vitest';
import {
  IrisRequestSchema,
  CinemaRequestSchema,
  SurvivedRequestSchema,
  BostonRequestSchema,
} from '../src/api/schemas';

describe('Request Schemas', () => {
  describe('IrisRequestSchema', () => {
    it('正常な Iris リクエストを検証できる', () => {
      const validData = {
        sepal_length: 5.1,
        sepal_width: 3.5,
        petal_length: 1.4,
        petal_width: 0.2,
      };

      const result = IrisRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('負の値を拒否する', () => {
      const invalidData = {
        sepal_length: -1.0,
        sepal_width: 3.5,
        petal_length: 1.4,
        petal_width: 0.2,
      };

      const result = IrisRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('必須フィールドが欠けている場合エラーを返す', () => {
      const invalidData = {
        sepal_length: 5.1,
        sepal_width: 3.5,
        // petal_length と petal_width が欠けている
      };

      const result = IrisRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('CinemaRequestSchema', () => {
    it('正常な Cinema リクエストを検証できる', () => {
      const validData = {
        sns1: 500,
        sns2: 300,
        actor: 70,
        original: 1,
      };

      const result = CinemaRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('actor が範囲外の場合エラーを返す', () => {
      const invalidData = {
        sns1: 500,
        sns2: 300,
        actor: 150, // 100 を超える
        original: 1,
      };

      const result = CinemaRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('original が 0 または 1 以外の場合エラーを返す', () => {
      const invalidData = {
        sns1: 500,
        sns2: 300,
        actor: 70,
        original: 2, // 0 または 1 のみ有効
      };

      const result = CinemaRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('SurvivedRequestSchema', () => {
    it('正常な Survived リクエストを検証できる', () => {
      const validData = {
        pclass: 3,
        age: 22,
        sex: 'male',
      };

      const result = SurvivedRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('sex が male/female 以外の場合エラーを返す', () => {
      const invalidData = {
        pclass: 1,
        age: 30,
        sex: 'unknown',
      };

      const result = SurvivedRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('pclass が範囲外の場合エラーを返す', () => {
      const invalidData = {
        pclass: 5, // 1-3 のみ有効
        age: 30,
        sex: 'female',
      };

      const result = SurvivedRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('age が範囲外の場合エラーを返す', () => {
      const invalidData = {
        pclass: 1,
        age: 150, // 0-100 のみ有効
        sex: 'male',
      };

      const result = SurvivedRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('BostonRequestSchema', () => {
    it('正常な Boston リクエストを検証できる', () => {
      const validData = {
        rm: 6.5,
        lstat: 4.98,
        ptratio: 15.3,
      };

      const result = BostonRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('lstat が範囲外の場合エラーを返す', () => {
      const invalidData = {
        rm: 6.5,
        lstat: 150, // 100% を超える
        ptratio: 15.3,
      };

      const result = BostonRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rm が負の値の場合エラーを返す', () => {
      const invalidData = {
        rm: -1.0,
        lstat: 4.98,
        ptratio: 15.3,
      };

      const result = BostonRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('ptratio が負の値の場合エラーを返す', () => {
      const invalidData = {
        rm: 6.5,
        lstat: 4.98,
        ptratio: -1.0,
      };

      const result = BostonRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
