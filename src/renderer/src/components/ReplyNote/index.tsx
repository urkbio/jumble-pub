import { Event } from 'nostr-tools'
import { formatTimestamp } from '@renderer/lib/timestamp'
import Content from '../Content'
import UserAvatar from '../UserAvatar'
import Username from '../Username'
import LikeButton from '../NoteStats/LikeButton'

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
  return (
    <div
      className={`flex space-x-2 items-start rounded-lg p-2 transition-colors duration-500 ${highlight ? 'bg-highlight/50' : ''}`}
    >
      <UserAvatar userId={event.pubkey} size="small" className="shrink-0" />
      <div className="w-full overflow-hidden">
        <div className="flex items-end gap-2">
          <Username
            userId={event.pubkey}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground truncate"
          />
          <div className="text-xs text-muted-foreground shrink-0 -top-[1px] relative">
            {formatTimestamp(event.created_at)}
          </div>
        </div>
        {parentEvent && (
          <div
            className="text-xs text-muted-foreground truncate hover:text-foreground cursor-pointer"
            onClick={() => onClickParent(parentEvent.id)}
          >
            <ParentReplyNote event={parentEvent} />
          </div>
        )}
        <Content event={event} size="small" />
      </div>
      <LikeButton event={event} variant="reply" />
    </div>
  )
}

function ParentReplyNote({ event }: { event: Event }) {
  return (
    <div className="flex space-x-1 items-center text-xs rounded-lg w-fit px-2 bg-muted max-w-full">
      <div>reply to</div>
      <UserAvatar userId={event.pubkey} size="tiny" />
      <div className="truncate">{event.content}</div>
    </div>
  )
}
