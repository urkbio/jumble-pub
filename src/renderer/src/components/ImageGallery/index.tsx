import { Image } from '@nextui-org/image'
import { ScrollArea, ScrollBar } from '@renderer/components/ui/scroll-area'
import { cn } from '@renderer/lib/utils'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import NsfwOverlay from '../NsfwOverlay'

export default function ImageGallery({
  className,
  images,
  isNsfw = false,
  size = 'normal'
}: {
  className?: string
  images: string[]
  isNsfw?: boolean
  size?: 'normal' | 'small'
}) {
  const [index, setIndex] = useState(-1)

  const handlePhotoClick = (event: React.MouseEvent, current: number) => {
    event.preventDefault()
    setIndex(current)
  }

  return (
    <div className={cn('relative', className)} onClick={(e) => e.stopPropagation()}>
      <ScrollArea className="w-full">
        <div className="flex space-x-2">
          {images.map((src, index) => (
            <Image
              key={index}
              className={cn(
                'rounded-lg cursor-pointer z-0 object-cover',
                size === 'small' ? 'h-[15vh]' : 'h-[30vh]'
              )}
              src={src}
              onClick={(e) => handlePhotoClick(e, index)}
              removeWrapper
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Lightbox
        index={index}
        slides={images.map((src) => ({ src }))}
        plugins={[Zoom]}
        open={index >= 0}
        close={() => setIndex(-1)}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullUp: true,
          closeOnPullDown: true
        }}
        styles={{ toolbar: { paddingTop: '2.25rem' } }}
      />
      {isNsfw && <NsfwOverlay className="rounded-lg" />}
    </div>
  )
}
