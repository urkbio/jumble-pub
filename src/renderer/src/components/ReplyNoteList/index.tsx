import { Separator } from '@renderer/components/ui/separator'
import { isReplyETag, isRootETag } from '@renderer/lib/tag'
import { cn } from '@renderer/lib/utils'
import { useNostr } from '@renderer/providers/NostrProvider'
import { useNoteStats } from '@renderer/providers/NoteStatsProvider'
import client from '@renderer/services/client.service'
import { Event } from 'nostr-tools'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ReplyNote from '../ReplyNote'

export default function ReplyNoteList({ event, className }: { event: Event; className?: string }) {
  const { t } = useTranslation()
  const { isReady, pubkey } = useNostr()
  const [replies, setReplies] = useState<Event[]>([])
  const [replyMap, setReplyMap] = useState<
    Record<string, { event: Event; level: number; parent?: Event } | undefined>
  >({})
  const [until, setUntil] = useState<number | undefined>()
  const [loading, setLoading] = useState<boolean>(false)
  const [highlightReplyId, setHighlightReplyId] = useState<string | undefined>(undefined)
  const { updateNoteReplyCount } = useNoteStats()
  const replyRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    if (!isReady || loading) return

    const init = async () => {
      setLoading(true)
      setReplies([])
      setUntil(undefined)

      try {
        const relayList = await client.fetchRelayList(event.pubkey)
        const closer = await client.subscribeReplies(relayList.read.slice(0, 5), event.id, 100, {
          onReplies: (evts, until) => {
            setReplies(evts)
            setUntil(until)
            setLoading(false)
          },
          onNew: (evt) => {
            setReplies((pre) => [...pre, evt])
            if (evt.pubkey === pubkey) {
              highlightReply(evt.id)
            }
          }
        })
        return closer
      } catch {
        setLoading(false)
      }
      return
    }

    const promise = init()
    return () => {
      promise.then((closer) => closer?.())
    }
  }, [isReady])

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

  const loadMore = async () => {
    if (loading || !until) return

    setLoading(true)
    const relayList = await client.fetchRelayList(event.pubkey)
    const { replies: olderReplies, until: newUntil } = await client.fetchMoreReplies(
      relayList.read.slice(0, 5),
      event.id,
      until,
      100
    )
    if (olderReplies.length > 0) {
      setReplies((pre) => [...olderReplies, ...pre])
    }
    setUntil(newUntil)
    setLoading(false)
  }

  const highlightReply = (eventId: string) => {
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
        {loading ? t('loading...') : until ? t('load more older replies') : null}
      </div>
      {replies.length > 0 && (loading || until) && <Separator className="my-4" />}
      <div className={cn('mb-4', className)}>
        {replies.map((reply, index) => {
          const info = replyMap[reply.id]
          return (
            <div ref={(el) => (replyRefs.current[reply.id] = el)} key={index}>
              <ReplyNote
                event={reply}
                parentEvent={info?.parent}
                onClickParent={highlightReply}
                highlight={highlightReplyId === reply.id}
              />
            </div>
          )
        })}
      </div>
      {replies.length === 0 && !loading && !until && (
        <div className="text-sm text-center text-muted-foreground">{t('no replies')}</div>
      )}
    </>
  )
}
