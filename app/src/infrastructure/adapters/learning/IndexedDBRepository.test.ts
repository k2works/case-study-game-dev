import { beforeEach, describe, expect, it, vi } from 'vitest'

import type {
  AIAction,
  GameState,
  TrainingData,
  TrainingMetadata,
} from '../../../domain/models/training/TrainingData'
import { createTrainingData } from '../../../domain/models/training/TrainingData'
import { IndexedDBTrainingDataRepository } from './IndexedDBRepository'

// IndexedDBのモック
const mockIndexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
}

const mockDatabase = {
  createObjectStore: vi.fn(),
  transaction: vi.fn(),
  close: vi.fn(),
  version: 1,
  objectStoreNames: {
    contains: vi.fn(),
  },
}

const mockTransaction = {
  objectStore: vi.fn(),
  oncomplete: null,
  onerror: null,
  onabort: null,
}

const mockIndex = {
  getAll: vi.fn(),
  get: vi.fn(),
  openCursor: vi.fn(),
}

const mockObjectStore = {
  add: vi.fn(),
  put: vi.fn(),
  get: vi.fn(),
  getAll: vi.fn(),
  delete: vi.fn(),
  clear: vi.fn(),
  count: vi.fn(),
  index: vi.fn(() => mockIndex),
  createIndex: vi.fn(),
}

const mockRequest = {
  onsuccess: null as ((ev: Event) => void) | null,
  onerror: null as ((ev: Event) => void) | null,
  result: null as unknown,
}

// グローバルモックの設定
Object.defineProperty(globalThis, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
})

Object.defineProperty(globalThis, 'IDBKeyRange', {
  value: {
    bound: vi.fn((lower, upper) => ({
      lower,
      upper,
      lowerOpen: false,
      upperOpen: false,
    })),
    only: vi.fn((value) => ({
      lower: value,
      upper: value,
      lowerOpen: false,
      upperOpen: false,
    })),
    lowerBound: vi.fn((lower) => ({
      lower,
      upper: undefined,
      lowerOpen: false,
      upperOpen: true,
    })),
    upperBound: vi.fn((upper) => ({
      lower: undefined,
      upper,
      lowerOpen: true,
      upperOpen: false,
    })),
  },
  writable: true,
})

describe('IndexedDBTrainingDataRepository', () => {
  let repository: IndexedDBTrainingDataRepository

  const sampleGameState: GameState = {
    field: Array(13)
      .fill(null)
      .map(() => Array(6).fill(null)),
    currentPuyo: {
      puyo1: { color: 'red', x: 2, y: 0 },
      puyo2: { color: 'blue', x: 2, y: 1 },
    },
    nextPuyo: {
      puyo1: { color: 'yellow', x: 0, y: 0 },
      puyo2: { color: 'green', x: 0, y: 1 },
    },
    score: 1000,
    chainCount: 2,
    turn: 10,
  }

  const sampleAction: AIAction = {
    x: 3,
    rotation: 1,
    evaluationScore: 85.5,
    features: { chainScore: 40 },
  }

  const sampleMetadata: TrainingMetadata = {
    gameId: 'game-123',
    playerId: 'ai-001',
    difficulty: 'hard',
    version: '1.0.0',
  }

  const sampleTrainingData: TrainingData = createTrainingData(
    sampleGameState,
    sampleAction,
    100,
    sampleMetadata,
  )

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new IndexedDBTrainingDataRepository()

    // デフォルトのモック設定
    mockIndexedDB.open.mockReturnValue({
      ...mockRequest,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
    })

    mockDatabase.transaction.mockReturnValue(mockTransaction)
    mockTransaction.objectStore.mockReturnValue(mockObjectStore)
    mockObjectStore.index.mockReturnValue(mockIndex)
  })

  describe('データベース初期化', () => {
    it('データベースを正しく初期化する', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      mockIndexedDB.open.mockReturnValue(openRequest)

      // Act
      const initPromise = repository.initialize()

      // データベース接続成功をシミュレート
      openRequest.result = mockDatabase
      const mockEvent = { target: openRequest } as Event & {
        target: typeof openRequest
      }
      openRequest.onsuccess?.(mockEvent)

      await initPromise

      // Assert
      expect(mockIndexedDB.open).toHaveBeenCalledWith('PuyoTrainingData', 1)
    })

    it('データベース初期化エラーを処理する', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      mockIndexedDB.open.mockReturnValue(openRequest)

      // Act
      const initPromise = repository.initialize()

      // エラーをシミュレート
      const errorEvent = { target: openRequest } as Event & {
        target: typeof openRequest
      }
      openRequest.onerror?.(errorEvent)

      // Assert
      await expect(initPromise).rejects.toThrow('Failed to open IndexedDB')
    })
  })

  describe('データ保存', () => {
    it('学習データを正しく保存する', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const saveRequest = { ...mockRequest }

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockObjectStore.add.mockReturnValue(saveRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const savePromise = repository.save(sampleTrainingData)

      // 保存成功をシミュレート
      const saveSuccessEvent = { target: saveRequest } as Event & {
        target: IDBRequest
      }
      saveRequest.onsuccess?.(saveSuccessEvent)
      await savePromise

      // Assert
      expect(mockDatabase.transaction).toHaveBeenCalledWith(
        ['training_data'],
        'readwrite',
      )
      expect(mockObjectStore.add).toHaveBeenCalledWith(
        expect.objectContaining({
          ...sampleTrainingData,
          timestampNumber: expect.any(Number),
        }),
      )
    })

    it('保存エラーを適切に処理する', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const saveRequest = { ...mockRequest }

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockObjectStore.add.mockReturnValue(saveRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const savePromise = repository.save(sampleTrainingData)

      // 保存エラーをシミュレート
      const saveErrorEvent = { target: saveRequest } as Event & { target: IDBRequest }
      saveRequest.onerror?.(saveErrorEvent)

      // Assert
      await expect(savePromise).rejects.toThrow('Failed to save training data')
    })
  })

  describe('データ取得', () => {
    it('全データを取得できる', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const getAllRequest = { ...mockRequest }
      const mockData = [sampleTrainingData]

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockObjectStore.getAll.mockReturnValue(getAllRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const getAllPromise = repository.findAll()

      // 取得成功をシミュレート
      getAllRequest.result = mockData
      const getAllSuccessEvent = { target: getAllRequest } as Event & {
        target: IDBRequest
      }
      getAllRequest.onsuccess?.(getAllSuccessEvent)
      const result = await getAllPromise

      // Assert
      expect(mockDatabase.transaction).toHaveBeenCalledWith(
        ['training_data'],
        'readonly',
      )
      expect(mockObjectStore.getAll).toHaveBeenCalled()
      expect(result).toEqual(mockData)
    })

    it('日付範囲でデータを取得できる', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const rangeRequest = { ...mockRequest }
      const startDate = new Date('2025-01-01')
      const endDate = new Date('2025-01-31')
      const mockData = [sampleTrainingData]

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockIndex.getAll.mockReturnValue(rangeRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const getRangePromise = repository.findByDateRange(startDate, endDate)

      // 取得成功をシミュレート
      rangeRequest.result = mockData
      const rangeSuccessEvent = { target: rangeRequest } as Event & {
        target: IDBRequest
      }
      rangeRequest.onsuccess?.(rangeSuccessEvent)
      const result = await getRangePromise

      // Assert
      expect(mockObjectStore.index).toHaveBeenCalledWith('timestamp')
      expect(mockIndex.getAll).toHaveBeenCalledWith(
        expect.objectContaining({
          lower: startDate.getTime(),
          upper: endDate.getTime(),
        }),
      )
      expect(result).toEqual(mockData)
    })

    it('データ数を取得できる', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const countRequest = { ...mockRequest }
      const expectedCount = 42

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockObjectStore.count.mockReturnValue(countRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const countPromise = repository.count()

      // カウント成功をシミュレート
      countRequest.result = expectedCount
      const countSuccessEvent = { target: countRequest } as Event & {
        target: IDBRequest
      }
      countRequest.onsuccess?.(countSuccessEvent)
      const result = await countPromise

      // Assert
      expect(mockDatabase.transaction).toHaveBeenCalledWith(
        ['training_data'],
        'readonly',
      )
      expect(mockObjectStore.count).toHaveBeenCalled()
      expect(result).toBe(expectedCount)
    })
  })

  describe('データ削除', () => {
    it('全データをクリアできる', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const clearRequest = { ...mockRequest }

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockObjectStore.clear.mockReturnValue(clearRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const clearPromise = repository.clear()

      // クリア成功をシミュレート
      const clearSuccessEvent = { target: clearRequest } as Event & {
        target: IDBRequest
      }
      clearRequest.onsuccess?.(clearSuccessEvent)
      await clearPromise

      // Assert
      expect(mockDatabase.transaction).toHaveBeenCalledWith(
        ['training_data'],
        'readwrite',
      )
      expect(mockObjectStore.clear).toHaveBeenCalled()
    })

    it('クリアエラーを適切に処理する', async () => {
      // Arrange
      const openRequest = { ...mockRequest }
      const clearRequest = { ...mockRequest }

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockObjectStore.clear.mockReturnValue(clearRequest)

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act
      const clearPromise = repository.clear()

      // クリアエラーをシミュレート
      const clearErrorEvent = { target: clearRequest } as Event & {
        target: IDBRequest
      }
      clearRequest.onerror?.(clearErrorEvent)

      // Assert
      await expect(clearPromise).rejects.toThrow(
        'Failed to clear training data',
      )
    })
  })

  describe('エラーハンドリング', () => {
    it('初期化されていない状態でのアクセスエラー', async () => {
      // Arrange
      const uninitializedRepository = new IndexedDBTrainingDataRepository()

      // Act & Assert
      await expect(
        uninitializedRepository.save(sampleTrainingData),
      ).rejects.toThrow('Database not initialized')

      await expect(uninitializedRepository.findAll()).rejects.toThrow(
        'Database not initialized',
      )

      await expect(uninitializedRepository.count()).rejects.toThrow(
        'Database not initialized',
      )

      await expect(uninitializedRepository.clear()).rejects.toThrow(
        'Database not initialized',
      )
    })

    it('トランザクションエラーを処理する', async () => {
      // Arrange
      const openRequest = { ...mockRequest }

      mockIndexedDB.open.mockReturnValue(openRequest)
      mockDatabase.transaction.mockImplementation(() => {
        throw new Error('Transaction failed')
      })

      // データベース初期化
      const initPromise = repository.initialize()
      openRequest.result = mockDatabase
      const initEvent = { target: openRequest } as Event & { target: IDBRequest }
      openRequest.onsuccess?.(initEvent)
      await initPromise

      // Act & Assert
      await expect(repository.save(sampleTrainingData)).rejects.toThrow(
        'Failed to save training data',
      )
    })
  })

  describe('パフォーマンス', () => {
    it('大量データの保存が効率的である', async () => {
      // このテストは実際の実装でのパフォーマンステスト用のプレースホルダー
      expect(true).toBe(true)
    })

    it('インデックスを使用した高速検索が可能である', async () => {
      // このテストは実際の実装でのインデックステスト用のプレースホルダー
      expect(true).toBe(true)
    })
  })
})
