import { useFetchWebMetadata } from '@/hooks/useFetchWebMetadata'
import { cn } from '@/lib/utils'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import { useMemo } from 'react'
import Image from '../Image'

export default function WebPreview({
  url,
  className,
  size = 'normal'
}: {
  url: string
  className?: string
  size?: 'normal' | 'small'
}) {
  const { isSmallScreen } = useScreenSize()
  const { title, description, image } = useFetchWebMetadata(url)
  const hostname = useMemo(() => {
    try {
      return new URL(url).hostname
    } catch {
      return ''
    }
  }, [url])

  if (!title) {
    return null
  }

  if (isSmallScreen && image) {
    return (
      <div className="rounded-lg border mt-2">
        <Image src={image} className="rounded-t-lg w-full h-44" />
        <div className="bg-muted p-2 w-full rounded-b-lg">
          <div className="text-xs text-muted-foreground">{hostname}</div>
          <div className="font-semibold line-clamp-1">{title}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('p-0 clickable flex w-full border rounded-lg', className)}
      onClick={(e) => {
        e.stopPropagation()
        window.open(url, '_blank')
      }}
    >
      {image && (
        <Image src={image} className={`rounded-l-lg ${size === 'normal' ? 'h-44' : 'h-24'}`} />
      )}
      <div className="flex-1 w-0 p-2">
        <div className="text-xs text-muted-foreground">{hostname}</div>
        <div className={`font-semibold ${size === 'normal' ? 'line-clamp-2' : 'line-clamp-1'}`}>
          {title}
        </div>
        <div
          className={`text-xs text-muted-foreground ${size === 'normal' ? 'line-clamp-5' : 'line-clamp-2'}`}
        >
          {description}
        </div>
      </div>
    </div>
  )
}
