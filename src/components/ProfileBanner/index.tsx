import { Image } from '@nextui-org/image'
import { generateImageByPubkey } from '@/lib/pubkey'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'

export default function ProfileBanner({
  pubkey,
  banner,
  className
}: {
  pubkey: string
  banner?: string
  className?: string
}) {
  const defaultBanner = useMemo(() => generateImageByPubkey(pubkey), [pubkey])
  const [bannerUrl, setBannerUrl] = useState(banner || defaultBanner)

  useEffect(() => {
    if (banner) {
      setBannerUrl(banner)
    } else {
      setBannerUrl(defaultBanner)
    }
  }, [defaultBanner, banner])

  return (
    <Image
      src={bannerUrl}
      alt={`${pubkey} banner`}
      className={cn('z-0', className)}
      onError={() => setBannerUrl(defaultBanner)}
      removeWrapper
    />
  )
}
