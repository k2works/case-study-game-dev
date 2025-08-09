import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { webVitalsReporter } from './utils/webVitals'

// Web Vitalsの測定開始
webVitalsReporter.onMetric((metric) => {
  // パフォーマンス指標をコンソールに出力（開発用）
  if ((import.meta as any).env?.DEV) {
    console.log(
      `Web Vital: ${metric.name} = ${metric.value} (${metric.rating})`
    )
  }

  // 本番環境では分析サービスに送信可能
  // analytics.send('web-vitals', metric)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
