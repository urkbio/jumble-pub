import { isNsfwEvent } from '@/lib/event'
import { extractImageInfoFromTag } from '@/lib/tag'
import { cn } from '@/lib/utils'
import { TImageInfo } from '@/types'
import { Event } from 'nostr-tools'
import { memo, ReactNode } from 'react'
import {
  embedded,
  embeddedHashtagRenderer,
  embeddedNormalUrlRenderer,
  embeddedNostrNpubRenderer,
  embeddedNostrProfileRenderer,
  embeddedWebsocketUrlRenderer
} from '../Embedded'
import { ImageCarousel } from '../ImageCarousel'

const PictureContent = memo(({ event, className }: { event: Event; className?: string }) => {
  const images: TImageInfo[] = []
  event.tags.forEach((tag) => {
    const imageInfo = extractImageInfoFromTag(tag)
    if (imageInfo) {
      images.push(imageInfo)
    }
  })
  const isNsfw = isNsfwEvent(event)

  const nodes: ReactNode[] = [
    <ImageCarousel key={`image-gallery-${event.id}`} images={images} isNsfw={isNsfw} />
  ]
  nodes.push(
    <div className="px-4">
      {embedded(event.content, [
        embeddedNormalUrlRenderer,
        embeddedWebsocketUrlRenderer,
        embeddedHashtagRenderer,
        embeddedNostrNpubRenderer,
        embeddedNostrProfileRenderer
      ])}
    </div>
  )

  return (
    <div className={cn('text-wrap break-words whitespace-pre-wrap space-y-2', className)}>
      {nodes}
    </div>
  )
})
PictureContent.displayName = 'PictureContent'
export default PictureContent
