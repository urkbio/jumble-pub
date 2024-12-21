import { useRelaySettings } from '@/providers/RelaySettingsProvider'
import client from '@/services/client.service'
import { TProfile } from '@/types'
import { useEffect, useState } from 'react'

export function useSearchProfiles(search: string, limit: number) {
  const { searchableRelayUrls } = useRelaySettings()
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [profiles, setProfiles] = useState<TProfile[]>([])

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!search) return

      setIsFetching(true)
      setProfiles([])
      if (searchableRelayUrls.length === 0) {
        setIsFetching(false)
        return
      }
      try {
        const profiles = await client.fetchProfiles(searchableRelayUrls, {
          search,
          limit
        })
        if (profiles) {
          setProfiles(profiles)
        }
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfiles()
  }, [searchableRelayUrls, search, limit])

  return { isFetching, error, profiles }
}
