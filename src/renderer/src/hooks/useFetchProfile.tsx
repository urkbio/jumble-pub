import { formatPubkey } from '@renderer/lib/pubkey'
import client from '@renderer/services/client.service'
import { TProfile } from '@renderer/types'
import { nip19 } from 'nostr-tools'
import { useEffect, useState } from 'react'

export function useFetchProfile(id?: string) {
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [profile, setProfile] = useState<TProfile | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      let pubkey: string | undefined
      try {
        if (!id) {
          setIsFetching(false)
          setError(new Error('No id provided'))
          return
        }

        if (/^[0-9a-f]{64}$/.test(id)) {
          pubkey = id
        } else {
          const { data, type } = nip19.decode(id)
          switch (type) {
            case 'npub':
              pubkey = data
              break
            case 'nprofile':
              pubkey = data.pubkey
              break
          }
        }

        if (!pubkey) {
          setIsFetching(false)
          setError(new Error('Invalid id'))
          return
        }

        const profile = await client.fetchProfile(pubkey)
        if (profile) {
          setProfile(profile)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        if (pubkey) {
          setProfile((pre) => {
            if (pre) return pre
            return { pubkey, username: formatPubkey(pubkey!) } as TProfile
          })
        }
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [id])

  return { isFetching, error, profile }
}
