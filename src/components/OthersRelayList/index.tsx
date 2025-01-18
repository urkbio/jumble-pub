import { useSecondaryPage } from '@/PageManager'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFetchRelayList } from '@/hooks'
import { toRelay } from '@/lib/link'
import { userIdToPubkey } from '@/lib/pubkey'
import { simplifyUrl } from '@/lib/url'
import { TMailboxRelay } from '@/types'
import { ListPlus, Telescope } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import RelayIcon from '../RelayIcon'
import SaveRelayDropdownMenu from '../SaveRelayDropdownMenu'

export default function OthersRelayList({ userId }: { userId: string }) {
  const { t } = useTranslation()
  const pubkey = useMemo(() => userIdToPubkey(userId), [userId])
  const { relayList, isFetching } = useFetchRelayList(pubkey)

  if (isFetching) {
    return <div className="text-center text-sm text-muted-foreground">{t('loading...')}</div>
  }

  return (
    <div className="space-y-2">
      {relayList.originalRelays.map((relay, index) => (
        <RelayItem key={`read-${relay.url}-${index}`} relay={relay} />
      ))}
    </div>
  )
}

function RelayItem({ relay }: { relay: TMailboxRelay }) {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { url, scope } = relay

  return (
    <div className="flex items-center gap-2 justify-between">
      <div
        className="flex items-center gap-2 cursor-pointer flex-1 w-0"
        onClick={() => push(toRelay(url))}
      >
        <RelayIcon url={url} />
        <div className="truncate">{simplifyUrl(url)}</div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {scope === 'read' ? (
          <Badge className="bg-blue-400 hover:bg-blue-400/80">{t('Read')}</Badge>
        ) : scope === 'write' ? (
          <Badge className="bg-green-400 hover:bg-green-400/80">{t('Write')}</Badge>
        ) : null}
        <Button variant="ghost" size="icon" onClick={() => push(toRelay(url))}>
          <Telescope />
        </Button>
        <SaveRelayDropdownMenu urls={[url]}>
          <Button variant="ghost" size="icon">
            <ListPlus />
          </Button>
        </SaveRelayDropdownMenu>
      </div>
    </div>
  )
}
