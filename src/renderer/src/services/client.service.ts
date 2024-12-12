import { TDraftEvent } from '@common/types'
import { isReplyNoteEvent } from '@renderer/lib/event'
import { formatPubkey } from '@renderer/lib/pubkey'
import { tagNameEquals } from '@renderer/lib/tag'
import { isWebsocketUrl, normalizeUrl } from '@renderer/lib/url'
import { TProfile, TRelayInfo, TRelayList } from '@renderer/types'
import DataLoader from 'dataloader'
import { LRUCache } from 'lru-cache'
import {
  EventTemplate,
  Filter,
  kinds,
  Event as NEvent,
  nip19,
  SimplePool,
  VerifiedEvent
} from 'nostr-tools'

const BIG_RELAY_URLS = [
  'wss://relay.damus.io/',
  'wss://nos.lol/',
  'wss://relay.nostr.band/',
  'wss://relay.noswhere.com/'
]

class ClientService {
  static instance: ClientService

  private defaultRelayUrls: string[] = BIG_RELAY_URLS
  private pool = new SimplePool()

  private eventCache = new LRUCache<string, Promise<NEvent | undefined>>({ max: 10000 })
  private eventDataLoader = new DataLoader<string, NEvent | undefined>(
    (ids) => Promise.all(ids.map((id) => this._fetchEvent(id))),
    { cacheMap: this.eventCache }
  )
  private fetchEventFromDefaultRelaysDataloader = new DataLoader<string, NEvent | undefined>(
    this.eventBatchLoadFn.bind(this),
    { cache: false }
  )
  private repliesCache = new LRUCache<string, { refs: [string, number][]; until?: number }>({
    max: 1000
  })
  private notificationsCache: [string, number][] = []
  private profileCache = new LRUCache<string, Promise<TProfile>>({ max: 10000 })
  private profileDataloader = new DataLoader<string, TProfile>(
    (ids) => Promise.all(ids.map((id) => this._fetchProfile(id))),
    { cacheMap: this.profileCache }
  )
  private fetchProfileFromDefaultRelaysDataloader = new DataLoader<string, TProfile | undefined>(
    this.profileBatchLoadFn.bind(this),
    { cache: false }
  )
  private relayListDataLoader = new DataLoader<string, TRelayList>(
    this.relayListBatchLoadFn.bind(this),
    {
      cacheMap: new LRUCache<string, Promise<TRelayList>>({ max: 10000 })
    }
  )
  private relayInfoDataLoader = new DataLoader<string, TRelayInfo | undefined>(async (urls) => {
    return await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(url.replace('ws://', 'http://').replace('wss://', 'https://'), {
            headers: { Accept: 'application/nostr+json' }
          })
          return res.json() as TRelayInfo
        } catch {
          return undefined
        }
      })
    )
  })
  private followListCache = new LRUCache<string, Promise<NEvent | undefined>>({
    max: 10000,
    fetchMethod: this._fetchFollowListEvent.bind(this)
  })

  constructor() {
    if (!ClientService.instance) {
      ClientService.instance = this
    }
    return ClientService.instance
  }

  listConnectionStatus() {
    return this.pool.listConnectionStatus()
  }

  setCurrentRelayUrls(urls: string[]) {
    this.defaultRelayUrls = Array.from(new Set(urls.concat(BIG_RELAY_URLS)))
  }

  async publishEvent(relayUrls: string[], event: NEvent) {
    return await Promise.any(this.pool.publish(relayUrls, event))
  }

  subscribeEventsWithAuth(
    urls: string[],
    filter: Filter,
    {
      onEose,
      onNew
    }: {
      onEose: (events: NEvent[]) => void
      onNew: (evt: NEvent) => void
    },
    signer?: (evt: TDraftEvent) => Promise<NEvent>
  ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const _knownIds = new Set<string>()
    const events: NEvent[] = []
    let started = 0
    let eosed = 0
    const subPromises = urls.map(async (url) => {
      const relay = await this.pool.ensureRelay(url)
      let hasAuthed = false

      return startSub()

      function startSub() {
        started++
        return relay.subscribe([filter], {
          alreadyHaveEvent: (id: string) => {
            const have = _knownIds.has(id)
            _knownIds.add(id)
            return have
          },
          onevent(evt: NEvent) {
            if (eosed === started) {
              onNew(evt)
            } else {
              events.push(evt)
            }
            that.eventDataLoader.prime(evt.id, Promise.resolve(evt))
          },
          onclose(reason: string) {
            if (reason.startsWith('auth-required:')) {
              if (!hasAuthed && signer) {
                relay
                  .auth((authEvt: EventTemplate) => {
                    return signer(authEvt) as Promise<VerifiedEvent>
                  })
                  .then(() => {
                    hasAuthed = true
                    startSub()
                  })
              }
            }
          },
          oneose() {
            eosed++
            if (eosed === started) {
              onEose(events)
            }
          }
        })
      }
    })

    return () => {
      onEose = () => {}
      onNew = () => {}
      subPromises.forEach((subPromise) => {
        subPromise.then((sub) => {
          sub.close()
        })
      })
    }
  }

  async subscribeReplies(
    relayUrls: string[],
    parentEventId: string,
    limit: number,
    {
      onReplies,
      onNew
    }: {
      onReplies: (events: NEvent[], isCache: boolean, until?: number) => void
      onNew: (evt: NEvent) => void
    }
  ) {
    let cache = this.repliesCache.get(parentEventId)
    const refs = cache?.refs ?? []
    let replies: NEvent[] = []
    if (cache) {
      replies = (await Promise.all(cache.refs.map(([id]) => this.eventCache.get(id)))).filter(
        Boolean
      ) as NEvent[]
      onReplies(replies, true, cache.until)
    } else {
      cache = { refs }
      this.repliesCache.set(parentEventId, cache)
    }
    const since = replies.length ? replies[replies.length - 1].created_at + 1 : undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const events: NEvent[] = []
    let hasEosed = false
    const closer = this.pool.subscribeMany(
      relayUrls.length > 0 ? relayUrls : this.defaultRelayUrls,
      [
        {
          '#e': [parentEventId],
          kinds: [kinds.ShortTextNote],
          limit,
          since
        }
      ],
      {
        onevent(evt: NEvent) {
          if (hasEosed) {
            if (!isReplyNoteEvent(evt)) return
            onNew(evt)
          } else {
            events.push(evt)
          }
          that.eventDataLoader.prime(evt.id, Promise.resolve(evt))
        },
        oneose() {
          hasEosed = true
          const newReplies = events
            .sort((a, b) => a.created_at - b.created_at)
            .slice(0, limit)
            .filter(isReplyNoteEvent)
          replies = replies.concat(newReplies)
          // first fetch
          if (!since) {
            cache.until = events.length >= limit ? events[0].created_at - 1 : undefined
          }
          onReplies(replies, false, cache.until)
          const lastRefCreatedAt = refs.length ? refs[refs.length - 1][1] : undefined
          if (lastRefCreatedAt) {
            refs.push(
              ...newReplies
                .filter((reply) => reply.created_at > lastRefCreatedAt)
                .map((evt) => [evt.id, evt.created_at] as [string, number])
            )
          } else {
            refs.push(...newReplies.map((evt) => [evt.id, evt.created_at] as [string, number]))
          }
        }
      }
    )

    return () => {
      onReplies = () => {}
      onNew = () => {}
      closer.close()
    }
  }

  async subscribeNotifications(
    pubkey: string,
    limit: number,
    {
      onNotifications,
      onNew
    }: {
      onNotifications: (events: NEvent[], isCache: boolean) => void
      onNew: (evt: NEvent) => void
    }
  ) {
    let cachedNotifications: NEvent[] = []
    if (this.notificationsCache.length) {
      cachedNotifications = (
        await Promise.all(this.notificationsCache.map(([id]) => this.eventCache.get(id)))
      ).filter(Boolean) as NEvent[]
      onNotifications(cachedNotifications, true)
    }
    const since = this.notificationsCache.length ? this.notificationsCache[0][1] + 1 : undefined

    const relayList = await this.fetchRelayList(pubkey)

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    const events: NEvent[] = []
    let hasEosed = false
    let count = 0
    const closer = this.pool.subscribeMany(
      relayList.read.length >= 4
        ? relayList.read
        : relayList.read.concat(this.defaultRelayUrls).slice(0, 4),
      [
        {
          kinds: [kinds.ShortTextNote, kinds.Repost, kinds.Reaction],
          '#p': [pubkey],
          limit,
          since
        }
      ],
      {
        onevent(evt: NEvent) {
          count++
          if (hasEosed) {
            if (evt.pubkey === pubkey) return
            onNew(evt)
          } else {
            events.push(evt)
          }
          that.eventDataLoader.prime(evt.id, Promise.resolve(evt))
        },
        oneose() {
          hasEosed = true
          const newNotifications = events
            .sort((a, b) => b.created_at - a.created_at)
            .slice(0, limit)
            .filter((evt) => evt.pubkey !== pubkey)
          if (count >= limit) {
            that.notificationsCache = newNotifications.map(
              (evt) => [evt.id, evt.created_at] as [string, number]
            )
            onNotifications(newNotifications, false)
          } else {
            that.notificationsCache = [
              ...newNotifications.map((evt) => [evt.id, evt.created_at] as [string, number]),
              ...that.notificationsCache
            ]
            onNotifications(newNotifications.concat(cachedNotifications), false)
          }
        }
      }
    )

    return () => {
      onNotifications = () => {}
      onNew = () => {}
      closer.close()
    }
  }

  async fetchMoreReplies(relayUrls: string[], parentEventId: string, until: number, limit: number) {
    let events = await this.pool.querySync(relayUrls, {
      '#e': [parentEventId],
      kinds: [kinds.ShortTextNote],
      limit,
      until
    })
    events.forEach((evt) => {
      this.eventDataLoader.prime(evt.id, Promise.resolve(evt))
    })
    events = events.sort((a, b) => a.created_at - b.created_at).slice(0, limit)
    const replies = events.filter((evt) => isReplyNoteEvent(evt))
    let cache = this.repliesCache.get(parentEventId)
    if (!cache) {
      cache = { refs: [] }
      this.repliesCache.set(parentEventId, cache)
    }
    const refs = cache.refs
    const firstRefCreatedAt = refs.length ? refs[0][1] : undefined
    const newRefs = firstRefCreatedAt
      ? replies
          .filter((evt) => evt.created_at < firstRefCreatedAt)
          .map((evt) => [evt.id, evt.created_at] as [string, number])
      : replies.map((evt) => [evt.id, evt.created_at] as [string, number])

    if (newRefs.length) {
      refs.unshift(...newRefs)
    }
    cache.until = events.length >= limit ? events[0].created_at - 1 : undefined
    return { replies, until: cache.until }
  }

  async fetchMoreNotifications(pubkey: string, until: number, limit: number) {
    const relayList = await this.fetchRelayList(pubkey)
    const events = await this.pool.querySync(
      relayList.read.length >= 4
        ? relayList.read
        : relayList.read.concat(this.defaultRelayUrls).slice(0, 4),
      {
        kinds: [kinds.ShortTextNote, kinds.Repost, kinds.Reaction],
        '#p': [pubkey],
        limit,
        until
      }
    )
    events.forEach((evt) => {
      this.eventDataLoader.prime(evt.id, Promise.resolve(evt))
    })
    const notifications = events
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, limit)
      .filter((evt) => evt.pubkey !== pubkey)

    const cacheLastCreatedAt = this.notificationsCache.length
      ? this.notificationsCache[this.notificationsCache.length - 1][1]
      : undefined
    this.notificationsCache = this.notificationsCache.concat(
      (cacheLastCreatedAt
        ? notifications.filter((evt) => evt.created_at < cacheLastCreatedAt)
        : notifications
      ).map((evt) => [evt.id, evt.created_at] as [string, number])
    )

    return notifications
  }

  clearNotificationsCache() {
    this.notificationsCache = []
  }

  async fetchEvents(relayUrls: string[], filter: Filter, cache = false) {
    const events = await this.pool.querySync(
      relayUrls.length > 0 ? relayUrls : this.defaultRelayUrls,
      filter
    )
    if (cache) {
      events.forEach((evt) => {
        this.eventDataLoader.prime(evt.id, Promise.resolve(evt))
      })
    }
    return events
  }

  async fetchEvent(id: string): Promise<NEvent | undefined> {
    if (!/^[0-9a-f]{64}$/.test(id)) {
      let eventId: string | undefined
      const { type, data } = nip19.decode(id)
      switch (type) {
        case 'note':
          eventId = data
          break
        case 'nevent':
          eventId = data.id
          break
      }
      if (eventId) {
        const cache = await this.eventCache.get(eventId)
        if (cache) {
          return cache
        }
      }
    }
    return this.eventDataLoader.load(id)
  }

  addEventToCache(event: NEvent) {
    this.eventDataLoader.prime(event.id, Promise.resolve(event))
  }

  async fetchProfile(id: string): Promise<TProfile | undefined> {
    if (!/^[0-9a-f]{64}$/.test(id)) {
      let pubkey: string | undefined
      const { data, type } = nip19.decode(id)
      switch (type) {
        case 'npub':
          pubkey = data
          break
        case 'nprofile':
          pubkey = data.pubkey
          break
      }

      if (!pubkey) {
        throw new Error('Invalid id')
      }

      const cache = await this.profileCache.get(pubkey)
      if (cache) {
        return cache
      }
    }

    return this.profileDataloader.load(id)
  }

  async fetchProfiles(relayUrls: string[], filter: Filter): Promise<TProfile[]> {
    const events = await this.pool.querySync(relayUrls, {
      ...filter,
      kinds: [kinds.Metadata]
    })

    const profiles = events
      .sort((a, b) => b.created_at - a.created_at)
      .map((event) => this.parseProfileFromEvent(event))
    profiles.forEach((profile) => this.profileDataloader.prime(profile.pubkey, profile))
    return profiles
  }

  async fetchRelayList(pubkey: string): Promise<TRelayList> {
    return this.relayListDataLoader.load(pubkey)
  }

  async fetchFollowListEvent(pubkey: string) {
    return this.followListCache.fetch(pubkey)
  }

  updateFollowListCache(pubkey: string, event: NEvent) {
    this.followListCache.set(pubkey, Promise.resolve(event))
  }

  async fetchRelayInfos(urls: string[]) {
    const infos = await this.relayInfoDataLoader.loadMany(urls)
    return infos.map((info) => (info ? (info instanceof Error ? undefined : info) : undefined))
  }

  private async fetchEventById(relayUrls: string[], id: string): Promise<NEvent | undefined> {
    const event = await this.fetchEventFromDefaultRelaysDataloader.load(id)
    if (event) {
      return event
    }

    return this.tryHarderToFetchEvent(relayUrls, { ids: [id], limit: 1 }, true)
  }

  private async _fetchEvent(id: string): Promise<NEvent | undefined> {
    let filter: Filter | undefined
    let relays: string[] = []
    if (/^[0-9a-f]{64}$/.test(id)) {
      filter = { ids: [id] }
    } else {
      const { type, data } = nip19.decode(id)
      switch (type) {
        case 'note':
          filter = { ids: [data] }
          break
        case 'nevent':
          filter = { ids: [data.id] }
          if (data.relays) relays = data.relays
          break
        case 'naddr':
          filter = {
            authors: [data.pubkey],
            kinds: [data.kind],
            limit: 1
          }
          if (data.identifier) {
            filter['#d'] = [data.identifier]
          }
          if (data.relays) relays = data.relays
      }
    }
    if (!filter) {
      throw new Error('Invalid id')
    }

    let event: NEvent | undefined
    if (filter.ids) {
      event = await this.fetchEventById(relays, filter.ids[0])
    } else {
      event = await this.tryHarderToFetchEvent(relays, filter)
    }

    if (event && event.id !== id) {
      this.eventDataLoader.prime(event.id, Promise.resolve(event))
    }

    return event
  }

  private async _fetchProfile(id: string): Promise<TProfile> {
    let pubkey: string | undefined
    let relays: string[] = []
    if (/^[0-9a-f]{64}$/.test(id)) {
      pubkey = id
    } else {
      const { data, type } = nip19.decode(id)
      switch (type) {
        case 'npub':
          pubkey = data
          break
        case 'nprofile':
          pubkey = data.pubkey
          if (data.relays) relays = data.relays
          break
      }
    }

    if (!pubkey) {
      throw new Error('Invalid id')
    }

    const profileFromDefaultRelays = await this.fetchProfileFromDefaultRelaysDataloader.load(pubkey)
    if (profileFromDefaultRelays) {
      return profileFromDefaultRelays
    }

    const profileEvent = await this.tryHarderToFetchEvent(
      relays,
      {
        authors: [pubkey],
        kinds: [kinds.Metadata],
        limit: 1
      },
      true
    )
    const profile = profileEvent
      ? this.parseProfileFromEvent(profileEvent)
      : { pubkey, username: formatPubkey(pubkey) }

    if (pubkey !== id) {
      this.profileDataloader.prime(pubkey, Promise.resolve(profile))
    }

    return profile
  }

  private async tryHarderToFetchEvent(
    relayUrls: string[],
    filter: Filter,
    alreadyFetchedFromDefaultRelays = false
  ) {
    if (!relayUrls.length && filter.authors?.length) {
      const relayList = await this.fetchRelayList(filter.authors[0])
      relayUrls = alreadyFetchedFromDefaultRelays
        ? relayList.write.filter((url) => !this.defaultRelayUrls.includes(url)).slice(0, 4)
        : relayList.write.slice(0, 4)
    } else if (!relayUrls.length && !alreadyFetchedFromDefaultRelays) {
      relayUrls = this.defaultRelayUrls
    }
    if (!relayUrls.length) return

    const events = await this.pool.querySync(relayUrls, filter)
    return events.sort((a, b) => b.created_at - a.created_at)[0]
  }

  private async eventBatchLoadFn(ids: readonly string[]) {
    const events = await this.pool.querySync(this.defaultRelayUrls, {
      ids: Array.from(new Set(ids)),
      limit: ids.length
    })
    const eventsMap = new Map<string, NEvent>()
    for (const event of events) {
      eventsMap.set(event.id, event)
    }

    return ids.map((id) => eventsMap.get(id))
  }

  private async profileBatchLoadFn(pubkeys: readonly string[]) {
    const events = await this.pool.querySync(this.defaultRelayUrls, {
      authors: Array.from(new Set(pubkeys)),
      kinds: [kinds.Metadata],
      limit: pubkeys.length
    })
    const eventsMap = new Map<string, NEvent>()
    for (const event of events) {
      const pubkey = event.pubkey
      const existing = eventsMap.get(pubkey)
      if (!existing || existing.created_at < event.created_at) {
        eventsMap.set(pubkey, event)
      }
    }

    return pubkeys.map((pubkey) => {
      const event = eventsMap.get(pubkey)
      return event ? this.parseProfileFromEvent(event) : undefined
    })
  }

  private async relayListBatchLoadFn(pubkeys: readonly string[]) {
    const events = await this.pool.querySync(this.defaultRelayUrls, {
      authors: pubkeys as string[],
      kinds: [kinds.RelayList],
      limit: pubkeys.length
    })
    const eventsMap = new Map<string, NEvent>()
    for (const event of events) {
      const pubkey = event.pubkey
      const existing = eventsMap.get(pubkey)
      if (!existing || existing.created_at < event.created_at) {
        eventsMap.set(pubkey, event)
      }
    }

    return pubkeys.map((pubkey) => {
      const event = eventsMap.get(pubkey)
      const relayList = { write: [], read: [] } as TRelayList
      if (!event) return relayList

      event.tags.filter(tagNameEquals('r')).forEach(([, url, type]) => {
        if (!url || !isWebsocketUrl(url)) return

        const normalizedUrl = normalizeUrl(url)
        switch (type) {
          case 'w':
            relayList.write.push(normalizedUrl)
            break
          case 'r':
            relayList.read.push(normalizedUrl)
            break
          default:
            relayList.write.push(normalizedUrl)
            relayList.read.push(normalizedUrl)
        }
      })
      return {
        write: relayList.write.slice(0, 10),
        read: relayList.read.slice(0, 10)
      }
    })
  }

  private async _fetchFollowListEvent(pubkey: string) {
    const relayList = await this.fetchRelayList(pubkey)
    const followListEvents = await this.pool.querySync(
      relayList.write.concat(this.defaultRelayUrls),
      {
        authors: [pubkey],
        kinds: [kinds.Contacts]
      }
    )

    return followListEvents.sort((a, b) => b.created_at - a.created_at)[0]
  }

  private parseProfileFromEvent(event: NEvent): TProfile {
    try {
      const profileObj = JSON.parse(event.content)
      return {
        pubkey: event.pubkey,
        banner: profileObj.banner,
        avatar: profileObj.picture,
        username:
          profileObj.display_name?.trim() ||
          profileObj.name?.trim() ||
          profileObj.nip05?.split('@')[0]?.trim() ||
          formatPubkey(event.pubkey),
        nip05: profileObj.nip05,
        about: profileObj.about,
        created_at: event.created_at
      }
    } catch (err) {
      console.error(err)
      return {
        pubkey: event.pubkey,
        username: formatPubkey(event.pubkey)
      }
    }
  }
}

const instance = new ClientService()

export default instance
