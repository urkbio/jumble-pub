import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer'
import { BIG_RELAY_URLS } from '@/constants'
import { tagNameEquals } from '@/lib/tag'
import { isWebsocketUrl, simplifyUrl } from '@/lib/url'
import { useNostr } from '@/providers/NostrProvider'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import { useScreenSize } from '@/providers/ScreenSizeProvider'
import client from '@/services/client.service'
import { TRelaySet } from '@/types'
import { CloudDownload } from 'lucide-react'
import { kinds } from 'nostr-tools'
import { useEffect, useState } from 'react'
import RelaySetCard from '../RelaySetCard'

export default function PullFromRelaysButton() {
  const { pubkey } = useNostr()
  const { isSmallScreen } = useScreenSize()
  const [open, setOpen] = useState(false)

  const trigger = (
    <Button variant="secondary" className="w-full" disabled={!pubkey}>
      <CloudDownload />
      Pull from relays
    </Button>
  )

  if (isSmallScreen) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh]">
          <div className="flex flex-col p-4 gap-4 overflow-auto">
            <DrawerHeader>
              <DrawerTitle>Select the relay sets you want to pull</DrawerTitle>
              <DrawerDescription className="hidden" />
            </DrawerHeader>
            <RemoteRelaySets close={() => setOpen(false)} />
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Select the relay sets you want to pull</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <RemoteRelaySets close={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function RemoteRelaySets({ close }: { close?: () => void }) {
  const { pubkey, relayList } = useNostr()
  const { mergeRelaySets } = useRelaySets()
  const [initialed, setInitialed] = useState(false)
  const [relaySets, setRelaySets] = useState<TRelaySet[]>([])
  const [selectedRelaySetIds, setSelectedRelaySetIds] = useState<string[]>([])

  useEffect(() => {
    if (!pubkey) return

    const init = async () => {
      setInitialed(false)
      const events = await client.fetchEvents(
        (relayList?.write ?? []).concat(BIG_RELAY_URLS).slice(0, 4),
        {
          kinds: [kinds.Relaysets],
          authors: [pubkey],
          limit: 50
        }
      )
      setRelaySets(
        events
          .map((evt) => {
            const id = evt.tags.find(tagNameEquals('d'))?.[1]
            if (!id) return null

            const relayUrls = evt.tags
              .filter(tagNameEquals('relay'))
              .map((tag) => tag[1])
              .filter((url) => url && isWebsocketUrl(url))
            if (!relayUrls.length) return null

            let title = evt.tags.find(tagNameEquals('title'))?.[1]
            if (!title) {
              title = relayUrls.length === 1 ? simplifyUrl(relayUrls[0]) : id
            }
            return { id, name: title, relayUrls }
          })
          .filter(Boolean) as TRelaySet[]
      )
      setInitialed(true)
    }
    init()
  }, [pubkey])

  if (!pubkey) return null
  if (!initialed) return <div className="text-center text-muted-foreground">Loading...</div>
  if (!relaySets.length) {
    return <div className="text-center text-muted-foreground">No relay sets found</div>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {relaySets.map((relaySet) => (
          <RelaySetCard
            key={relaySet.id}
            relaySet={relaySet}
            select={selectedRelaySetIds.includes(relaySet.id)}
            onSelectChange={(select) => {
              if (select) {
                setSelectedRelaySetIds([...selectedRelaySetIds, relaySet.id])
              } else {
                setSelectedRelaySetIds(selectedRelaySetIds.filter((id) => id !== relaySet.id))
              }
            }}
          />
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          className="w-20 shrink-0"
          variant="secondary"
          onClick={() => setSelectedRelaySetIds(relaySets.map((r) => r.id))}
        >
          All
        </Button>
        <Button
          className="w-full"
          disabled={!selectedRelaySetIds.length}
          onClick={() => {
            if (selectedRelaySetIds.length > 0) {
              mergeRelaySets(relaySets.filter((set) => selectedRelaySetIds.includes(set.id)))
              close?.()
            }
          }}
        >
          {selectedRelaySetIds.length > 0
            ? `Pull ${selectedRelaySetIds.length} relay sets`
            : 'Pull'}
        </Button>
      </div>
    </div>
  )
}
