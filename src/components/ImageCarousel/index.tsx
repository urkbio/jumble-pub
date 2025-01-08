import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel'
import { TImageInfo } from '@/types'
import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Image from '../Image'
import NsfwOverlay from '../NsfwOverlay'

export function ImageCarousel({
  images,
  isNsfw = false
}: {
  images: TImageInfo[]
  isNsfw?: boolean
}) {
  const [index, setIndex] = useState(-1)

  const handlePhotoClick = (event: React.MouseEvent, current: number) => {
    event.preventDefault()
    setIndex(current)
  }

  return (
    <>
      <Carousel className="w-full">
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <Image image={image} onClick={(e) => handlePhotoClick(e, index)} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Lightbox
        index={index}
        slides={images.map(({ url }) => ({ src: url }))}
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
    </>
  )
}
