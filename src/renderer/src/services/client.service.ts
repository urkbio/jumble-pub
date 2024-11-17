import { TDraftEvent, TRelayGroup } from '@common/types'
import { formatPubkey } from '@renderer/lib/pubkey'
import { tagNameEquals } from '@renderer/lib/tag'
import { isWebsocketUrl, normalizeUrl } from '@renderer/lib/url'
import { TProfile, TRelayList } from '@renderer/types'
import DataLoader from 'dataloader'
import { LRUCache } from 'lru-cache'
import {
  EventTemplate,
  Filter,
  kinds,
  Event as NEvent,
  SimplePool,
  VerifiedEvent
} from 'nostr-tools'
import { EVENT_TYPES, eventBus } from './event-bus.service'
import storage from './storage.service'

const BIG_RELAY_URLS = [
  'wss://relay.damus.io/',
  'wss://nos.lol/',
  'wss://relay.nostr.band/',
  'wss://relay.noswhere.com/'
]

class ClientService {
  static instance: ClientService

  private pool = new SimplePool()
  private relayUrls: string[] = BIG_RELAY_URLS
  private initPromise!: Promise<void>

  private eventByFilterCache = new LRUCache<string, Promise<NEvent | undefined>>({
    max: 10000,
    fetchMethod: async (filterStr) => {
      const events = await this.fetchEvents(BIG_RELAY_URLS, JSON.parse(filterStr))
      events.forEach((event) => this.addEventToCache(event))
      return events.sort((a, b) => b.created_at - a.created_at)[0]
    }
  })
  private eventByIdCache = new LRUCache<string, Promise<NEvent | undefined>>({ max: 10000 })
  private eventDataloader = new DataLoader<string, NEvent | undefined>(
    this.eventBatchLoadFn.bind(this),
    { cacheMap: this.eventByIdCache }
  )
  private profileDataloader = new DataLoader<string, TProfile | undefined>(
    this.profileBatchLoadFn.bind(this),
    {
      cacheMap: new LRUCache<string, Promise<TProfile | undefined>>({ max: 10000 })
    }
  )
  private relayListDataLoader = new DataLoader<string, TRelayList>(
    this.relayListBatchLoadFn.bind(this),
    {
      cacheMap: new LRUCache<string, Promise<TRelayList>>({ max: 10000 })
    }
  )
  private followListCache = new LRUCache<string, Promise<NEvent | undefined>>({
    max: 10000,
    fetchMethod: this._fetchFollowListEvent.bind(this)
  })

  constructor() {
    if (!ClientService.instance) {
      this.initPromise = this.init()
      ClientService.instance = this
    }
    return ClientService.instance
  }

  async init() {
    const relayGroups = await storage.getRelayGroups()
    this.relayUrls = relayGroups.find((group) => group.isActive)?.relayUrls ?? []
    eventBus.on(EVENT_TYPES.RELAY_GROUPS_CHANGED, (event) => {
      this.onRelayGroupsChange(event.detail)
    })
  }

  onRelayGroupsChange(relayGroups: TRelayGroup[]) {
    const newRelayUrls = relayGroups.find((group) => group.isActive)?.relayUrls ?? []
    this.relayUrls = newRelayUrls
  }

  listConnectionStatus() {
    return this.pool.listConnectionStatus()
  }

  async publishEvent(relayUrls: string[], event: NEvent) {
    return await Promise.any(this.pool.publish(this.relayUrls.concat(relayUrls), event))
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
            that.eventByIdCache.set(evt.id, Promise.resolve(evt))
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
              events.sort((a, b) => b.created_at - a.created_at)
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

  async fetchEvents(relayUrls: string[], filter: Filter) {
    await this.initPromise
    // If relayUrls is empty, use this.relayUrls
    return await this.pool.querySync(relayUrls.length > 0 ? relayUrls : BIG_RELAY_URLS, filter)
  }

  async fetchEventByFilter(filter: Filter) {
    return this.eventByFilterCache.fetch(JSON.stringify({ ...filter, limit: 1 }))
  }

  async fetchEventById(id: string): Promise<NEvent | undefined> {
    return this.eventDataloader.load(id)
  }

  addEventToCache(event: NEvent) {
    this.eventByIdCache.set(event.id, Promise.resolve(event))
  }

  async fetchProfile(pubkey: string): Promise<TProfile | undefined> {
    return this.profileDataloader.load(pubkey)
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

  private async eventBatchLoadFn(ids: readonly string[]) {
    const events = await this.fetchEvents(BIG_RELAY_URLS, {
      ids: ids as string[],
      limit: ids.length
    })
    const eventsMap = new Map<string, NEvent>()
    for (const event of events) {
      eventsMap.set(event.id, event)
    }

    return ids.map((id) => eventsMap.get(id))
  }

  private async profileBatchLoadFn(pubkeys: readonly string[]) {
    const events = await this.fetchEvents(BIG_RELAY_URLS, {
      authors: pubkeys as string[],
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
    const events = await this.fetchEvents(BIG_RELAY_URLS, {
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
    const followListEvents = await this.fetchEvents(relayList.write.concat(BIG_RELAY_URLS), {
      authors: [pubkey],
      kinds: [kinds.Contacts]
    })

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
        about: profileObj.about
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
