/**
 * 戦略設定フック
 * 戦略の取得、設定、管理機能を提供
 */
import { useCallback, useEffect, useState } from 'react'

import type { StrategyConfig } from '../../domain/models/ai/StrategyConfig'
import type { StrategyService, CreateStrategyRequest, UpdateStrategyRequest } from '../../application/services/StrategyService'

interface UseStrategyState {
  strategies: StrategyConfig[]
  activeStrategy: StrategyConfig | null
  isLoading: boolean
  error: string | null
}

interface UseStrategyActions {
  setActiveStrategy: (strategyId: string) => Promise<void>
  createCustomStrategy: (request: CreateStrategyRequest) => Promise<void>
  updateStrategy: (id: string, request: UpdateStrategyRequest) => Promise<void>
  deleteStrategy: (id: string) => Promise<void>
  refresh: () => Promise<void>
}

export type UseStrategyReturn = UseStrategyState & UseStrategyActions

/**
 * 戦略設定フック
 */
export const useStrategy = (strategyService: StrategyService): UseStrategyReturn => {
  const [state, setState] = useState<UseStrategyState>({
    strategies: [],
    activeStrategy: null,
    isLoading: true,
    error: null,
  })

  /**
   * 戦略データを読み込む
   */
  const loadStrategies = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      const [strategies, activeStrategy] = await Promise.all([
        strategyService.getAllStrategies(),
        strategyService.getActiveStrategy(),
      ])

      setState(prev => ({
        ...prev,
        strategies,
        activeStrategy,
        isLoading: false,
        error: null,
      }))
    } catch (error) {
      console.error('戦略データの読み込みに失敗しました:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '戦略データの読み込みに失敗しました',
      }))
    }
  }, [strategyService])

  /**
   * アクティブ戦略を設定する
   */
  const setActiveStrategy = useCallback(async (strategyId: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      await strategyService.setActiveStrategy(strategyId)
      
      const updatedActiveStrategy = await strategyService.getActiveStrategy()
      setState(prev => ({
        ...prev,
        activeStrategy: updatedActiveStrategy,
      }))
    } catch (error) {
      console.error('アクティブ戦略の設定に失敗しました:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'アクティブ戦略の設定に失敗しました',
      }))
    }
  }, [strategyService])

  /**
   * カスタム戦略を作成する
   */
  const createCustomStrategy = useCallback(async (request: CreateStrategyRequest) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      await strategyService.createCustomStrategy(request)
      
      // 戦略一覧を再読み込み
      const updatedStrategies = await strategyService.getAllStrategies()
      setState(prev => ({
        ...prev,
        strategies: updatedStrategies,
      }))
    } catch (error) {
      console.error('カスタム戦略の作成に失敗しました:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'カスタム戦略の作成に失敗しました',
      }))
      throw error // 呼び出し元でも処理できるように再スロー
    }
  }, [strategyService])

  /**
   * 戦略を更新する
   */
  const updateStrategy = useCallback(async (id: string, request: UpdateStrategyRequest) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      await strategyService.updateStrategy(id, request)
      
      // 戦略一覧を再読み込み
      const updatedStrategies = await strategyService.getAllStrategies()
      setState(prev => ({
        ...prev,
        strategies: updatedStrategies,
      }))
    } catch (error) {
      console.error('戦略の更新に失敗しました:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '戦略の更新に失敗しました',
      }))
      throw error
    }
  }, [strategyService])

  /**
   * 戦略を削除する
   */
  const deleteStrategy = useCallback(async (id: string) => {
    try {
      setState(prev => ({ ...prev, error: null }))
      
      await strategyService.deleteStrategy(id)
      
      // 戦略一覧とアクティブ戦略を再読み込み
      const [updatedStrategies, updatedActiveStrategy] = await Promise.all([
        strategyService.getAllStrategies(),
        strategyService.getActiveStrategy(),
      ])
      
      setState(prev => ({
        ...prev,
        strategies: updatedStrategies,
        activeStrategy: updatedActiveStrategy,
      }))
    } catch (error) {
      console.error('戦略の削除に失敗しました:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '戦略の削除に失敗しました',
      }))
      throw error
    }
  }, [strategyService])

  /**
   * データを手動で再読み込みする
   */
  const refresh = useCallback(async () => {
    await loadStrategies()
  }, [loadStrategies])

  // 初期データ読み込み
  useEffect(() => {
    loadStrategies()
  }, [loadStrategies])

  return {
    strategies: state.strategies,
    activeStrategy: state.activeStrategy,
    isLoading: state.isLoading,
    error: state.error,
    setActiveStrategy,
    createCustomStrategy,
    updateStrategy,
    deleteStrategy,
    refresh,
  }
}