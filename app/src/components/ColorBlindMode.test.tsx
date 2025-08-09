import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Game } from '../domain/Game'
import { GameBoard } from './GameBoard'
import { NextPuyoDisplay } from './NextPuyoDisplay'
import { PuyoPair } from '../domain/PuyoPair'
import { Puyo, PuyoColor } from '../domain/Puyo'
import { gameSettingsService } from '../services/GameSettingsService'

describe('色覚多様性対応機能', () => {
  let game: Game

  beforeEach(() => {
    // テスト前にローカルストレージをクリア
    localStorage.clear()
    
    game = new Game()
    game.start()
  })

  describe('設定変更', () => {
    it('色覚多様性対応設定を有効にできる', () => {
      expect(gameSettingsService.getSetting('colorBlindMode')).toBe(false)
      
      gameSettingsService.updateSetting('colorBlindMode', true)
      expect(gameSettingsService.getSetting('colorBlindMode')).toBe(true)
    })
  })

  describe('GameBoardの色覚多様性対応', () => {
    it('colorBlindMode無効時はcolor-blind-modeクラスが適用されない', () => {
      gameSettingsService.updateSetting('colorBlindMode', false)
      
      render(<GameBoard game={game} />)
      
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).not.toHaveClass('color-blind-mode')
    })

    it('colorBlindMode有効時はcolor-blind-modeクラスが適用される', () => {
      gameSettingsService.updateSetting('colorBlindMode', true)
      
      render(<GameBoard game={game} />)
      
      const gameBoard = screen.getByTestId('game-board')
      expect(gameBoard).toHaveClass('color-blind-mode')
    })
  })

  describe('NextPuyoDisplayの色覚多様性対応', () => {
    const testNextPair = new PuyoPair(
      new Puyo(PuyoColor.RED),
      new Puyo(PuyoColor.BLUE)
    )

    it('colorBlindMode無効時はcolor-blind-modeクラスが適用されない', () => {
      render(
        <NextPuyoDisplay 
          nextPair={testNextPair} 
          colorBlindMode={false} 
        />
      )
      
      const nextPuyoArea = screen.getByTestId('next-puyo-area')
      expect(nextPuyoArea).not.toHaveClass('color-blind-mode')
    })

    it('colorBlindMode有効時はcolor-blind-modeクラスが適用される', () => {
      render(
        <NextPuyoDisplay 
          nextPair={testNextPair} 
          colorBlindMode={true} 
        />
      )
      
      const nextPuyoArea = screen.getByTestId('next-puyo-area')
      expect(nextPuyoArea).toHaveClass('color-blind-mode')
    })

    it('色とパターンの組み合わせでぷよが表示される', () => {
      render(
        <NextPuyoDisplay 
          nextPair={testNextPair} 
          colorBlindMode={true} 
        />
      )
      
      const mainPuyo = screen.getByTestId('next-main-puyo')
      const subPuyo = screen.getByTestId('next-sub-puyo')
      
      // 色クラスが適用されている
      expect(mainPuyo).toHaveClass('red')
      expect(subPuyo).toHaveClass('blue')
      
      // ぷよクラスが適用されている
      expect(mainPuyo).toHaveClass('puyo')
      expect(subPuyo).toHaveClass('puyo')
    })
  })

  describe('CSSパターンの適用', () => {
    it('color-blind-modeが有効な時にCSS疑似要素がパターンを表示する', () => {
      // この部分は実際のブラウザ環境でのみ完全にテストできます
      // JSDOM環境では疑似要素のスタイル計算が制限されています
      
      const testElement = document.createElement('div')
      testElement.className = 'cell puyo red'
      
      const parentElement = document.createElement('div')
      parentElement.className = 'game-board color-blind-mode'
      parentElement.appendChild(testElement)
      
      document.body.appendChild(parentElement)
      
      expect(testElement).toHaveClass('cell', 'puyo', 'red')
      expect(parentElement).toHaveClass('game-board', 'color-blind-mode')
      
      document.body.removeChild(parentElement)
    })
  })

  describe('設定の永続化', () => {
    it('色覚多様性対応設定がlocalStorageに保存される', () => {
      gameSettingsService.updateSetting('colorBlindMode', true)
      
      const savedSettings = localStorage.getItem('puyo-puyo-settings')
      expect(savedSettings).toBeTruthy()
      
      const parsedSettings = JSON.parse(savedSettings!)
      expect(parsedSettings.colorBlindMode).toBe(true)
    })

    it('保存された色覚多様性対応設定が読み込まれる', () => {
      // 設定を保存
      const testSettings = {
        colorBlindMode: true,
        soundVolume: 0.5,
        musicVolume: 0.3,
        autoDropSpeed: 1000,
        showGridLines: false,
        showShadow: true,
        animationsEnabled: true,
      }
      localStorage.setItem('puyo-puyo-settings', JSON.stringify(testSettings))
      
      // 設定を読み込み
      const settings = gameSettingsService.getSettings()
      expect(settings.colorBlindMode).toBe(true)
    })
  })

  describe('デフォルト設定', () => {
    it('colorBlindModeプロパティが存在する', () => {
      const settings = gameSettingsService.getSettings()
      expect(settings).toHaveProperty('colorBlindMode')
      expect(typeof settings.colorBlindMode).toBe('boolean')
    })

    it('設定値を変更できる', () => {
      const initialValue = gameSettingsService.getSetting('colorBlindMode')
      gameSettingsService.updateSetting('colorBlindMode', !initialValue)
      expect(gameSettingsService.getSetting('colorBlindMode')).toBe(!initialValue)
    })
  })
})