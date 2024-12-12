import { ISigner, TDraftEvent, TElectronWindow } from '@common/types'
import { isElectron } from '@renderer/lib/env'

export class NsecSigner implements ISigner {
  private electronNostrApi: TElectronWindow['api']['nostr']
  private signer: ISigner

  constructor() {
    if (!isElectron(window)) {
      throw new Error('nsec login is not available')
    }
    this.electronNostrApi = window.api.nostr
    this.signer = window.nostr
  }

  async login(nsec: string) {
    return await this.electronNostrApi.login(nsec)
  }

  async logout() {
    return await this.electronNostrApi.logout()
  }

  async getPublicKey() {
    return await this.signer.getPublicKey()
  }

  async signEvent(draftEvent: TDraftEvent) {
    return await this.signer.signEvent(draftEvent)
  }
}
