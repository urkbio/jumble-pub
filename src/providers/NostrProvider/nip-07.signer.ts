import { ISigner, TDraftEvent, TNip07 } from '@/types'

export class Nip07Signer implements ISigner {
  private signer: TNip07
  private pubkey: string | null = null

  constructor() {
    if (!window.nostr) {
      throw new Error(
        'You need to install a nostr signer extension to login. Such as alby, nostr-keyx or nos2x.'
      )
    }
    this.signer = window.nostr
  }

  async getPublicKey() {
    if (!this.pubkey) {
      this.pubkey = await this.signer.getPublicKey()
    }
    return this.pubkey
  }

  async signEvent(draftEvent: TDraftEvent) {
    return await this.signer.signEvent(draftEvent)
  }
}
