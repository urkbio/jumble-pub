import { StorageKey } from '@/constants'
import { isSameAccount } from '@/lib/account'
import { randomString } from '@/lib/random'
import {
  TAccount,
  TAccountPointer,
  TFeedType,
  TProfile,
  TRelayList,
  TRelaySet,
  TThemeSetting
} from '@/types'

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
  private feedType: TFeedType = 'relays'
  private themeSetting: TThemeSetting = 'system'
  private accounts: TAccount[] = []
  private currentAccount: TAccount | null = null
  private accountRelayListMap: Record<string, TRelayList | undefined> = {} // pubkey -> relayList
  private accountFollowingsMap: Record<string, string[] | undefined> = {} // pubkey -> followings
  private accountProfileMap: Record<string, TProfile> = {} // pubkey -> profile

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
    const feedTypeStr = window.localStorage.getItem(StorageKey.FEED_TYPE)
    this.feedType = feedTypeStr ? JSON.parse(feedTypeStr) : 'relays'
    const accountRelayListMapStr = window.localStorage.getItem(StorageKey.ACCOUNT_RELAY_LIST_MAP)
    this.accountRelayListMap = accountRelayListMapStr ? JSON.parse(accountRelayListMapStr) : {}
    const accountFollowingsMapStr = window.localStorage.getItem(StorageKey.ACCOUNT_FOLLOWINGS_MAP)
    this.accountFollowingsMap = accountFollowingsMapStr ? JSON.parse(accountFollowingsMapStr) : {}
    const accountProfileMapStr = window.localStorage.getItem(StorageKey.ACCOUNT_PROFILE_MAP)
    this.accountProfileMap = accountProfileMapStr ? JSON.parse(accountProfileMapStr) : {}

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

  getFeedType() {
    return this.feedType
  }

  setFeedType(feedType: TFeedType) {
    this.feedType = feedType
    window.localStorage.setItem(StorageKey.FEED_TYPE, JSON.stringify(this.feedType))
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
    delete this.accountFollowingsMap[account.pubkey]
    delete this.accountRelayListMap[account.pubkey]
    delete this.accountProfileMap[account.pubkey]
    window.localStorage.setItem(StorageKey.ACCOUNTS, JSON.stringify(this.accounts))
    window.localStorage.setItem(
      StorageKey.ACCOUNT_FOLLOWINGS_MAP,
      JSON.stringify(this.accountFollowingsMap)
    )
    window.localStorage.setItem(
      StorageKey.ACCOUNT_RELAY_LIST_MAP,
      JSON.stringify(this.accountRelayListMap)
    )
    window.localStorage.setItem(
      StorageKey.ACCOUNT_PROFILE_MAP,
      JSON.stringify(this.accountProfileMap)
    )
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

  getAccountRelayList(pubkey: string) {
    return this.accountRelayListMap[pubkey]
  }

  setAccountRelayList(pubkey: string, relayList: TRelayList) {
    this.accountRelayListMap[pubkey] = relayList
    window.localStorage.setItem(
      StorageKey.ACCOUNT_RELAY_LIST_MAP,
      JSON.stringify(this.accountRelayListMap)
    )
  }

  getAccountFollowings(pubkey: string) {
    return this.accountFollowingsMap[pubkey]
  }

  setAccountFollowings(pubkey: string, followings: string[]) {
    this.accountFollowingsMap[pubkey] = followings
    window.localStorage.setItem(
      StorageKey.ACCOUNT_FOLLOWINGS_MAP,
      JSON.stringify(this.accountFollowingsMap)
    )
  }

  getAccountProfile(pubkey: string) {
    return this.accountProfileMap[pubkey]
  }

  setAccountProfile(pubkey: string, profile: TProfile) {
    this.accountProfileMap[pubkey] = profile
    window.localStorage.setItem(
      StorageKey.ACCOUNT_PROFILE_MAP,
      JSON.stringify(this.accountProfileMap)
    )
  }
}

const instance = new StorageService()

export default instance
