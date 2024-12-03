import { Button } from '@renderer/components/ui/button'
import { cn } from '@renderer/lib/utils'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTopButton({
  scrollAreaRef,
  className,
  visible = true
}: {
  scrollAreaRef: React.RefObject<HTMLDivElement>
  className?: string
  visible?: boolean
}) {
  const handleScrollToTop = () => {
    scrollAreaRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Button
      variant="secondary-2"
      className={cn(
        `absolute bottom-2 right-2 rounded-full w-11 h-11 p-0 hover:text-background transition-transform ${visible ? '' : 'translate-y-14'}`,
        className
      )}
      onClick={handleScrollToTop}
    >
      <ChevronUp />
    </Button>
  )
}
