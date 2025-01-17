import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { TMailboxRelay, TMailboxRelayScope } from '@/types'
import { CircleX } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import RelayIcon from '../RelayIcon'

export default function MailboxRelay({
  mailboxRelay,
  changeMailboxRelayScope,
  removeMailboxRelay
}: {
  mailboxRelay: TMailboxRelay
  changeMailboxRelayScope: (url: string, scope: TMailboxRelayScope) => void
  removeMailboxRelay: (url: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 flex-1 w-0">
        <RelayIcon url={mailboxRelay.url} />
        <div className="truncate">{mailboxRelay.url}</div>
      </div>
      <div className="flex items-center gap-4">
        <Select
          value={mailboxRelay.scope}
          onValueChange={(v: TMailboxRelayScope) => changeMailboxRelayScope(mailboxRelay.url, v)}
        >
          <SelectTrigger className="w-24 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">{t('R & W')}</SelectItem>
            <SelectItem value="read">{t('Read')}</SelectItem>
            <SelectItem value="write">{t('Write')}</SelectItem>
          </SelectContent>
        </Select>
        <CircleX
          size={16}
          onClick={() => removeMailboxRelay(mailboxRelay.url)}
          className="text-muted-foreground hover:text-destructive clickable"
        />
      </div>
    </div>
  )
}
