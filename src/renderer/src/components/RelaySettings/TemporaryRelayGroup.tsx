import { Button } from '@renderer/components/ui/button'
import { useFetchRelayInfos } from '@renderer/hooks'
import { useRelaySettings } from '@renderer/providers/RelaySettingsProvider'
import client from '@renderer/services/client.service'
import { Save, SearchCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function TemporaryRelayGroup() {
  const { t } = useTranslation()
  const { temporaryRelayUrls, relayGroups, addRelayGroup, switchRelayGroup } = useRelaySettings()
  const [relays, setRelays] = useState<
    {
      url: string
      isConnected: boolean
    }[]
  >(temporaryRelayUrls.map((url) => ({ url, isConnected: false })))
  const relayInfos = useFetchRelayInfos(relays.map((relay) => relay.url))

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
    const existingTemporaryIndexes = relayGroups
      .filter((group) => /^Temporary \d+$/.test(group.groupName))
      .map((group) => group.groupName.split(' ')[1])
      .map(Number)
      .filter((index) => !isNaN(index))
    const nextIndex = Math.max(...existingTemporaryIndexes, 0) + 1
    const groupName = `Temporary ${nextIndex}`
    addRelayGroup(groupName, temporaryRelayUrls)
    switchRelayGroup(groupName)
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
