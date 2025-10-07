import { describe, it, expect } from 'vitest';

describe('環境構築確認', () => {
  it('テストが実行できる', () => {
    expect(true).toBe(true);
  });

  it('簡単な計算が正しい', () => {
    expect(1 + 1).toBe(2);
  });
});
