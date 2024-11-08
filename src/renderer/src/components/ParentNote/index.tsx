import { useSecondaryPage } from '@renderer/PageManager'
import { Card } from '@renderer/components/ui/card'
import { toNote } from '@renderer/lib/link'
import { Event } from 'nostr-tools'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function ParentNote({ event }: { event: Event }) {
  const { push } = useSecondaryPage()

  return (
    <div>
      <Card
        className="flex space-x-1 p-1 items-center hover:bg-muted/50 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
        onClick={() => push(toNote(event))}
      >
        <UserAvatar userId={event.pubkey} size="tiny" />
        <Username userId={event.pubkey} className="font-semibold" />
        <div className="truncate">{event.content}</div>
      </Card>
      <div className="ml-5 w-px h-2 bg-border" />
    </div>
  )
}
