import { checkAlgoRelay } from '@renderer/lib/relay'
import client from '@renderer/services/client.service'
import { TRelayInfo } from '@renderer/types'
import { useEffect, useState } from 'react'

export function useFetchRelayInfos(urls: string[]) {
  const [isFetching, setIsFetching] = useState(true)
  const [relayInfos, setRelayInfos] = useState<(TRelayInfo | undefined)[]>([])
  const [areAlgoRelays, setAreAlgoRelays] = useState(false)

  useEffect(() => {
    const fetchRelayInfos = async () => {
      setIsFetching(true)
      if (urls.length === 0) {
        return setIsFetching(false)
      }
      try {
        const relayInfos = await client.fetchRelayInfos(urls)
        setRelayInfos(relayInfos)
        setAreAlgoRelays(relayInfos.every((relayInfo) => checkAlgoRelay(relayInfo)))
      } catch (err) {
        console.error(err)
      } finally {
        setIsFetching(false)
      }
    }

    fetchRelayInfos()
  }, [JSON.stringify(urls)])

  return { relayInfos, isFetching, areAlgoRelays }
}
