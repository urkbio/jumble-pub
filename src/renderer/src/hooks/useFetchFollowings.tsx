import { tagNameEquals } from '@renderer/lib/tag'
import client from '@renderer/services/client.service'
import { kinds } from 'nostr-tools'
import { useEffect, useState } from 'react'

export function useFetchFollowings(pubkey?: string) {
  const [followings, setFollowings] = useState<string[]>([])

  useEffect(() => {
    const init = async () => {
      if (!pubkey) return

      const followListEvent = await client.fetchEventByFilter({
        authors: [pubkey],
        kinds: [kinds.Contacts],
        limit: 1
      })
      if (!followListEvent) return

      setFollowings(
        followListEvent.tags
          .filter(tagNameEquals('p'))
          .map(([, pubkey]) => pubkey)
          .filter(Boolean)
          .reverse()
      )
    }

    init()
  }, [pubkey])

  return followings
}
