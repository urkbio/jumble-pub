import { generateImageByPubkey } from '@renderer/lib/pubkey'
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
    <img
      src={bannerUrl}
      alt={`${pubkey} banner`}
      className={className}
      onError={() => setBannerUrl(defaultBanner)}
    />
  )
}
