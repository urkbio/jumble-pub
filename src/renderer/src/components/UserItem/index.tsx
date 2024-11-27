import FollowButton from '@renderer/components/FollowButton'
import Nip05 from '@renderer/components/Nip05'
import UserAvatar from '@renderer/components/UserAvatar'
import Username from '@renderer/components/Username'
import { useFetchProfile } from '@renderer/hooks'

export default function UserItem({ pubkey }: { pubkey: string }) {
  const { profile } = useFetchProfile(pubkey)
  const { nip05, about } = profile || {}

  return (
    <div className="flex gap-2 items-start">
      <UserAvatar userId={pubkey} className="shrink-0" />
      <div className="w-full overflow-hidden">
        <Username userId={pubkey} className="font-semibold truncate" skeletonClassName="h-4" />
        <Nip05 nip05={nip05} pubkey={pubkey} />
        <div className="truncate text-muted-foreground text-sm">{about}</div>
      </div>
      <FollowButton pubkey={pubkey} />
    </div>
  )
}
