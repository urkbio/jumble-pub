import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TImageInfo } from '@/types'
import { decode } from 'blurhash'
import { HTMLAttributes, useEffect, useMemo, useState } from 'react'

export default function Image({
  image: { url, blurHash, dim },
  alt,
  className = '',
  classNames = {},
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  image: TImageInfo
  alt?: string
  classNames?: {
    wrapper?: string
  }
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [displayBlurHash, setDisplayBlurHash] = useState(true)
  const [blurDataUrl, setBlurDataUrl] = useState<string | null>(null)
  const { width, height } = useMemo<{ width?: number; height?: number }>(() => {
    if (dim) {
      return dim
    }
    if (blurHash) {
      const { numX, numY } = decodeBlurHashSize(blurHash)
      return { width: numX * 10, height: numY * 10 }
    }
    return {}
  }, [dim])

  useEffect(() => {
    if (blurHash) {
      const pixels = decode(blurHash, 32, 32)
      const canvas = document.createElement('canvas')
      canvas.width = 32
      canvas.height = 32
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const imageData = ctx.createImageData(32, 32)
        imageData.data.set(pixels)
        ctx.putImageData(imageData, 0, 0)
        setBlurDataUrl(canvas.toDataURL())
      }
    }
  }, [blurHash])

  return (
    <div className={cn('relative', classNames.wrapper ?? '')} {...props}>
      {isLoading && <Skeleton className={cn('absolute inset-0', className)} />}
      <img
        src={url}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-700',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => {
          setIsLoading(false)
          setTimeout(() => setDisplayBlurHash(false), 1000)
        }}
      />
      {displayBlurHash && blurDataUrl && (
        <img
          src={blurDataUrl}
          className={cn('absolute inset-0 object-cover -z-10', className)}
          alt={alt}
          width={width}
          height={height}
        />
      )}
    </div>
  )
}

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~'
function decodeBlurHashSize(blurHash: string) {
  const sizeFlag = blurHash.charAt(0)

  const sizeValue = DIGITS.indexOf(sizeFlag)

  const numY = Math.floor(sizeValue / 9) + 1
  const numX = (sizeValue % 9) + 1

  return {
    numX,
    numY
  }
}
