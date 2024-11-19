import client from '@renderer/services/client.service'
import { Repeat2 } from 'lucide-react'
import { Event, kinds, verifyEvent } from 'nostr-tools'
import Username from '../Username'
import ShortTextNoteCard from './ShortTextNoteCard'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'

export default function RepostNoteCard({ event, className }: { event: Event; className?: string }) {
  const { t } = useTranslation()
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

  return (
    <div className={className}>
      <div className="flex gap-1 mb-1 pl-4 text-sm items-center text-muted-foreground">
        <Repeat2 size={16} className="shrink-0" />
        <Username
          userId={event.pubkey}
          className="font-semibold truncate"
          skeletonClassName="h-3"
        />
        <div>{t('reposted')}</div>
      </div>
      <ShortTextNoteCard event={targetEvent} />
    </div>
  )
}
