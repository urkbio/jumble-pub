import { TDraftEvent } from '@common/types'
import { Button } from '@renderer/components/ui/button'
import { useFetchFollowings } from '@renderer/hooks'
import { useNostr } from '@renderer/providers/NostrProvider'
import dayjs from 'dayjs'
import { Loader } from 'lucide-react'
import { kinds } from 'nostr-tools'
import { useMemo, useState } from 'react'

export default function FollowButton({ pubkey }: { pubkey: string }) {
  const { pubkey: accountPubkey, publish } = useNostr()
  const { followings, followListEvent, refresh } = useFetchFollowings(accountPubkey)
  const [updating, setUpdating] = useState(false)
  const isFollowing = useMemo(() => followings.includes(pubkey), [followings, pubkey])

  if (!accountPubkey || pubkey === accountPubkey) return null

  const follow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFollowing) return

    setUpdating(true)
    const newFollowListEvent: TDraftEvent = {
      kind: kinds.Contacts,
      content: followListEvent?.content ?? '',
      created_at: dayjs().unix(),
      tags: (followListEvent?.tags ?? []).concat([['p', pubkey]])
    }
    console.log(newFollowListEvent)
    try {
      await publish(newFollowListEvent)
      await refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  const unfollow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isFollowing || !followListEvent) return

    setUpdating(true)
    const newFollowListEvent: TDraftEvent = {
      kind: kinds.Contacts,
      content: followListEvent.content ?? '',
      created_at: dayjs().unix(),
      tags: followListEvent.tags.filter(
        ([tagName, tagValue]) => tagName !== 'p' || tagValue !== pubkey
      )
    }
    try {
      await publish(newFollowListEvent)
      await refresh()
    } catch (error) {
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  return isFollowing ? (
    <Button
      className="w-20 min-w-20 rounded-full"
      variant="secondary"
      onClick={unfollow}
      disabled={updating}
    >
      {updating ? <Loader className="animate-spin" /> : 'Unfollow'}
    </Button>
  ) : (
    <Button className="w-20 min-w-20 rounded-full" onClick={follow} disabled={updating}>
      {updating ? <Loader className="animate-spin" /> : 'Follow'}
    </Button>
  )
}
