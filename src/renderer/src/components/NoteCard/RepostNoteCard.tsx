import { Repeat2 } from 'lucide-react'
import { Event, verifyEvent } from 'nostr-tools'
import Username from '../Username'
import ShortTextNoteCard from './ShortTextNoteCard'

export default function RepostNoteCard({ event, className }: { event: Event; className?: string }) {
  const targetEvent = event.content ? (JSON.parse(event.content) as Event) : null
  if (!targetEvent || !verifyEvent(targetEvent)) return null

  return (
    <div className={className}>
      <div className="flex gap-1 mb-1 pl-4 text-xs items-center text-muted-foreground">
        <Repeat2 size={12} className="shrink-0" />
        <Username userId={event.pubkey} className="font-semibold truncate" />
        <div>reposted</div>
      </div>
      <ShortTextNoteCard event={targetEvent} />
    </div>
  )
}
