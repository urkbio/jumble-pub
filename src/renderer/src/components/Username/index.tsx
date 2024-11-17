import { HoverCard, HoverCardContent, HoverCardTrigger } from '@renderer/components/ui/hover-card'
import { Skeleton } from '@renderer/components/ui/skeleton'
import { useFetchProfile } from '@renderer/hooks'
import { toProfile } from '@renderer/lib/link'
import { cn } from '@renderer/lib/utils'
import { SecondaryPageLink } from '@renderer/PageManager'
import ProfileCard from '../ProfileCard'

export default function Username({
  userId,
  showAt = false,
  className,
  skeletonClassName
}: {
  userId: string
  showAt?: boolean
  className?: string
  skeletonClassName?: string
}) {
  const { profile } = useFetchProfile(userId)
  if (!profile) return <Skeleton className={cn('w-16 my-1', skeletonClassName)} />

  const { username, pubkey } = profile

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className={cn('max-w-fit', className)}>
          <SecondaryPageLink
            to={toProfile(pubkey)}
            className="truncate hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {showAt && '@'}
            {username}
          </SecondaryPageLink>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <ProfileCard pubkey={pubkey} />
      </HoverCardContent>
    </HoverCard>
  )
}
