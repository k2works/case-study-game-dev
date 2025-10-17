import { contextBridge, ipcRenderer } from 'electron'

// セキュアな API を公開
contextBridge.exposeInMainWorld('electronAPI', {
  // 必要に応じて IPC 通信用の API を追加
  ping: () => ipcRenderer.invoke('ping')
})
