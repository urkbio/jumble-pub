import Note from '@renderer/components/Note'
import ParentNote from '@renderer/components/ParentNote'
import ReplyNoteList from '@renderer/components/ReplyNoteList'
import { Separator } from '@renderer/components/ui/separator'
import { useFetchEventById } from '@renderer/hooks'
import SecondaryPageLayout from '@renderer/layouts/SecondaryPageLayout'
import { getParentEventId, getRootEventId } from '@renderer/lib/event'
import { Event } from 'nostr-tools'

export default function NotePage({ event }: { event?: Event }) {
  const parentEvent = useFetchEventById(getParentEventId(event))
  const rootEvent = useFetchEventById(getRootEventId(event))

  if (!event) return null

  return (
    <SecondaryPageLayout titlebarContent="note">
      {rootEvent && <ParentNote key={`root-note-${event.id}`} event={rootEvent} />}
      {parentEvent && <ParentNote key={`parent-note-${event.id}`} event={parentEvent} />}
      <Note key={`note-${event.id}`} event={event} fetchNoteStats />
      <Separator className="my-2" />
      <ReplyNoteList key={`reply-note-list-${event.id}`} event={event} />
    </SecondaryPageLayout>
  )
}
