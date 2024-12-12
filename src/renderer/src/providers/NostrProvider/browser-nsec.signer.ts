import { ISigner, TDraftEvent } from '@common/types'
import { bytesToHex } from '@noble/hashes/utils'
import { finalizeEvent, getPublicKey, nip19 } from 'nostr-tools'

export class BrowserNsecSigner implements ISigner {
  private privkey: Uint8Array | null = null
  private pubkey: string | null = null

  login(nsec: string) {
    const { type, data } = nip19.decode(nsec)
    if (type !== 'nsec') {
      throw new Error('invalid nsec')
    }

    this.privkey = data
    this.pubkey = getPublicKey(data)
    window.localStorage.setItem('private_key', bytesToHex(data))
    return this.pubkey
  }

  logout() {
    window.localStorage.removeItem('private_key')
  }

  async getPublicKey() {
    return this.pubkey
  }

  async signEvent(draftEvent: TDraftEvent) {
    if (!this.privkey) {
      return null
    }

    try {
      return finalizeEvent(draftEvent, this.privkey)
    } catch (error) {
      console.error(error)
      return null
    }
  }
}
