import { BIG_RELAY_URLS, ExtendedKind } from '@/constants'
import client from '@/services/client.service'
import { kinds } from 'nostr-tools'
import { SubCloser } from 'nostr-tools/abstract-pool'
import { createContext, useContext, useEffect, useState } from 'react'
import { useMuteList } from './MuteListProvider'
import { useNostr } from './NostrProvider'

type TNotificationContext = {
  hasNewNotification: boolean
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
  const [hasNewNotification, setHasNewNotification] = useState(false)

  useEffect(() => {
    if (!pubkey || notificationsSeenAt < 0) return

    setHasNewNotification(false)

    // Track if component is mounted
    const isMountedRef = { current: true }
    let currentSubCloser: SubCloser | null = null

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
              limit: 10
            }
          ],
          {
            onevent: (evt) => {
              // Only show notification if not from self and not muted
              if (evt.pubkey !== pubkey && !mutePubkeys.includes(evt.pubkey)) {
                setHasNewNotification(true)
                subCloser.close()
              }
            },
            onclose: (reasons) => {
              if (reasons.every((reason) => reason === 'closed by caller')) {
                return
              }

              // Only reconnect if still mounted and not a manual close
              if (isMountedRef.current && currentSubCloser) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    subscribe()
                  }
                }, 5_000)
              }
            }
          }
        )

        currentSubCloser = subCloser
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
      if (currentSubCloser) {
        currentSubCloser.close()
        currentSubCloser = null
      }
    }
  }, [notificationsSeenAt, pubkey])

  useEffect(() => {
    if (hasNewNotification) {
      document.title = '📥 Jumble'
    } else {
      document.title = 'Jumble'
    }
  }, [hasNewNotification])

  const clearNewNotifications = async () => {
    if (!pubkey) return

    setHasNewNotification(false)
    await updateNotificationsSeenAt()
  }

  return (
    <NotificationContext.Provider value={{ hasNewNotification, clearNewNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}
