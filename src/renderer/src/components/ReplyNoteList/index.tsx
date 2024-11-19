import { Separator } from '@renderer/components/ui/separator'
import { isReplyNoteEvent } from '@renderer/lib/event'
import { isReplyETag, isRootETag } from '@renderer/lib/tag'
import { cn } from '@renderer/lib/utils'
import { useNoteStats } from '@renderer/providers/NoteStatsProvider'
import client from '@renderer/services/client.service'
import dayjs from 'dayjs'
import { Event } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import ReplyNote from '../ReplyNote'

export default function ReplyNoteList({ event, className }: { event: Event; className?: string }) {
  const [replies, setReplies] = useState<Event[]>([])
  const [replyMap, setReplyMap] = useState<
    Record<string, { event: Event; level: number; parent?: Event } | undefined>
  >({})
  const [until, setUntil] = useState<number>(() => dayjs().unix())
  const [loading, setLoading] = useState<boolean>(false)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const [highlightReplyId, setHighlightReplyId] = useState<string | undefined>(undefined)
  const { updateNoteReplyCount } = useNoteStats()
  const replyRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const loadMore = async () => {
    setLoading(true)
    const relayList = await client.fetchRelayList(event.pubkey)
    const events = await client.fetchEvents(relayList.read.slice(0, 5), {
      '#e': [event.id],
      kinds: [1],
      limit: 100,
      until
    })
    const sortedEvents = events.sort((a, b) => a.created_at - b.created_at)
    const processedEvents = events.filter((e) => isReplyNoteEvent(e))
    if (processedEvents.length > 0) {
      setReplies((pre) => [...processedEvents, ...pre])
    }
    if (sortedEvents.length > 0) {
      setUntil(sortedEvents[0].created_at - 1)
    }
    setHasMore(sortedEvents.length >= 100)
    setLoading(false)
  }

  useEffect(() => {
    loadMore()
  }, [])

  useEffect(() => {
    updateNoteReplyCount(event.id, replies.length)

    const replyMap: Record<string, { event: Event; level: number; parent?: Event } | undefined> = {}
    for (const reply of replies) {
      const parentReplyTag = reply.tags.find(isReplyETag)
      if (parentReplyTag) {
        const parentReplyInfo = replyMap[parentReplyTag[1]]
        const level = parentReplyInfo ? parentReplyInfo.level + 1 : 1
        replyMap[reply.id] = { event: reply, level, parent: parentReplyInfo?.event }
        continue
      }

      const rootReplyTag = reply.tags.find(isRootETag)
      if (rootReplyTag) {
        replyMap[reply.id] = { event: reply, level: 1 }
        continue
      }

      let level = 0
      let parent: Event | undefined
      for (const [tagName, tagValue] of reply.tags) {
        if (tagName === 'e') {
          const info = replyMap[tagValue]
          if (info && info.level > level) {
            level = info.level
            parent = info.event
          }
        }
      }
      replyMap[reply.id] = { event: reply, level: level + 1, parent }
    }
    setReplyMap(replyMap)
  }, [replies])

  const onClickParent = (eventId: string) => {
    const ref = replyRefs.current[eventId]
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
    setHighlightReplyId(eventId)
    setTimeout(() => {
      setHighlightReplyId((pre) => (pre === eventId ? undefined : pre))
    }, 1500)
  }

  return (
    <>
      <div
        className={`text-sm text-center text-muted-foreground ${!loading ? 'hover:text-foreground cursor-pointer' : ''}`}
        onClick={loadMore}
      >
        {loading ? 'loading...' : hasMore ? 'load more older replies' : null}
      </div>
      {replies.length > 0 && (loading || hasMore) && <Separator className="my-4" />}
      <div className={cn('mb-4', className)}>
        {replies.map((reply, index) => {
          const info = replyMap[reply.id]
          return (
            <div ref={(el) => (replyRefs.current[reply.id] = el)} key={index}>
              <ReplyNote
                event={reply}
                parentEvent={info?.parent}
                onClickParent={onClickParent}
                highlight={highlightReplyId === reply.id}
              />
            </div>
          )
        })}
      </div>
      {replies.length === 0 && !loading && !hasMore && (
        <div className="text-sm text-center text-muted-foreground">no replies</div>
      )}
    </>
  )
}
