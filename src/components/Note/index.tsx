import { useSecondaryPage } from '@/PageManager'
import { toNote } from '@/lib/link'
import { Event } from 'nostr-tools'
import Content from '../Content'
import { FormattedTimestamp } from '../FormattedTimestamp'
import NoteStats from '../NoteStats'
import ParentNotePreview from '../ParentNotePreview'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function Note({
  event,
  parentEvent,
  size = 'normal',
  className,
  hideStats = false,
  fetchNoteStats = false
}: {
  event: Event
  parentEvent?: Event
  size?: 'normal' | 'small'
  className?: string
  hideStats?: boolean
  fetchNoteStats?: boolean
}) {
  const { push } = useSecondaryPage()

  return (
    <div className={className}>
      <div className="flex items-center space-x-2">
        <UserAvatar userId={event.pubkey} size={size === 'small' ? 'small' : 'normal'} />
        <div
          className={`flex-1 w-0 ${size === 'small' ? 'flex space-x-2 items-end overflow-hidden' : ''}`}
        >
          <Username
            userId={event.pubkey}
            className={`font-semibold flex ${size === 'small' ? 'text-sm' : ''}`}
            skeletonClassName={size === 'small' ? 'h-3' : 'h-4'}
          />
          <div className="text-xs text-muted-foreground line-clamp-1">
            <FormattedTimestamp timestamp={event.created_at} />
          </div>
        </div>
      </div>
      {parentEvent && (
        <ParentNotePreview
          event={parentEvent}
          className="mt-2"
          onClick={(e) => {
            e.stopPropagation()
            push(toNote(parentEvent))
          }}
        />
      )}
      <Content className="mt-2" event={event} />
      {!hideStats && (
        <NoteStats className="mt-3 sm:mt-4" event={event} fetchIfNotExisting={fetchNoteStats} />
      )}
    </div>
  )
}
