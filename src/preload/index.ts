import { TDraftEvent, TTheme } from '@common/types'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  system: {
    isEncryptionAvailable: () => ipcRenderer.invoke('system:isEncryptionAvailable'),
    getSelectedStorageBackend: () => ipcRenderer.invoke('system:getSelectedStorageBackend')
  },
  theme: {
    addChangeListener: (listener: (theme: TTheme) => void) => {
      ipcRenderer.on('theme:change', (_, theme) => {
        listener(theme)
      })
    },
    removeChangeListener: () => {
      ipcRenderer.removeAllListeners('theme:change')
    },
    current: () => ipcRenderer.invoke('theme:current')
  },
  storage: {
    getItem: (key: string) => ipcRenderer.invoke('storage:getItem', key),
    setItem: (key: string, value: string) => ipcRenderer.invoke('storage:setItem', key, value),
    removeItem: (key: string) => ipcRenderer.invoke('storage:removeItem', key)
  },
  nostr: {
    login: (nsec: string) => ipcRenderer.invoke('nostr:login', nsec),
    logout: () => ipcRenderer.invoke('nostr:logout')
  }
}

// NIP-07
const nostr = {
  getPublicKey: () => ipcRenderer.invoke('nostr:getPublicKey'),
  signEvent: (draftEvent: TDraftEvent) => ipcRenderer.invoke('nostr:signEvent', draftEvent)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('nostr', nostr)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  // @ts-ignore (define in dts)
  window.nostr = nostr
}
