import { cn } from '@/lib/utils'
import { Event } from 'nostr-tools'
import { useTranslation } from 'react-i18next'
import UserAvatar from '../UserAvatar'

export default function ParentNotePreview({
  event,
  className,
  onClick
}: {
  event: Event
  className?: string
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined
}) {
  const { t } = useTranslation()
  return (
    <div
      className={cn(
        'flex space-x-1 items-center text-sm rounded-full px-2 bg-muted w-fit max-w-full text-muted-foreground hover:text-foreground cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <div className="shrink-0">{t('reply to')}</div>
      <UserAvatar className="shrink-0" userId={event.pubkey} size="tiny" />
      <div className="truncate">{event.content}</div>
    </div>
  )
}
