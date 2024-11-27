import client from '@renderer/services/client.service'
import { TRelayInfo } from '@renderer/types'
import { useEffect, useState } from 'react'

export function useFetchRelayInfos(urls: string[]) {
  const [relayInfos, setRelayInfos] = useState<(TRelayInfo | undefined)[]>([])

  useEffect(() => {
    const fetchRelayInfos = async () => {
      if (urls.length === 0) return
      try {
        const relayInfos = await client.fetchRelayInfos(urls)
        setRelayInfos(relayInfos)
      } catch (err) {
        console.error(err)
      }
    }

    fetchRelayInfos()
  }, [JSON.stringify(urls)])

  return relayInfos
}
