import { cn } from '@/lib/utils'

export function Titlebar({
  children,
  className,
  visible = true
}: {
  children?: React.ReactNode
  className?: string
  visible?: boolean
}) {
  return (
    <div
      className={cn(
        'absolute top-0 w-full h-9 max-sm:h-11 z-50 bg-background/80 backdrop-blur-md flex items-center font-semibold gap-1 px-2 duration-700 transition-transform',
        visible ? '' : '-translate-y-full',
        className
      )}
    >
      {children}
    </div>
  )
}
