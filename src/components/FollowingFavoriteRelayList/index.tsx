import { toRelay } from '@/lib/link'
import { useSecondaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import client from '@/services/client.service'
import relayInfoService from '@/services/relay-info.service'
import { TNip66RelayInfo } from '@/types'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import RelaySimpleInfo, { RelaySimpleInfoSkeleton } from '../RelaySimpleInfo'

const SHOW_COUNT = 10

export default function FollowingFavoriteRelayList() {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()
  const { pubkey } = useNostr()
  const [loading, setLoading] = useState(true)
  const [relays, setRelays] = useState<(TNip66RelayInfo & { users: string[] })[]>([])
  const [showCount, setShowCount] = useState(SHOW_COUNT)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)

    const init = async () => {
      if (!pubkey) return

      const relayMap =
        (await client.fetchFollowingFavoriteRelays(pubkey)) ?? new Map<string, Set<string>>()
      const relayUrls = Array.from(relayMap.keys())
      const relayInfos = await relayInfoService.getRelayInfos(relayUrls ?? [])
      setRelays(
        (relayInfos.filter(Boolean) as TNip66RelayInfo[])
          .map((relayInfo) => {
            const users = Array.from(relayMap.get(relayInfo.url) ?? [])
            return {
              ...relayInfo,
              users
            }
          })
          .sort((a, b) => b.users.length - a.users.length)
      )
    }
    init().finally(() => {
      setLoading(false)
    })
  }, [pubkey])

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '10px',
      threshold: 1
    }

    const observerInstance = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && showCount < relays.length) {
        setShowCount((prev) => prev + SHOW_COUNT)
      }
    }, options)

    const currentBottomRef = bottomRef.current
    if (currentBottomRef) {
      observerInstance.observe(currentBottomRef)
    }

    return () => {
      if (observerInstance && currentBottomRef) {
        observerInstance.unobserve(currentBottomRef)
      }
    }
  }, [showCount, relays])

  return (
    <div>
      {relays.slice(0, showCount).map((relay) => (
        <RelaySimpleInfo
          key={relay.url}
          relayInfo={relay}
          className="clickable p-4 border-b"
          onClick={(e) => {
            e.stopPropagation()
            push(toRelay(relay.url))
          }}
        />
      ))}
      {showCount < relays.length && <div ref={bottomRef} />}
      {loading && <RelaySimpleInfoSkeleton />}
      {!loading && (
        <div className="text-center text-muted-foreground text-sm mt-2">
          {relays.length === 0 ? t('no relays found') : t('no more relays')}
        </div>
      )}
    </div>
  )
}
