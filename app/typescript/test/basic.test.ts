/**
 * 基本的な環境確認テスト
 */
import { describe, it, expect } from 'vitest';
import { DataFrame } from 'data-forge';

describe('パッケージインポート確認', () => {
  it('data-forgeが正しくインポートできる', () => {
    expect(DataFrame).toBeDefined();
  });

  it('data-forgeでDataFrameを作成できる', () => {
    const df = new DataFrame([
      { a: 1, b: 2 },
      { a: 3, b: 4 },
    ]);
    expect(df.count()).toBe(2);
  });
});

describe('DataFrameの基本操作', () => {
  it('DataFrameを作成できる', () => {
    const df = new DataFrame([
      { A: 1, B: 4 },
      { A: 2, B: 5 },
      { A: 3, B: 6 },
    ]);

    expect(df.count()).toBe(3); // 3行のデータ
    expect(df.getColumnNames()).toEqual(['A', 'B']); // 列名が正しい
  });

  it('欠損値を検出できる', () => {
    const df = new DataFrame([{ A: 1 }, { A: null }, { A: 3 }]);

    const nullCount = df
      .getSeries('A')
      .where((value) => value === null || value === undefined)
      .count();

    expect(nullCount).toBe(1); // 1つ欠損値がある
  });

  it('欠損値を補完できる', () => {
    const df = new DataFrame([{ A: 1 }, { A: null }, { A: 3 }]);

    // 平均値を計算（nullを除く）
    const validValues = df
      .getSeries('A')
      .where((value) => value !== null && value !== undefined);
    const mean = validValues.average();

    // 欠損値を平均値で埋める
    const filledData = df.toArray().map((row) => ({
      A: row.A === null ? mean : row.A,
    }));
    const filled = new DataFrame(filledData);

    // すべての値が埋められている
    const hasNull = filled
      .getSeries('A')
      .any((value) => value === null || value === undefined);
    expect(hasNull).toBe(false);
  });
});
