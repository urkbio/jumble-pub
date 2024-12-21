import { StorageKey } from '@/constants'
import { TAccount, TRelayGroup, TThemeSetting } from '@/types'

const DEFAULT_RELAY_GROUPS: TRelayGroup[] = [
  {
    groupName: 'Global',
    relayUrls: ['wss://relay.damus.io/', 'wss://nos.lol/'],
    isActive: true
  }
]

class StorageService {
  static instance: StorageService

  private relayGroups: TRelayGroup[] = []
  private themeSetting: TThemeSetting = 'system'
  private accounts: TAccount[] = []

  constructor() {
    if (!StorageService.instance) {
      this.init()
      StorageService.instance = this
    }
    return StorageService.instance
  }

  init() {
    const relayGroupsStr = window.localStorage.getItem(StorageKey.RELAY_GROUPS)
    this.relayGroups = relayGroupsStr ? JSON.parse(relayGroupsStr) : DEFAULT_RELAY_GROUPS
    this.themeSetting =
      (window.localStorage.getItem(StorageKey.THEME_SETTING) as TThemeSetting) ?? 'system'
    const accountsStr = window.localStorage.getItem(StorageKey.ACCOUNTS)
    this.accounts = accountsStr ? JSON.parse(accountsStr) : []
  }

  getRelayGroups() {
    return this.relayGroups
  }

  setRelayGroups(relayGroups: TRelayGroup[]) {
    window.localStorage.setItem(StorageKey.RELAY_GROUPS, JSON.stringify(relayGroups))
    this.relayGroups = relayGroups
  }

  getThemeSetting() {
    return this.themeSetting
  }

  setThemeSetting(themeSetting: TThemeSetting) {
    window.localStorage.setItem(StorageKey.THEME_SETTING, themeSetting)
    this.themeSetting = themeSetting
  }

  getAccounts() {
    return this.accounts
  }

  setAccounts(accounts: TAccount[]) {
    if (accounts === null) {
      window.localStorage.removeItem(StorageKey.ACCOUNTS)
    } else {
      window.localStorage.setItem(StorageKey.ACCOUNTS, JSON.stringify(accounts))
    }
    this.accounts = accounts
  }
}

const instance = new StorageService()

export default instance
