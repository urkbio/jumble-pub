import LoginDialog from '@/components/LoginDialog'
import { useToast } from '@/hooks'
import { useFetchRelayList } from '@/hooks/useFetchRelayList'
import client from '@/services/client.service'
import storage from '@/services/storage.service'
import { ISigner, TDraftEvent } from '@/types'
import dayjs from 'dayjs'
import { Event, kinds } from 'nostr-tools'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRelaySettings } from '../RelaySettingsProvider'
import { NsecSigner } from './nsec.signer'
import { BunkerSigner } from './bunker.signer'
import { Nip07Signer } from './nip-07.signer'

type TNostrContext = {
  pubkey: string | null
  setPubkey: (pubkey: string) => void
  nsecLogin: (nsec: string) => Promise<string>
  nip07Login: () => Promise<string>
  bunkerLogin: (bunker: string) => Promise<string>
  logout: () => void
  /**
   * Default publish the event to current relays, user's write relays and additional relays
   */
  publish: (draftEvent: TDraftEvent, additionalRelayUrls?: string[]) => Promise<Event>
  signHttpAuth: (url: string, method: string) => Promise<string>
  signEvent: (draftEvent: TDraftEvent) => Promise<Event>
  checkLogin: <T>(cb?: () => T) => Promise<T | void>
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
  const [pubkey, setPubkey] = useState<string | null>(null)
  const [signer, setSigner] = useState<ISigner | null>(null)
  const [openLoginDialog, setOpenLoginDialog] = useState(false)
  const { relayUrls: currentRelayUrls } = useRelaySettings()
  const relayList = useFetchRelayList(pubkey)

  useEffect(() => {
    const init = async () => {
      const [account] = storage.getAccounts()
      if (!account) {
        if (!window.nostr) {
          return
        }

        // For browser env, attempt to login with nip-07
        const nip07Signer = new Nip07Signer()
        const pubkey = await nip07Signer.getPublicKey()
        if (!pubkey) {
          return
        }
        storage.setAccounts([{ pubkey, signerType: 'nip-07' }])
        return login(nip07Signer, pubkey)
      }

      if (account.pubkey) {
        setPubkey(account.pubkey)
      }

      // browser-nsec is deprecated
      if (account.signerType === 'browser-nsec') {
        if (account.nsec) {
          const browserNsecSigner = new NsecSigner()
          const pubkey = browserNsecSigner.login(account.nsec)
          storage.setAccounts([{ pubkey, signerType: 'nsec', nsec: account.nsec }])
          return login(browserNsecSigner, pubkey)
        }
      } else if (account.signerType === 'nsec') {
        if (account.nsec) {
          const browserNsecSigner = new NsecSigner()
          const pubkey = browserNsecSigner.login(account.nsec)
          return login(browserNsecSigner, pubkey)
        }
      } else if (account.signerType === 'nip-07') {
        const nip07Signer = new Nip07Signer()
        return login(nip07Signer, account.pubkey)
      } else if (account.signerType === 'bunker') {
        if (account.bunker && account.bunkerClientSecretKey) {
          const bunkerSigner = new BunkerSigner(account.bunkerClientSecretKey)
          const pubkey = await bunkerSigner.login(account.bunker)
          return login(bunkerSigner, pubkey)
        }
      }

      return logout()
    }
    init().catch(() => {
      logout()
    })
  }, [])

  const login = (signer: ISigner, pubkey: string) => {
    setPubkey(pubkey)
    setSigner(signer)
    return pubkey
  }

  const logout = () => {
    setPubkey(null)
    setSigner(null)
    storage.setAccounts([])
  }

  const nsecLogin = async (nsec: string) => {
    const browserNsecSigner = new NsecSigner()
    const pubkey = browserNsecSigner.login(nsec)
    storage.setAccounts([{ pubkey, signerType: 'nsec', nsec }])
    return login(browserNsecSigner, pubkey)
  }

  const nip07Login = async () => {
    try {
      const nip07Signer = new Nip07Signer()
      const pubkey = await nip07Signer.getPublicKey()
      if (!pubkey) {
        throw new Error('You did not allow to access your pubkey')
      }
      storage.setAccounts([{ pubkey, signerType: 'nip-07' }])
      return login(nip07Signer, pubkey)
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
    storage.setAccounts([
      {
        pubkey,
        signerType: 'bunker',
        bunker: bunkerUrl.toString(),
        bunkerClientSecretKey: bunkerSigner.getClientSecretKey()
      }
    ])
    return login(bunkerSigner, pubkey)
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
    await client.publishEvent(
      relayList.write.concat(additionalRelayUrls).concat(currentRelayUrls),
      event
    )
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

  return (
    <NostrContext.Provider
      value={{
        pubkey,
        setPubkey,
        nsecLogin,
        nip07Login,
        bunkerLogin,
        logout,
        publish,
        signHttpAuth,
        checkLogin,
        signEvent
      }}
    >
      {children}
      <LoginDialog open={openLoginDialog} setOpen={setOpenLoginDialog} />
    </NostrContext.Provider>
  )
}
