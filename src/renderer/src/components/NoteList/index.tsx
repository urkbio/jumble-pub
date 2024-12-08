import { Button } from '@renderer/components/ui/button'
import { Switch } from '@renderer/components/ui/switch'
import { useFetchRelayInfos } from '@renderer/hooks'
import { isReplyNoteEvent } from '@renderer/lib/event'
import { cn } from '@renderer/lib/utils'
import { useNostr } from '@renderer/providers/NostrProvider'
import { useScreenSize } from '@renderer/providers/ScreenSizeProvider'
import client from '@renderer/services/client.service'
import dayjs from 'dayjs'
import { Event, Filter, kinds } from 'nostr-tools'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NoteCard from '../NoteCard'

export default function NoteList({
  relayUrls,
  filter = {},
  className
}: {
  relayUrls: string[]
  filter?: Filter
  className?: string
}) {
  const { t } = useTranslation()
  const { isReady, signEvent } = useNostr()
  const { isFetching: isFetchingRelayInfo, areAlgoRelays } = useFetchRelayInfos(relayUrls)
  const [events, setEvents] = useState<Event[]>([])
  const [newEvents, setNewEvents] = useState<Event[]>([])
  const [until, setUntil] = useState<number>(() => dayjs().unix())
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [initialized, setInitialized] = useState(false)
  const [displayReplies, setDisplayReplies] = useState(false)
  const observer = useRef<IntersectionObserver | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const noteFilter = useMemo(() => {
    return {
      kinds: [kinds.ShortTextNote, kinds.Repost],
      limit: areAlgoRelays ? 500 : 200,
      ...filter
    }
  }, [JSON.stringify(filter), areAlgoRelays])

  useEffect(() => {
    if (!isReady || isFetchingRelayInfo) return

    setInitialized(false)
    setEvents([])
    setNewEvents([])
    setHasMore(true)

    const subCloser = client.subscribeEventsWithAuth(
      relayUrls,
      noteFilter,
      {
        onEose: (events) => {
          if (!areAlgoRelays) {
            events.sort((a, b) => b.created_at - a.created_at)
          }
          if (events.length > 0) {
            setEvents((pre) => [...pre, ...events])
          }
          if (events.length > 0) {
            setUntil(events[events.length - 1].created_at - 1)
          }
          if (areAlgoRelays) {
            setHasMore(false)
          }
          setInitialized(true)
        },
        onNew: (event) => {
          setNewEvents((oldEvents) => [event, ...oldEvents])
        }
      },
      signEvent
    )

    return () => {
      subCloser()
    }
  }, [
    JSON.stringify(relayUrls),
    JSON.stringify(noteFilter),
    isReady,
    isFetchingRelayInfo,
    areAlgoRelays
  ])

  useEffect(() => {
    if (!initialized) return

    const options = {
      root: null,
      rootMargin: '10px',
      threshold: 1
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    }, options)

    if (bottomRef.current) {
      observer.current.observe(bottomRef.current)
    }

    return () => {
      if (observer.current && bottomRef.current) {
        observer.current.unobserve(bottomRef.current)
      }
    }
  }, [until, initialized, hasMore])

  const loadMore = async () => {
    const events = await client.fetchEvents(relayUrls, { ...noteFilter, until }, true)
    const sortedEvents = events.sort((a, b) => b.created_at - a.created_at)
    if (sortedEvents.length === 0) {
      setHasMore(false)
      return
    }

    if (sortedEvents.length > 0) {
      setEvents((oldEvents) => [...oldEvents, ...sortedEvents])
    }

    setUntil(sortedEvents[sortedEvents.length - 1].created_at - 1)
  }

  const showNewEvents = () => {
    setEvents((oldEvents) => [...newEvents, ...oldEvents])
    setNewEvents([])
  }

  return (
    <div className={cn('space-y-2 sm:space-y-4', className)}>
      <DisplayRepliesSwitch displayReplies={displayReplies} setDisplayReplies={setDisplayReplies} />
      {newEvents.length > 0 && (
        <div className="flex justify-center w-full max-sm:mt-2">
          <Button size="lg" onClick={showNewEvents}>
            {t('show new notes')}
          </Button>
        </div>
      )}
      <div className="flex flex-col sm:gap-4">
        {events
          .filter((event) => displayReplies || !isReplyNoteEvent(event))
          .map((event, i) => (
            <NoteCard key={`${i}-${event.id}`} className="w-full" event={event} />
          ))}
      </div>
      <div className="text-center text-sm text-muted-foreground">
        {hasMore ? <div ref={bottomRef}>{t('loading...')}</div> : t('no more notes')}
      </div>
    </div>
  )
}

function DisplayRepliesSwitch({
  displayReplies,
  setDisplayReplies
}: {
  displayReplies: boolean
  setDisplayReplies: (value: boolean) => void
}) {
  const { t } = useTranslation()
  const { isSmallScreen } = useScreenSize()

  if (isSmallScreen) {
    return (
      <div>
        <div className="flex">
          <div
            className={`w-1/2 text-center py-2 font-semibold ${displayReplies ? 'text-muted-foreground' : ''}`}
            onClick={() => setDisplayReplies(false)}
          >
            {t('Notes')}
          </div>
          <div
            className={`w-1/2 text-center py-2 font-semibold ${displayReplies ? '' : 'text-muted-foreground'}`}
            onClick={() => setDisplayReplies(true)}
          >
            {t('Notes & Replies')}
          </div>
        </div>
        <div
          className={`w-1/2 px-4 transition-transform duration-500 ${displayReplies ? 'translate-x-full' : ''}`}
        >
          <div className="w-full h-1 bg-primary rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-end gap-2">
      <div>{t('Display replies')}</div>
      <Switch checked={displayReplies} onCheckedChange={setDisplayReplies} />
    </div>
  )
}
