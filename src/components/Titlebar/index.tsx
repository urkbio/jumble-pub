import { cn } from '@/lib/utils'
import { useDeepBrowsing } from '@/providers/DeepBrowsingProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'

export function Titlebar({
  children,
  className
}: {
  children?: React.ReactNode
  className?: string
}) {
  const { isSmallScreen } = useScreenSize()
  const { deepBrowsing } = useDeepBrowsing()

  return (
    <div
      className={cn(
        'sticky top-0 w-full z-20 bg-background duration-700 transition-transform [&_svg]:size-4 [&_svg]:shrink-0',
        isSmallScreen && deepBrowsing ? '-translate-y-full' : '',
        className
      )}
    >
      {children}
    </div>
  )
}
