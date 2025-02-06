import { useMuteList } from '@/providers/MuteListProvider'
import client from '@/services/client.service'
import { Event, kinds, verifyEvent } from 'nostr-tools'
import { useMemo } from 'react'
import NormalNoteCard from './NormalNoteCard'

export default function RepostNoteCard({
  event,
  className,
  filterMutedNotes = true
}: {
  event: Event
  className?: string
  filterMutedNotes?: boolean
}) {
  const { mutePubkeys } = useMuteList()
  const targetEvent = useMemo(() => {
    const targetEvent = event.content ? (JSON.parse(event.content) as Event) : null
    try {
      if (!targetEvent || !verifyEvent(targetEvent) || targetEvent.kind !== kinds.ShortTextNote) {
        return null
      }
      client.addEventToCache(targetEvent)
    } catch {
      return null
    }

    return targetEvent
  }, [event])
  if (!targetEvent) return null
  if (filterMutedNotes && mutePubkeys.includes(targetEvent.pubkey)) {
    return null
  }

  return <NormalNoteCard className={className} reposter={event.pubkey} event={targetEvent} />
}
