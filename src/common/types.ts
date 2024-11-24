import { ElectronAPI } from '@electron-toolkit/preload'
import { Event } from 'nostr-tools'

export type TRelayGroup = {
  groupName: string
  relayUrls: string[]
  isActive: boolean
}

export type TConfig = {
  relayGroups: TRelayGroup[]
  theme: TThemeSetting
}

export type TThemeSetting = 'light' | 'dark' | 'system'
export type TTheme = 'light' | 'dark'

export type TDraftEvent = Pick<Event, 'content' | 'created_at' | 'kind' | 'tags'>

export type TElectronWindow = {
  electron: ElectronAPI
  api: {
    system: {
      isEncryptionAvailable: () => Promise<boolean>
    }
    theme: {
      addChangeListener: (listener: (theme: TTheme) => void) => void
      removeChangeListener: () => void
      current: () => Promise<TTheme>
    }
    storage: {
      getItem: (key: string) => Promise<string>
      setItem: (key: string, value: string) => Promise<void>
    }
    nostr: {
      login: (nsec: string) => Promise<{
        pubkey?: string
        reason?: string
      }>
      logout: () => Promise<void>
    }
  }
  nostr: {
    getPublicKey: () => Promise<string | null>
    signEvent: (draftEvent: TDraftEvent) => Promise<Event | null>
  }
}
