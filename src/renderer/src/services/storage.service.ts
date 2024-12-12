import { StorageKey } from '@common/constants'
import { TAccount, TRelayGroup, TThemeSetting } from '@common/types'
import { isElectron } from '@renderer/lib/env'

const DEFAULT_RELAY_GROUPS: TRelayGroup[] = [
  {
    groupName: 'Global',
    relayUrls: ['wss://relay.damus.io/', 'wss://nos.lol/'],
    isActive: true
  }
]

class Storage {
  async getItem(key: string) {
    if (isElectron(window)) {
      return window.api.storage.getItem(key)
    } else {
      return localStorage.getItem(key)
    }
  }

  async setItem(key: string, value: string) {
    if (isElectron(window)) {
      return window.api.storage.setItem(key, value)
    } else {
      return localStorage.setItem(key, value)
    }
  }

  async removeItem(key: string) {
    if (isElectron(window)) {
      return window.api.storage.removeItem(key)
    } else {
      return localStorage.removeItem(key)
    }
  }
}

class StorageService {
  static instance: StorageService

  private initPromise!: Promise<void>
  private relayGroups: TRelayGroup[] = []
  private themeSetting: TThemeSetting = 'system'
  private account: TAccount | null = null
  private storage: Storage = new Storage()

  constructor() {
    if (!StorageService.instance) {
      this.initPromise = this.init()
      StorageService.instance = this
    }
    return StorageService.instance
  }

  async init() {
    const relayGroupsStr = await this.storage.getItem(StorageKey.RELAY_GROUPS)
    this.relayGroups = relayGroupsStr ? JSON.parse(relayGroupsStr) : DEFAULT_RELAY_GROUPS
    this.themeSetting =
      ((await this.storage.getItem(StorageKey.THEME_SETTING)) as TThemeSetting) ?? 'system'
    const accountStr = await this.storage.getItem(StorageKey.ACCOUNT)
    this.account = accountStr ? JSON.parse(accountStr) : null
  }

  async getRelayGroups() {
    await this.initPromise
    return this.relayGroups
  }

  async setRelayGroups(relayGroups: TRelayGroup[]) {
    await this.initPromise
    await this.storage.setItem(StorageKey.RELAY_GROUPS, JSON.stringify(relayGroups))
    this.relayGroups = relayGroups
  }

  async getThemeSetting() {
    await this.initPromise
    return this.themeSetting
  }

  async setThemeSetting(themeSetting: TThemeSetting) {
    await this.initPromise
    await this.storage.setItem(StorageKey.THEME_SETTING, themeSetting)
    this.themeSetting = themeSetting
  }

  async getAccountInfo() {
    await this.initPromise
    return this.account
  }

  async setAccountInfo(account: TAccount | null) {
    await this.initPromise
    if (account === null) {
      await this.storage.removeItem(StorageKey.ACCOUNT)
    } else {
      await this.storage.setItem(StorageKey.ACCOUNT, JSON.stringify(account))
    }
    this.account = account
  }
}

const instance = new StorageService()

export default instance
