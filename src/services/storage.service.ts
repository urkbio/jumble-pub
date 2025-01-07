import { StorageKey } from '@/constants'
import { isSameAccount } from '@/lib/account'
import { randomString } from '@/lib/random'
import { TAccount, TAccountPointer, TRelaySet, TThemeSetting } from '@/types'

const DEFAULT_RELAY_SETS: TRelaySet[] = [
  {
    id: randomString(),
    name: 'Global',
    relayUrls: ['wss://relay.damus.io/', 'wss://nos.lol/']
  },
  {
    id: randomString(),
    name: 'Algo',
    relayUrls: ['wss://algo.utxo.one']
  }
]

class StorageService {
  static instance: StorageService

  private relaySets: TRelaySet[] = []
  private activeRelaySetId: string | null = null
  private themeSetting: TThemeSetting = 'system'
  private accounts: TAccount[] = []
  private currentAccount: TAccount | null = null

  constructor() {
    if (!StorageService.instance) {
      this.init()
      StorageService.instance = this
    }
    return StorageService.instance
  }

  init() {
    this.themeSetting =
      (window.localStorage.getItem(StorageKey.THEME_SETTING) as TThemeSetting) ?? 'system'
    const accountsStr = window.localStorage.getItem(StorageKey.ACCOUNTS)
    this.accounts = accountsStr ? JSON.parse(accountsStr) : []
    const currentAccountStr = window.localStorage.getItem(StorageKey.CURRENT_ACCOUNT)
    this.currentAccount = currentAccountStr ? JSON.parse(currentAccountStr) : null

    const relaySetsStr = window.localStorage.getItem(StorageKey.RELAY_SETS)
    if (!relaySetsStr) {
      let relaySets: TRelaySet[] = []
      const legacyRelayGroupsStr = window.localStorage.getItem('relayGroups')
      if (legacyRelayGroupsStr) {
        const legacyRelayGroups = JSON.parse(legacyRelayGroupsStr)
        relaySets = legacyRelayGroups.map((group: any) => {
          return {
            id: randomString(),
            name: group.groupName,
            relayUrls: group.relayUrls
          }
        })
      }
      if (!relaySets.length) {
        relaySets = DEFAULT_RELAY_SETS
      }
      const activeRelaySetId = relaySets[0].id
      window.localStorage.setItem(StorageKey.RELAY_SETS, JSON.stringify(relaySets))
      window.localStorage.setItem(StorageKey.ACTIVE_RELAY_SET_ID, activeRelaySetId)
      this.relaySets = relaySets
      this.activeRelaySetId = activeRelaySetId
    } else {
      this.relaySets = JSON.parse(relaySetsStr)
      this.activeRelaySetId = window.localStorage.getItem(StorageKey.ACTIVE_RELAY_SET_ID) ?? null
    }
  }

  getRelaySets() {
    return this.relaySets
  }

  setRelaySets(relaySets: TRelaySet[]) {
    this.relaySets = relaySets
    window.localStorage.setItem(StorageKey.RELAY_SETS, JSON.stringify(this.relaySets))
  }

  getActiveRelaySetId() {
    return this.activeRelaySetId
  }

  setActiveRelaySetId(id: string | null) {
    this.activeRelaySetId = id
    if (id) {
      window.localStorage.setItem(
        StorageKey.ACTIVE_RELAY_SET_ID,
        JSON.stringify(this.activeRelaySetId)
      )
    } else {
      window.localStorage.removeItem(StorageKey.ACTIVE_RELAY_SET_ID)
    }
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

  findAccount(account: TAccountPointer) {
    return this.accounts.find((act) => isSameAccount(act, account))
  }

  getCurrentAccount() {
    return this.currentAccount
  }

  addAccount(account: TAccount) {
    if (this.accounts.find((act) => isSameAccount(act, account))) {
      return
    }
    this.accounts.push(account)
    window.localStorage.setItem(StorageKey.ACCOUNTS, JSON.stringify(this.accounts))
    return account
  }

  removeAccount(account: TAccount) {
    this.accounts = this.accounts.filter((act) => !isSameAccount(act, account))
    window.localStorage.setItem(StorageKey.ACCOUNTS, JSON.stringify(this.accounts))
  }

  switchAccount(account: TAccount | null) {
    if (isSameAccount(this.currentAccount, account)) {
      return
    }
    const act = this.accounts.find((act) => isSameAccount(act, account))
    if (!act) {
      return
    }
    this.currentAccount = act
    window.localStorage.setItem(StorageKey.CURRENT_ACCOUNT, JSON.stringify(act))
  }
}

const instance = new StorageService()

export default instance
