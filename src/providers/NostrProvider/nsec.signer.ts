import { ISigner, TDraftEvent } from '@/types'
import { finalizeEvent, getPublicKey as nGetPublicKey, nip19 } from 'nostr-tools'

export class NsecSigner implements ISigner {
  private privkey: Uint8Array | null = null
  private pubkey: string | null = null

  login(nsecOrPrivkey: string | Uint8Array) {
    let privkey
    if (typeof nsecOrPrivkey === 'string') {
      const { type, data } = nip19.decode(nsecOrPrivkey)
      if (type !== 'nsec') {
        throw new Error('invalid nsec')
      }
      privkey = data
    } else {
      privkey = nsecOrPrivkey
    }

    this.privkey = privkey
    this.pubkey = nGetPublicKey(privkey)
    return this.pubkey
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
