import client from '@/services/client.service'
import { Event } from 'nostr-tools'
import { useEffect, useState } from 'react'

export function useFetchEvent(id?: string) {
  const [isFetching, setIsFetching] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [event, setEvent] = useState<Event | undefined>(undefined)

  useEffect(() => {
    const fetchEvent = async () => {
      setIsFetching(true)
      if (!id) {
        setIsFetching(false)
        setError(new Error('No id provided'))
        return
      }

      try {
        const event = await client.fetchEvent(id)
        if (event) {
          setEvent(event)
        }
      } catch (error) {
        setError(error as Error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchEvent().catch((err) => {
      setError(err as Error)
      setIsFetching(false)
    })
  }, [id])

  return { isFetching, error, event }
}
