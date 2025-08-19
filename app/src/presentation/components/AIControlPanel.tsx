/**
 * AIコントロールパネルコンポーネント
 */
import type { AISettings } from '../../domain/models/ai/types'

interface AIControlPanelProps {
  aiEnabled: boolean
  aiSettings: AISettings
  onToggleAI: () => void
  onSettingsChange: (settings: AISettings) => void
}

export const AIControlPanel = ({
  aiEnabled,
  aiSettings,
  onToggleAI,
  onSettingsChange,
}: AIControlPanelProps) => {
  const handleSpeedChange = (speed: number) => {
    onSettingsChange({
      ...aiSettings,
      thinkingSpeed: speed,
    })
  }

  return (
    <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
      <h3 className="text-white font-semibold mb-3 flex items-center">
        🤖 AI自動プレイ
      </h3>

      <div className="space-y-3">
        {/* AI ON/OFF トグル */}
        <div className="flex items-center justify-between">
          <span className="text-white/80 text-sm">AI自動プレイ</span>
          <button
            onClick={onToggleAI}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              aiEnabled ? 'bg-blue-600' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                aiEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* AI思考速度調整 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/80 text-sm">思考速度</span>
            <span className="text-white text-sm">
              {aiSettings.thinkingSpeed}ms
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="3000"
            step="100"
            value={aiSettings.thinkingSpeed}
            onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {aiEnabled && (
          <div className="text-xs text-blue-300 bg-blue-900/30 p-2 rounded">
            AI が自動でぷよを操作します
          </div>
        )}
      </div>
    </div>
  )
}
