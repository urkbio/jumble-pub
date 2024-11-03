import { TRelayGroup } from '@common/types'
import { createRelayGroupsChangedEvent, eventBus } from './event-bus.service'

class StorageService {
  static instance: StorageService

  private initPromise!: Promise<void>
  private relayGroups: TRelayGroup[] = []
  private activeRelayUrls: string[] = []

  constructor() {
    if (!StorageService.instance) {
      this.initPromise = this.init()
      StorageService.instance = this
    }
    return StorageService.instance
  }

  async init() {
    this.relayGroups = await window.api.storage.getRelayGroups()
    this.activeRelayUrls = this.relayGroups.find((group) => group.isActive)?.relayUrls ?? []
  }

  async getRelayGroups() {
    await this.initPromise
    return this.relayGroups
  }

  async setRelayGroups(relayGroups: TRelayGroup[]) {
    await this.initPromise
    await window.api.storage.setRelayGroups(relayGroups)
    this.relayGroups = relayGroups
    const newActiveRelayUrls = relayGroups.find((group) => group.isActive)?.relayUrls ?? []
    if (
      this.activeRelayUrls.length !== newActiveRelayUrls.length ||
      this.activeRelayUrls.some((url) => !newActiveRelayUrls.includes(url))
    ) {
      eventBus.emit(createRelayGroupsChangedEvent(relayGroups))
    }
    this.activeRelayUrls = newActiveRelayUrls
  }
}

const instance = new StorageService()

export default instance
