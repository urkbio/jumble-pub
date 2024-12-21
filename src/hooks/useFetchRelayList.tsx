import { TRelayList } from '@/types'
import { useEffect, useState } from 'react'
import client from '@/services/client.service'

export function useFetchRelayList(pubkey?: string | null) {
  const [relayList, setRelayList] = useState<TRelayList>({ write: [], read: [] })

  useEffect(() => {
    const fetchRelayList = async () => {
      if (!pubkey) return
      try {
        const relayList = await client.fetchRelayList(pubkey)
        setRelayList(relayList)
      } catch (err) {
        console.error(err)
      }
    }

    fetchRelayList()
  }, [pubkey])

  return relayList
}
