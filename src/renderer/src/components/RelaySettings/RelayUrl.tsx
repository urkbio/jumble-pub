import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { useFetchRelayInfos } from '@renderer/hooks'
import { isWebsocketUrl, normalizeUrl } from '@renderer/lib/url'
import { useRelaySettings } from '@renderer/providers/RelaySettingsProvider'
import client from '@renderer/services/client.service'
import { CircleX, SearchCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function RelayUrls({ groupName }: { groupName: string }) {
  const { t } = useTranslation()
  const { relayGroups, updateRelayGroupRelayUrls } = useRelaySettings()
  const rawRelayUrls = relayGroups.find((group) => group.groupName === groupName)?.relayUrls ?? []
  const isActive = relayGroups.find((group) => group.groupName === groupName)?.isActive ?? false

  const [newRelayUrl, setNewRelayUrl] = useState('')
  const [newRelayUrlError, setNewRelayUrlError] = useState<string | null>(null)
  const [relays, setRelays] = useState<
    {
      url: string
      isConnected: boolean
    }[]
  >(rawRelayUrls.map((url) => ({ url, isConnected: false })))

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

  const removeRelayUrl = (url: string) => {
    setRelays((relays) => relays.filter((relay) => relay.url !== url))
    updateRelayGroupRelayUrls(
      groupName,
      relays.map(({ url }) => url).filter((u) => u !== url)
    )
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
    updateRelayGroupRelayUrls(groupName, newRelayUrls)
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
  const [relayInfo] = useFetchRelayInfos([url])

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
