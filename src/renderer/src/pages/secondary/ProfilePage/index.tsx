import Nip05 from '@renderer/components/Nip05'
import NoteList from '@renderer/components/NoteList'
import ProfileAbout from '@renderer/components/ProfileAbout'
import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar'
import { Separator } from '@renderer/components/ui/separator'
import { useFetchFollowings, useFetchProfile } from '@renderer/hooks'
import { useFetchRelayList } from '@renderer/hooks/useFetchRelayList'
import SecondaryPageLayout from '@renderer/layouts/SecondaryPageLayout'
import { toFollowingList } from '@renderer/lib/link'
import { formatNpub, generateImageByPubkey } from '@renderer/lib/pubkey'
import { SecondaryPageLink } from '@renderer/PageManager'
import { Copy } from 'lucide-react'
import { nip19 } from 'nostr-tools'
import { useEffect, useMemo, useState } from 'react'

export default function ProfilePage({ pubkey }: { pubkey?: string }) {
  const { banner, username, nip05, about, avatar } = useFetchProfile(pubkey)
  const relayList = useFetchRelayList(pubkey)
  const [copied, setCopied] = useState(false)
  const followings = useFetchFollowings(pubkey)
  const npub = useMemo(() => (pubkey ? nip19.npubEncode(pubkey) : undefined), [pubkey])
  const defaultImage = useMemo(() => (pubkey ? generateImageByPubkey(pubkey) : ''), [pubkey])

  if (!pubkey || !npub) return null

  const copyNpub = () => {
    navigator.clipboard.writeText(npub)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <SecondaryPageLayout titlebarContent={username}>
      <div className="relative bg-cover bg-center w-full aspect-[21/9] rounded-lg mb-12">
        <ProfileBanner
          banner={banner}
          defaultBanner={defaultImage}
          pubkey={pubkey}
          className="w-full h-full object-cover rounded-lg"
        />
        <Avatar className="w-24 h-24 absolute bottom-0 left-4 translate-y-1/2 border-4 border-background">
          <AvatarImage src={avatar} className="object-cover object-center" />
          <AvatarFallback>
            <img src={defaultImage} />
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="px-4">
        <div className="text-xl font-semibold">{username}</div>
        {nip05 && <Nip05 nip05={nip05} pubkey={pubkey} />}
        <div
          className="mt-1 flex gap-2 text-sm text-muted-foreground items-center bg-muted w-fit px-2 rounded-full hover:text-foreground cursor-pointer"
          onClick={() => copyNpub()}
        >
          {copied ? (
            <div>copied!</div>
          ) : (
            <>
              <div>{formatNpub(npub, 24)}</div>
              <Copy size={14} />
            </>
          )}
        </div>
        <div className="text-wrap break-words whitespace-pre-wrap mt-2">
          <ProfileAbout about={about} />
        </div>
        <SecondaryPageLink
          to={toFollowingList(pubkey)}
          className="mt-2 flex gap-1 hover:underline text-sm"
        >
          {followings.length}
          <div className="text-muted-foreground">Following</div>
        </SecondaryPageLink>
      </div>
      <Separator className="my-4" />
      <NoteList
        key={pubkey}
        filter={{ authors: [pubkey] }}
        relayUrls={relayList.write.slice(0, 5)}
      />
    </SecondaryPageLayout>
  )
}

function ProfileBanner({
  defaultBanner,
  pubkey,
  banner,
  className
}: {
  defaultBanner: string
  pubkey: string
  banner?: string
  className?: string
}) {
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
