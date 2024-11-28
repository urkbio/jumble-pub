export type TProfile = {
  username: string
  pubkey: string
  banner?: string
  avatar?: string
  nip05?: string
  about?: string
  created_at?: number
}

export type TRelayList = {
  write: string[]
  read: string[]
}

export type TRelayInfo = {
  supported_nips?: number[]
}

export type TWebMetadata = {
  title?: string | null
  description?: string | null
  image?: string | null
}
