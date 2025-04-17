import { Event, VerifiedEvent } from 'nostr-tools'

export type TProfile = {
  username: string
  pubkey: string
  original_username?: string
  banner?: string
  avatar?: string
  nip05?: string
  about?: string
  website?: string
  lud06?: string
  lud16?: string
  lightningAddress?: string
  created_at?: number
}
export type TMailboxRelayScope = 'read' | 'write' | 'both'
export type TMailboxRelay = {
  url: string
  scope: TMailboxRelayScope
}
export type TRelayList = {
  write: string[]
  read: string[]
  originalRelays: TMailboxRelay[]
}

export type TRelayInfo = {
  name?: string
  description?: string
  icon?: string
  pubkey?: string
  contact?: string
  supported_nips?: number[]
  software?: string
  version?: string
  tags?: string[]
  payments_url?: string
  limitation?: {
    auth_required?: boolean
    payment_required?: boolean
  }
}

export type TWebMetadata = {
  title?: string | null
  description?: string | null
  image?: string | null
}

export type TRelaySet = {
  id: string
  name: string
  relayUrls: string[]
}

export type TConfig = {
  relayGroups: TRelaySet[]
  theme: TThemeSetting
}

export type TThemeSetting = 'light' | 'dark' | 'system'
export type TTheme = 'light' | 'dark'

export type TDraftEvent = Pick<Event, 'content' | 'created_at' | 'kind' | 'tags'>

export type TNip07 = {
  getPublicKey: () => Promise<string>
  signEvent: (draftEvent: TDraftEvent) => Promise<VerifiedEvent>
  nip04?: {
    encrypt?: (pubkey: string, plainText: string) => Promise<string>
    decrypt?: (pubkey: string, cipherText: string) => Promise<string>
  }
}

export interface ISigner {
  getPublicKey: () => Promise<string>
  signEvent: (draftEvent: TDraftEvent) => Promise<VerifiedEvent>
  nip04Encrypt: (pubkey: string, plainText: string) => Promise<string>
  nip04Decrypt: (pubkey: string, cipherText: string) => Promise<string>
}

export type TSignerType = 'nsec' | 'nip-07' | 'bunker' | 'browser-nsec' | 'ncryptsec' | 'npub'

export type TAccount = {
  pubkey: string
  signerType: TSignerType
  ncryptsec?: string
  nsec?: string
  bunker?: string
  bunkerClientSecretKey?: string
  npub?: string
}

export type TAccountPointer = Pick<TAccount, 'pubkey' | 'signerType'>

export type TFeedType = 'following' | 'relays' | 'relay' | 'temporary'
export type TFeedInfo = { feedType: TFeedType; id?: string }

export type TLanguage = 'en' | 'zh' | 'pl'

export type TImageInfo = { url: string; blurHash?: string; dim?: { width: number; height: number } }

export type TNoteListMode = 'posts' | 'postsAndReplies' | 'pictures' | 'you'

export type TNotificationType = 'all' | 'mentions' | 'reactions' | 'zaps'

export type TPageRef = { scrollToTop: () => void }

export type TNip66RelayInfo = TRelayInfo & {
  url: string
  shortUrl: string
  hasNip11: boolean
  triedNip11: boolean
  relayType?: string
  countryCode?: string
}
