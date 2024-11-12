import { tagNameEquals } from '@renderer/lib/tag'
import client from '@renderer/services/client.service'
import { Event } from 'nostr-tools'
import { useEffect, useState } from 'react'

export function useFetchFollowings(pubkey?: string | null) {
  const [followListEvent, setFollowListEvent] = useState<Event | null>(null)
  const [followings, setFollowings] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      if (!pubkey) return

      const event = await client.fetchFollowListEvent(pubkey)
      if (!event) return

      setFollowListEvent(event)
      setFollowings(
        event.tags
          .filter(tagNameEquals('p'))
          .map(([, pubkey]) => pubkey)
          .filter(Boolean)
          .reverse()
      )
    }

    init()
  }, [pubkey])

  return { followings, followListEvent }
}
