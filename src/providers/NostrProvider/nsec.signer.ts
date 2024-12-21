import { ISigner, TDraftEvent } from '@/types'
import { finalizeEvent, getPublicKey as nGetPublicKey, nip19 } from 'nostr-tools'

export class NsecSigner implements ISigner {
  private privkey: Uint8Array | null = null
  private pubkey: string | null = null

  login(nsec: string) {
    const { type, data } = nip19.decode(nsec)
    if (type !== 'nsec') {
      throw new Error('invalid nsec')
    }

    this.privkey = data
    this.pubkey = nGetPublicKey(data)
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
