import { Event, kinds } from 'nostr-tools'
import RepostNoteCard from './RepostNoteCard'
import NormalNoteCard from './NormalNoteCard'

export default function NoteCard({ event, className }: { event: Event; className?: string }) {
  if (event.kind === kinds.Repost) {
    return <RepostNoteCard event={event} className={className} />
  }
  return <NormalNoteCard event={event} className={className} />
}
