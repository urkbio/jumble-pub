import { formatTimestamp } from '@renderer/lib/timestamp'
import { Event } from 'nostr-tools'
import { useState } from 'react'
import Content from '../Content'
import LikeButton from '../NoteStats/LikeButton'
import ParentNotePreview from '../ParentNotePreview'
import PostDialog from '../PostDialog'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function ReplyNote({
  event,
  parentEvent,
  onClickParent = () => {},
  highlight = false
}: {
  event: Event
  parentEvent?: Event
  onClickParent?: (eventId: string) => void
  highlight?: boolean
}) {
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false)

  return (
    <div
      className={`flex space-x-2 items-start rounded-lg p-2 transition-colors duration-500 ${highlight ? 'bg-highlight/50' : ''}`}
    >
      <UserAvatar userId={event.pubkey} size="small" className="shrink-0" />
      <div className="w-full overflow-hidden">
        <Username
          userId={event.pubkey}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground truncate"
          skeletonClassName="h-3"
        />
        {parentEvent && (
          <ParentNotePreview event={parentEvent} onClick={() => onClickParent(parentEvent.id)} />
        )}
        <Content event={event} size="small" />
        <div className="flex gap-2 text-xs">
          <div className="text-muted-foreground/60">{formatTimestamp(event.created_at)}</div>
          <div className="text-muted-foreground hover:text-primary cursor-pointer">reply</div>
        </div>
      </div>
      <LikeButton event={event} variant="reply" />
      <PostDialog parentEvent={event} open={isPostDialogOpen} setOpen={setIsPostDialogOpen} />
    </div>
  )
}
