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
  const [thumbs, setThumbs] = useState<string[]>(images.map(getThumbUrl))

  const handlePhotoClick = (event: React.MouseEvent, current: number) => {
    event.preventDefault()
    setIndex(current)
  }

  return (
    <div className={cn('relative', className)} onClick={(e) => e.stopPropagation()}>
      <ScrollArea className="w-fit">
        <div className="flex w-fit space-x-2">
          {thumbs.map((src, index) => {
            return (
              <img
                className={`rounded-lg max-w-full cursor-pointer ${size === 'small' ? 'max-h-[15vh]' : 'max-h-[30vh]'}`}
                key={index}
                src={src}
                onClick={(e) => handlePhotoClick(e, index)}
              />
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <Lightbox
        index={index}
        slides={images.map((src) => ({ src }))}
        plugins={[Zoom]}
        open={index >= 0}
        close={() => setIndex(-1)}
        controller={{ closeOnBackdropClick: true, closeOnPullUp: true, closeOnPullDown: true }}
        styles={{ toolbar: { paddingTop: '2.25rem' } }}
        on={{
          view: ({ index }) => {
            setThumbs((pre) => pre.map((src, i) => (i === index ? images[i] : src)))
            setIndex(index)
          }
        }}
      />
      {isNsfw && <NsfwOverlay className="rounded-lg" />}
    </div>
  )
}

function getThumbUrl(url: string) {
  if (url.startsWith('https://image.nostr.build/')) {
    return url.replace('https://image.nostr.build/', 'https://image.nostr.build/thumb/')
  }
  if (url.startsWith('https://i.nostr.build/')) {
    return url.replace('https://i.nostr.build/', 'https://i.nostr.build/thumb/')
  }
  return url
}
