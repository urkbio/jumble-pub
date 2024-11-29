import { Image } from '@nextui-org/image'
import { useFetchWebMetadata } from '@renderer/hooks/useFetchWebMetadata'
import { cn } from '@renderer/lib/utils'
import { useMemo } from 'react'

export default function WebPreview({
  url,
  className,
  size = 'normal'
}: {
  url: string
  className?: string
  size?: 'normal' | 'small'
}) {
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

  return (
    <div
      className={cn('p-0 hover:bg-muted/50 cursor-pointer flex w-full', className)}
      onClick={(e) => {
        e.stopPropagation()
        window.open(url, '_blank')
      }}
    >
      {image && (
        <Image
          src={image}
          className={`rounded-l-lg object-cover ${size === 'normal' ? 'h-44' : 'h-24'}`}
          removeWrapper
        />
      )}
      <div className={`flex-1 w-0 p-2 border ${image ? 'rounded-r-lg' : 'rounded-lg'}`}>
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
