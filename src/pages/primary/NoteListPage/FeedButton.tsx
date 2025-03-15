import FeedSwitcher from '@/components/FeedSwitcher'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { simplifyUrl } from '@/lib/url'
import { cn } from '@/lib/utils'
import { useFeed } from '@/providers/FeedProvider'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { ChevronDown, Server, UsersRound } from 'lucide-react'
import { forwardRef, HTMLAttributes, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function FeedButton({ className }: { className?: string }) {
  const { isSmallScreen } = useScreenSize()
  const [open, setOpen] = useState(false)

  if (isSmallScreen) {
    return (
      <>
        <FeedSwitcherTrigger className={className} onClick={() => setOpen(true)} />
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="max-h-[80vh]">
            <div className="p-4 overflow-auto">
              <FeedSwitcher close={() => setOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FeedSwitcherTrigger className={className} />
      </PopoverTrigger>
      <PopoverContent side="bottom" className="w-96 p-4 max-h-[80vh] overflow-auto">
        <FeedSwitcher close={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}

const FeedSwitcherTrigger = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { t } = useTranslation()
    const { feedType, relayUrls, activeRelaySetId } = useFeed()
    const { relaySets } = useRelaySets()
    const activeRelaySet = activeRelaySetId
      ? relaySets.find((set) => set.id === activeRelaySetId)
      : undefined
    const title =
      feedType === 'following'
        ? t('Following')
        : relayUrls.length > 0
          ? relayUrls.length === 1
            ? simplifyUrl(relayUrls[0])
            : activeRelaySet
              ? activeRelaySet.name
              : t('Temporary')
          : t('Choose a relay set')

    return (
      <div
        className={cn('flex items-center gap-2 clickable px-3 h-full rounded-lg', className)}
        ref={ref}
        {...props}
      >
        {feedType === 'following' ? <UsersRound /> : <Server />}
        <div className="text-lg font-semibold truncate">{title}</div>
        <ChevronDown />
      </div>
    )
  }
)
