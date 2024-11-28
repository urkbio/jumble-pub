import { Image } from '@nextui-org/image'
import { useFetchWebMetadata } from '@renderer/hooks/useFetchWebMetadata'
import { cn } from '@renderer/lib/utils'

export default function WebPreview({ url, className }: { url: string; className?: string }) {
  const { title, description, image } = useFetchWebMetadata(url)

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
        <div className="font-semibold truncate">{title}</div>
        <div className="text-sm text-muted-foreground line-clamp-2">{description}</div>
      </div>
    </div>
  )
}
