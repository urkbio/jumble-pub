import { Image } from '@nextui-org/image'
import { useFetchWebMetadata } from '@renderer/hooks/useFetchWebMetadata'
import { cn } from '@renderer/lib/utils'
import { useMemo } from 'react'

export default function WebPreview({ url, className }: { url: string; className?: string }) {
  const { title, description, image } = useFetchWebMetadata(url)
  const hostname = useMemo(() => new URL(url).hostname, [url])

  if (!title && !description && !image) {
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
      {image && <Image src={image} className="rounded-l-lg object-cover w-2/5" removeWrapper />}
      <div className={`flex-1 w-0 p-2 border ${image ? 'rounded-r-lg' : 'rounded-lg'}`}>
        <div className="text-xs text-muted-foreground">{hostname}</div>
        <div className="font-semibold line-clamp-2">{title}</div>
        <div className="text-xs text-muted-foreground line-clamp-5">{description}</div>
      </div>
    </div>
  )
}
