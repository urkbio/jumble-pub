import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { QrCode } from 'lucide-react'
import { nip19 } from 'nostr-tools'
import { useMemo } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function QrCodePopover({ pubkey }: { pubkey: string }) {
  const npub = useMemo(() => (pubkey ? nip19.npubEncode(pubkey) : ''), [pubkey])
  if (!npub) return null

  return (
    <Popover>
      <PopoverTrigger>
        <div className="bg-muted rounded-full h-5 w-5 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground">
          <QrCode size={14} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-fit h-fit">
        <QRCodeSVG value={`nostr:${npub}`} />
      </PopoverContent>
    </Popover>
  )
}
