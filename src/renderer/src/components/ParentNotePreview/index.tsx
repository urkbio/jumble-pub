import { Event } from 'nostr-tools'
import UserAvatar from '../UserAvatar'
import { cn } from '@renderer/lib/utils'

export default function ParentNotePreview({
  event,
  className,
  onClick
}: {
  event: Event
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
}) {
  return (
    <div
      className={cn(
        'flex space-x-1 items-center text-sm rounded-full px-2 bg-muted w-fit max-w-full text-muted-foreground hover:text-foreground cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="shrink-0">reply to</div>
      <UserAvatar userId={event.pubkey} size="tiny" />
      <div className="truncate">{event.content}</div>
    </div>
  )
}
