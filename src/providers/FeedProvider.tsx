import { isWebsocketUrl, normalizeUrl } from '@/lib/url'
import client from '@/services/client.service'
import storage from '@/services/storage.service'
import { TFeedType } from '@/types'
import { Filter } from 'nostr-tools'
import { createContext, useContext, useEffect, useState } from 'react'
import { useNostr } from './NostrProvider'
import { useRelaySets } from './RelaySetsProvider'

type TFeedContext = {
  feedType: TFeedType
  relayUrls: string[]
  temporaryRelayUrls: string[]
  filter: Filter
  isReady: boolean
  activeRelaySetId: string | null
  switchFeed: (feedType: TFeedType, options?: { activeRelaySetId?: string }) => Promise<void>
}

const FeedContext = createContext<TFeedContext | undefined>(undefined)

export const useFeed = () => {
  const context = useContext(FeedContext)
  if (!context) {
    throw new Error('useFeed must be used within a FeedProvider')
  }
  return context
}

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const { pubkey } = useNostr()
  const { relaySets } = useRelaySets()
  const [feedType, setFeedType] = useState<TFeedType>(storage.getFeedType())
  const [relayUrls, setRelayUrls] = useState<string[]>([])
  const [temporaryRelayUrls, setTemporaryRelayUrls] = useState<string[]>([])
  const [filter, setFilter] = useState<Filter>({})
  const [isReady, setIsReady] = useState(false)
  const [activeRelaySetId, setActiveRelaySetId] = useState<string | null>(
    storage.getActiveRelaySetId()
  )

  useEffect(() => {
    const init = async () => {
      // temporary relay urls from query params
      const searchParams = new URLSearchParams(window.location.search)
      const temporaryRelayUrls = searchParams
        .getAll('r')
        .map((url) =>
          !url.startsWith('ws://') && !url.startsWith('wss://') ? `wss://${url}` : url
        )
        .filter((url) => isWebsocketUrl(url))
        .map((url) => normalizeUrl(url))
      if (temporaryRelayUrls.length) {
        return await switchFeed('temporary', { temporaryRelayUrls })
      }

      if (feedType === 'following') {
        return await switchFeed('following')
      }
      await switchFeed('relays', { activeRelaySetId })
    }

    init()
  }, [])

  useEffect(() => {
    if (feedType !== 'following') return

    switchFeed('following')
  }, [pubkey])

  useEffect(() => {
    if (feedType !== 'relays') return

    const relaySet = relaySets.find((set) => set.id === activeRelaySetId)
    if (!relaySet) return

    setRelayUrls(relaySet.relayUrls)
  }, [relaySets])

  const switchFeed = async (
    feedType: TFeedType,
    options: { activeRelaySetId?: string | null; temporaryRelayUrls?: string[] | null } = {}
  ) => {
    setIsReady(false)
    if (feedType === 'relays') {
      const relaySetId = options.activeRelaySetId ?? (relaySets.length > 0 ? relaySets[0].id : null)
      if (!relaySetId) return

      const relaySet =
        relaySets.find((set) => set.id === options.activeRelaySetId) ??
        (relaySets.length > 0 ? relaySets[0] : null)
      if (relaySet) {
        setFeedType(feedType)
        setRelayUrls(relaySet.relayUrls)
        setActiveRelaySetId(relaySet.id)
        setFilter({})
        setIsReady(true)
        storage.setActiveRelaySetId(relaySet.id)
        storage.setFeedType(feedType)
      }
      return
    }
    if (feedType === 'following') {
      if (!pubkey) return
      setFeedType(feedType)
      setActiveRelaySetId(null)
      const [relayList, followings] = await Promise.all([
        client.fetchRelayList(pubkey),
        client.fetchFollowings(pubkey)
      ])
      setRelayUrls(relayList.read.slice(0, 4))
      setFilter({ authors: followings.includes(pubkey) ? followings : [...followings, pubkey] })
      setIsReady(true)
      storage.setFeedType(feedType)
      return
    }
    if (feedType === 'temporary') {
      const urls = options.temporaryRelayUrls ?? temporaryRelayUrls
      if (!urls.length) return

      setFeedType(feedType)
      setTemporaryRelayUrls(urls)
      setRelayUrls(urls)
      setActiveRelaySetId(null)
      setFilter({})
      setIsReady(true)
      return
    }
    setIsReady(true)
  }

  return (
    <FeedContext.Provider
      value={{
        feedType,
        relayUrls,
        temporaryRelayUrls,
        filter,
        isReady,
        activeRelaySetId,
        switchFeed
      }}
    >
      {children}
    </FeedContext.Provider>
  )
}
