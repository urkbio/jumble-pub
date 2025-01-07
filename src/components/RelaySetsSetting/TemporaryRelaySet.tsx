import { Button } from '@/components/ui/button'
import { useFetchRelayInfos } from '@/hooks'
import { simplifyUrl } from '@/lib/url'
import { useFeed } from '@/providers/FeedProvider'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import client from '@/services/client.service'
import { Save, SearchCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function TemporaryRelaySet() {
  const { t } = useTranslation()
  const { temporaryRelayUrls, switchFeed } = useFeed()
  const { addRelaySet } = useRelaySets()
  const [relays, setRelays] = useState<
    {
      url: string
      isConnected: boolean
    }[]
  >(temporaryRelayUrls.map((url) => ({ url, isConnected: false })))
  const { relayInfos } = useFetchRelayInfos(relays.map((relay) => relay.url))

  useEffect(() => {
    const interval = setInterval(() => {
      const connectionStatusMap = client.listConnectionStatus()
      setRelays((pre) => {
        return pre.map((relay) => {
          const isConnected = connectionStatusMap.get(relay.url) || false
          return { ...relay, isConnected }
        })
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setRelays(temporaryRelayUrls.map((url) => ({ url, isConnected: false })))
  }, [temporaryRelayUrls])

  if (!relays.length) {
    return null
  }

  const handleSave = () => {
    const relaySetName =
      temporaryRelayUrls.length === 1 ? simplifyUrl(temporaryRelayUrls[0]) : 'Temporary'
    const id = addRelaySet(relaySetName, temporaryRelayUrls)
    switchFeed('relays', { activeRelaySetId: id })
  }

  return (
    <div className={`w-full border border-dashed rounded-lg p-4 border-highlight bg-highlight/5`}>
      <div className="flex justify-between items-center">
        <div className="h-8 font-semibold">Temporary</div>
        <Button title="save" size="icon" variant="ghost" onClick={handleSave}>
          <Save />
        </Button>
      </div>
      {relays.map((relay, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex gap-2 items-center">
            {relay.isConnected ? (
              <div className="text-green-500 text-xs">●</div>
            ) : (
              <div className="text-red-500 text-xs">●</div>
            )}
            <div className="text-muted-foreground text-sm">{relay.url}</div>
            {relayInfos[index]?.supported_nips?.includes(50) && (
              <div title={t('supports search')} className="text-highlight">
                <SearchCheck size={14} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
