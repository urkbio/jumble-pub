import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { HTMLAttributes, useState } from 'react'

export default function Image({
  src,
  alt,
  className = '',
  classNames = {},
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  src: string
  alt?: string
  classNames?: {
    wrapper?: string
  }
}) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn('relative', classNames.wrapper ?? '')} {...props}>
      {isLoading && <Skeleton className={cn('absolute inset-0', className)} />}
      <img
        src={src}
        alt={alt}
        className={cn(
          'object-cover transition-opacity duration-700',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  )
}
