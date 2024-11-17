import { Image } from '@nextui-org/image'
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

  const maxHight = size === 'small' ? 'h-[15vh]' : images.length < 3 ? 'h-[30vh]' : 'h-[20vh]'

  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-wrap gap-2">
        {images.map((src, index) => (
          <ImageWithNsfwOverlay
            key={index}
            src={src}
            isNsfw={isNsfw}
            className={maxHight}
            onClick={(e) => handlePhotoClick(e, index)}
          />
        ))}
      </div>
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
    </div>
  )
}

function ImageWithNsfwOverlay({
  src,
  isNsfw = false,
  className,
  onClick
}: {
  src: string
  isNsfw: boolean
  className?: string
  onClick?: (e: React.MouseEvent) => void
}) {
  return (
    <div className="relative" onClick={onClick}>
      <Image
        className={cn('rounded-lg object-cover aspect-square', className)}
        src={src}
        removeWrapper
      />
      {isNsfw && <NsfwOverlay className="rounded-lg" />}
    </div>
  )
}
