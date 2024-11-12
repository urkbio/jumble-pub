import { Button } from '@renderer/components/ui/button'
import { useFollowList } from '@renderer/providers/FollowListProvider'
import { useNostr } from '@renderer/providers/NostrProvider'
import { Loader } from 'lucide-react'
import { useMemo, useState } from 'react'

export default function FollowButton({ pubkey }: { pubkey: string }) {
  const { pubkey: accountPubkey } = useNostr()
  const { followListEvent, followings, isReady, follow, unfollow } = useFollowList()
  const [updating, setUpdating] = useState(false)
  const isFollowing = useMemo(() => followings.includes(pubkey), [followings, pubkey])

  if (!accountPubkey || pubkey === accountPubkey || !isReady) return null

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isFollowing) return

    setUpdating(true)
    try {
      await follow(pubkey)
    } catch (error) {
      console.error(error)
    } finally {
      setUpdating(false)
    }
  }

  const handleUnfollow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isFollowing || !followListEvent) return

    setUpdating(true)
    try {
      await unfollow(pubkey)
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
      onClick={handleUnfollow}
      disabled={updating}
    >
      {updating ? <Loader className="animate-spin" /> : 'Unfollow'}
    </Button>
  ) : (
    <Button className="w-20 min-w-20 rounded-full" onClick={handleFollow} disabled={updating}>
      {updating ? <Loader className="animate-spin" /> : 'Follow'}
    </Button>
  )
}
