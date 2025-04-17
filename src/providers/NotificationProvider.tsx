import { BIG_RELAY_URLS, ExtendedKind } from '@/constants'
import client from '@/services/client.service'
import { kinds } from 'nostr-tools'
import { SubCloser } from 'nostr-tools/abstract-pool'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useMuteList } from './MuteListProvider'
import { useNostr } from './NostrProvider'

type TNotificationContext = {
  hasNewNotification: boolean
  getNotificationsSeenAt: () => number
  clearNewNotifications: () => Promise<void>
}

const NotificationContext = createContext<TNotificationContext | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { pubkey, notificationsSeenAt, updateNotificationsSeenAt } = useNostr()
  const { mutePubkeys } = useMuteList()
  const [newNotificationIds, setNewNotificationIds] = useState(new Set<string>())
  const subCloserRef = useRef<SubCloser | null>(null)

  useEffect(() => {
    if (!pubkey || notificationsSeenAt < 0) return

    setNewNotificationIds(new Set())

    // Track if component is mounted
    const isMountedRef = { current: true }

    const subscribe = async () => {
      if (!isMountedRef.current) return null

      try {
        const relayList = await client.fetchRelayList(pubkey)
        const relayUrls = relayList.read.concat(BIG_RELAY_URLS).slice(0, 4)
        const subCloser = client.subscribe(
          relayUrls,
          [
            {
              kinds: [
                kinds.ShortTextNote,
                ExtendedKind.COMMENT,
                kinds.Reaction,
                kinds.Repost,
                kinds.Zap
              ],
              '#p': [pubkey],
              since: notificationsSeenAt,
              limit: 20
            }
          ],
          {
            onevent: (evt) => {
              // Only show notification if not from self and not muted
              if (evt.pubkey !== pubkey && !mutePubkeys.includes(evt.pubkey)) {
                setNewNotificationIds((prev) => new Set([...prev, evt.id]))
              }
            },
            onclose: (reasons) => {
              if (reasons.every((reason) => reason === 'closed by caller')) {
                return
              }

              // Only reconnect if still mounted and not a manual close
              if (isMountedRef.current && subCloserRef.current) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    subscribe()
                  }
                }, 5_000)
              }
            }
          }
        )

        subCloserRef.current = subCloser
        return subCloser
      } catch (error) {
        console.error('Subscription error:', error)

        // Retry on error if still mounted
        if (isMountedRef.current) {
          setTimeout(() => {
            if (isMountedRef.current) {
              subscribe()
            }
          }, 5_000)
        }
        return null
      }
    }

    // Initial subscription
    subscribe()

    // Cleanup function
    return () => {
      isMountedRef.current = false
      if (subCloserRef.current) {
        subCloserRef.current.close()
        subCloserRef.current = null
      }
    }
  }, [notificationsSeenAt, pubkey])

  useEffect(() => {
    if (newNotificationIds.size >= 10 && subCloserRef.current) {
      subCloserRef.current.close()
      subCloserRef.current = null
    }
  }, [newNotificationIds])

  useEffect(() => {
    const newNotificationCount = newNotificationIds.size
    if (newNotificationCount > 0) {
      document.title = `(${newNotificationCount >= 10 ? '9+' : newNotificationCount}) Jumble`
    } else {
      document.title = 'Jumble'
    }
  }, [newNotificationIds])

  const getNotificationsSeenAt = () => {
    return notificationsSeenAt
  }

  const clearNewNotifications = async () => {
    if (!pubkey) return

    setNewNotificationIds(new Set())
    await updateNotificationsSeenAt()
  }

  return (
    <NotificationContext.Provider
      value={{
        hasNewNotification: newNotificationIds.size > 0,
        clearNewNotifications,
        getNotificationsSeenAt
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
