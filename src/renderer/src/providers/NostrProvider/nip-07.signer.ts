import { ISigner, TDraftEvent } from '@common/types'
import { isElectron } from '@renderer/lib/env'

export class Nip07Signer implements ISigner {
  private signer: ISigner

  constructor() {
    if (isElectron(window) || !window.nostr) {
      throw new Error('nip-07 is not available')
    }
    if (!window.nostr) {
      throw new Error(
        'You need to install a nostr signer extension to login. Such as alby, nostr-keyx or nos2x.'
      )
    }
    this.signer = window.nostr
  }

  async getPublicKey() {
    return await this.signer.getPublicKey()
  }

  async signEvent(draftEvent: TDraftEvent) {
    return await this.signer.signEvent(draftEvent)
  }
}
