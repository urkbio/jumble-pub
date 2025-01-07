import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFetchRelayInfos } from '@/hooks'
import { isWebsocketUrl, normalizeUrl } from '@/lib/url'
import { useFeed } from '@/providers/FeedProvider'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import client from '@/services/client.service'
import { CircleX, SearchCheck } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function RelayUrls({ relaySetId }: { relaySetId: string }) {
  const { t } = useTranslation()
  const { relaySets, updateRelaySet } = useRelaySets()
  const { activeRelaySetId } = useFeed()
  const [newRelayUrl, setNewRelayUrl] = useState('')
  const [newRelayUrlError, setNewRelayUrlError] = useState<string | null>(null)
  const relaySet = useMemo(
    () => relaySets.find((r) => r.id === relaySetId),
    [relaySets, relaySetId]
  )
  const [relays, setRelays] = useState<
    {
      url: string
      isConnected: boolean
    }[]
  >(relaySet?.relayUrls.map((url) => ({ url, isConnected: false })) ?? [])
  const isActive = relaySet?.id === activeRelaySetId

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

  if (!relaySet) return null

  const removeRelayUrl = (url: string) => {
    setRelays((relays) => relays.filter((relay) => relay.url !== url))
    updateRelaySet({
      ...relaySet,
      relayUrls: relays.map(({ url }) => url).filter((u) => u !== url)
    })
  }

  const saveNewRelayUrl = () => {
    if (newRelayUrl === '') return
    const normalizedUrl = normalizeUrl(newRelayUrl)
    if (relays.some(({ url }) => url === normalizedUrl)) {
      return setNewRelayUrlError(t('Relay already exists'))
    }
    if (!isWebsocketUrl(normalizedUrl)) {
      return setNewRelayUrlError(t('invalid relay URL'))
    }
    setRelays((pre) => [...pre, { url: normalizedUrl, isConnected: false }])
    const newRelayUrls = [...relays.map(({ url }) => url), normalizedUrl]
    updateRelaySet({ ...relaySet, relayUrls: newRelayUrls })
    setNewRelayUrl('')
  }

  const handleRelayUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRelayUrl(e.target.value)
    setNewRelayUrlError(null)
  }

  const handleRelayUrlInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveNewRelayUrl()
    }
  }

  return (
    <>
      <div className="mt-1">
        {relays.map(({ url, isConnected: isConnected }, index) => (
          <RelayUrl
            key={index}
            isActive={isActive}
            url={url}
            isConnected={isConnected}
            onRemove={() => removeRelayUrl(url)}
          />
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <Input
          className={newRelayUrlError ? 'border-destructive' : ''}
          placeholder={t('Add a new relay')}
          value={newRelayUrl}
          onKeyDown={handleRelayUrlInputKeyDown}
          onChange={handleRelayUrlInputChange}
          onBlur={saveNewRelayUrl}
        />
        <Button onClick={saveNewRelayUrl}>{t('Add')}</Button>
      </div>
      {newRelayUrlError && <div className="text-xs text-destructive mt-1">{newRelayUrlError}</div>}
    </>
  )
}

function RelayUrl({
  isActive,
  url,
  isConnected,
  onRemove
}: {
  isActive: boolean
  url: string
  isConnected: boolean
  onRemove: () => void
}) {
  const { t } = useTranslation()
  const {
    relayInfos: [relayInfo]
  } = useFetchRelayInfos([url])

  return (
    <div className="flex items-center justify-between">
      <div className="flex gap-2 items-center">
        {!isActive ? (
          <div className="text-muted-foreground text-xs">●</div>
        ) : isConnected ? (
          <div className="text-green-500 text-xs">●</div>
        ) : (
          <div className="text-red-500 text-xs">●</div>
        )}
        <div className="text-muted-foreground text-sm">{url}</div>
        {relayInfo?.supported_nips?.includes(50) && (
          <div title={t('supports search')} className="text-highlight">
            <SearchCheck size={14} />
          </div>
        )}
      </div>
      <div>
        <CircleX
          size={16}
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive cursor-pointer"
        />
      </div>
    </div>
  )
}
