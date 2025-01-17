import { Badge } from '@/components/ui/badge'
import { useFetchRelayInfos } from '@/hooks'
import { TRelayInfo } from '@/types'
import { GitBranch, Mail, SquareCode } from 'lucide-react'
import RelayIcon from '../RelayIcon'
import UserAvatar from '../UserAvatar'
import Username from '../Username'

export default function RelayInfo({ url }: { url: string }) {
  const {
    relayInfos: [relayInfo],
    isFetching
  } = useFetchRelayInfos([url])
  if (isFetching || !relayInfo) {
    return null
  }

  return (
    <div className="px-4 space-y-4 mb-2">
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <RelayIcon url={url} />
          {relayInfo.name && <div className="text-xl font-semibold">{relayInfo.name}</div>}
        </div>
        <RelayBadges relayInfo={relayInfo} />
        {!!relayInfo.tags?.length &&
          relayInfo.tags.map((tag) => <Badge variant="secondary">{tag}</Badge>)}
        {relayInfo.description && (
          <div className="text-wrap break-words whitespace-pre-wrap mt-2">
            {relayInfo.description}
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {relayInfo.pubkey && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">Operator</div>
            <div className="flex gap-2 items-center">
              <UserAvatar userId={relayInfo.pubkey} size="small" />
              <Username userId={relayInfo.pubkey} className="font-semibold whitespace-nowrap" />
            </div>
          </div>
        )}
        {relayInfo.contact && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">Contact</div>
            <div className="flex gap-2 items-center font-semibold whitespace-nowrap">
              <Mail />
              {relayInfo.contact}
            </div>
          </div>
        )}
        {relayInfo.software && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">Software</div>
            <div className="flex gap-2 items-center font-semibold whitespace-nowrap">
              <SquareCode />
              {formatSoftware(relayInfo.software)}
            </div>
          </div>
        )}
        {relayInfo.version && (
          <div className="space-y-2 flex-1">
            <div className="text-sm font-semibold text-muted-foreground">Version</div>
            <div className="flex gap-2 items-center font-semibold whitespace-nowrap">
              <GitBranch />
              {relayInfo.version}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatSoftware(software: string) {
  const parts = software.split('/')
  return parts[parts.length - 1]
}

function RelayBadges({ relayInfo }: { relayInfo: TRelayInfo }) {
  return (
    <div className="flex gap-2">
      {relayInfo.supported_nips?.includes(42) && (
        <Badge className="bg-green-400 hover:bg-green-400/80">Auth</Badge>
      )}
      {relayInfo.supported_nips?.includes(50) && (
        <Badge className="bg-pink-400 hover:bg-pink-400/80">Search</Badge>
      )}
      {relayInfo.limitation?.payment_required && (
        <Badge className="bg-orange-400 hover:bg-orange-400/80">Payment</Badge>
      )}
    </div>
  )
}
