import LoginDialog from '@/components/LoginDialog'
import { BIG_RELAY_URLS } from '@/constants'
import { useToast } from '@/hooks'
import client from '@/services/client.service'
import storage from '@/services/storage.service'
import { ISigner, TAccount, TAccountPointer, TDraftEvent, TProfile, TRelayList } from '@/types'
import dayjs from 'dayjs'
import { Event, kinds } from 'nostr-tools'
import { createContext, useContext, useEffect, useState } from 'react'
import { BunkerSigner } from './bunker.signer'
import { Nip07Signer } from './nip-07.signer'
import { NsecSigner } from './nsec.signer'

type TNostrContext = {
  pubkey: string | null
  profile: TProfile | null
  relayList: TRelayList | null
  followings: string[] | null
  account: TAccountPointer | null
  accounts: TAccountPointer[]
  switchAccount: (account: TAccountPointer | null) => Promise<void>
  nsecLogin: (nsec: string) => Promise<string>
  nip07Login: () => Promise<string>
  bunkerLogin: (bunker: string) => Promise<string>
  removeAccount: (account: TAccountPointer) => void
  /**
   * Default publish the event to current relays, user's write relays and additional relays
   */
  publish: (draftEvent: TDraftEvent, additionalRelayUrls?: string[]) => Promise<Event>
  signHttpAuth: (url: string, method: string) => Promise<string>
  signEvent: (draftEvent: TDraftEvent) => Promise<Event>
  checkLogin: <T>(cb?: () => T) => Promise<T | void>
  getRelayList: () => Promise<TRelayList>
  updateRelayList: (relayList: TRelayList) => void
  getFollowings: () => Promise<string[]>
  updateFollowings: (followings: string[]) => void
}

const NostrContext = createContext<TNostrContext | undefined>(undefined)

export const useNostr = () => {
  const context = useContext(NostrContext)
  if (!context) {
    throw new Error('useNostr must be used within a NostrProvider')
  }
  return context
}

export function NostrProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const [account, setAccount] = useState<TAccountPointer | null>(null)
  const [signer, setSigner] = useState<ISigner | null>(null)
  const [openLoginDialog, setOpenLoginDialog] = useState(false)
  const [profile, setProfile] = useState<TProfile | null>(null)
  const [relayList, setRelayList] = useState<TRelayList | null>(null)
  const [followings, setFollowings] = useState<string[] | null>(null)

  useEffect(() => {
    const init = async () => {
      const accounts = storage.getAccounts()
      const act = storage.getCurrentAccount() ?? accounts[0] // auto login the first account
      if (!act) return

      await loginWithAccountPointer(act)
    }
    init()
  }, [])

  useEffect(() => {
    if (!account) {
      setRelayList(null)
      return
    }

    const storedRelayList = storage.getAccountRelayList(account.pubkey)
    if (storedRelayList) {
      setRelayList(storedRelayList)
    }
    const followings = storage.getAccountFollowings(account.pubkey)
    if (followings) {
      setFollowings(followings)
    }
    const profile = storage.getAccountProfile(account.pubkey)
    if (profile) {
      setProfile(profile)
    }
    client.fetchRelayList(account.pubkey).then((relayList) => {
      setRelayList(relayList)
      storage.setAccountRelayList(account.pubkey, relayList)
    })
    client.fetchFollowings(account.pubkey).then((followings) => {
      setFollowings(followings)
      storage.setAccountFollowings(account.pubkey, followings)
    })
    client.fetchProfile(account.pubkey).then((profile) => {
      if (profile) {
        setProfile(profile)
        storage.setAccountProfile(account.pubkey, profile)
      }
    })
  }, [account])

  const login = (signer: ISigner, act: TAccount) => {
    storage.addAccount(act)
    storage.switchAccount(act)
    setAccount({ pubkey: act.pubkey, signerType: act.signerType })
    setSigner(signer)
    return act.pubkey
  }

  const removeAccount = (act: TAccountPointer) => {
    storage.removeAccount(act)
    if (account?.pubkey === act.pubkey) {
      setAccount(null)
      setSigner(null)
    }
  }

  const switchAccount = async (act: TAccountPointer | null) => {
    if (!act) {
      storage.switchAccount(null)
      setAccount(null)
      setSigner(null)
      return
    }
    await loginWithAccountPointer(act)
  }

  const nsecLogin = async (nsec: string) => {
    const browserNsecSigner = new NsecSigner()
    const pubkey = browserNsecSigner.login(nsec)
    return login(browserNsecSigner, { pubkey, signerType: 'nsec', nsec })
  }

  const nip07Login = async () => {
    try {
      const nip07Signer = new Nip07Signer()
      const pubkey = await nip07Signer.getPublicKey()
      if (!pubkey) {
        throw new Error('You did not allow to access your pubkey')
      }
      return login(nip07Signer, { pubkey, signerType: 'nip-07' })
    } catch (err) {
      toast({
        title: 'Login failed',
        description: (err as Error).message,
        variant: 'destructive'
      })
      throw err
    }
  }

  const bunkerLogin = async (bunker: string) => {
    const bunkerSigner = new BunkerSigner()
    const pubkey = await bunkerSigner.login(bunker)
    if (!pubkey) {
      throw new Error('Invalid bunker')
    }
    const bunkerUrl = new URL(bunker)
    bunkerUrl.searchParams.delete('secret')
    return login(bunkerSigner, {
      pubkey,
      signerType: 'bunker',
      bunker: bunkerUrl.toString(),
      bunkerClientSecretKey: bunkerSigner.getClientSecretKey()
    })
  }

  const loginWithAccountPointer = async (act: TAccountPointer): Promise<string | null> => {
    let account = storage.findAccount(act)
    if (!account) {
      return null
    }
    if (account.signerType === 'nsec' || account.signerType === 'browser-nsec') {
      if (account.nsec) {
        const browserNsecSigner = new NsecSigner()
        browserNsecSigner.login(account.nsec)
        // Migrate to nsec
        if (account.signerType === 'browser-nsec') {
          storage.removeAccount(account)
          account = { ...account, signerType: 'nsec' }
          storage.addAccount(account)
        }
        return login(browserNsecSigner, account)
      }
    } else if (account.signerType === 'nip-07') {
      const nip07Signer = new Nip07Signer()
      return login(nip07Signer, account)
    } else if (account.signerType === 'bunker') {
      if (account.bunker && account.bunkerClientSecretKey) {
        const bunkerSigner = new BunkerSigner(account.bunkerClientSecretKey)
        const pubkey = await bunkerSigner.login(account.bunker)
        if (!pubkey) {
          storage.removeAccount(account)
          return null
        }
        if (pubkey !== account.pubkey) {
          storage.removeAccount(account)
          account = { ...account, pubkey }
          storage.addAccount(account)
        }
        return login(bunkerSigner, account)
      }
    }
    storage.removeAccount(account)
    return null
  }

  const signEvent = async (draftEvent: TDraftEvent) => {
    const event = await signer?.signEvent(draftEvent)
    if (!event) {
      throw new Error('sign event failed')
    }
    return event
  }

  const publish = async (draftEvent: TDraftEvent, additionalRelayUrls: string[] = []) => {
    const event = await signEvent(draftEvent)
    await client.publishEvent((relayList?.write ?? []).concat(additionalRelayUrls), event)
    return event
  }

  const signHttpAuth = async (url: string, method: string) => {
    const event = await signEvent({
      content: '',
      kind: kinds.HTTPAuth,
      created_at: dayjs().unix(),
      tags: [
        ['u', url],
        ['method', method]
      ]
    })
    return 'Nostr ' + btoa(JSON.stringify(event))
  }

  const checkLogin = async <T,>(cb?: () => T): Promise<T | void> => {
    if (signer) {
      return cb && cb()
    }
    return setOpenLoginDialog(true)
  }

  const getRelayList = async () => {
    if (!account) {
      return { write: BIG_RELAY_URLS, read: BIG_RELAY_URLS }
    }

    const storedRelayList = storage.getAccountRelayList(account.pubkey)
    if (storedRelayList) {
      return storedRelayList
    }
    return await client.fetchRelayList(account.pubkey)
  }

  const updateRelayList = (relayList: TRelayList) => {
    if (!account) {
      return
    }
    setRelayList(relayList)
    storage.setAccountRelayList(account.pubkey, relayList)
  }

  const getFollowings = async () => {
    if (!account) {
      return []
    }

    const followings = storage.getAccountFollowings(account.pubkey)
    if (followings) {
      return followings
    }
    return await client.fetchFollowings(account.pubkey)
  }

  const updateFollowings = (followings: string[]) => {
    if (!account) {
      return
    }
    setFollowings(followings)
    storage.setAccountFollowings(account.pubkey, followings)
  }

  return (
    <NostrContext.Provider
      value={{
        pubkey: account?.pubkey ?? null,
        profile,
        relayList,
        followings,
        account,
        accounts: storage
          .getAccounts()
          .map((act) => ({ pubkey: act.pubkey, signerType: act.signerType })),
        switchAccount,
        nsecLogin,
        nip07Login,
        bunkerLogin,
        removeAccount,
        publish,
        signHttpAuth,
        checkLogin,
        signEvent,
        getRelayList,
        updateRelayList,
        getFollowings,
        updateFollowings
      }}
    >
      {children}
      <LoginDialog open={openLoginDialog} setOpen={setOpenLoginDialog} />
    </NostrContext.Provider>
  )
}
