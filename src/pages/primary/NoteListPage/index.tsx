import NoteList from '@/components/NoteList'
import RelaySettings from '@/components/RelaySettings'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { useRelaySettings } from '@/providers/RelaySettingsProvider'
import { useEffect, useRef } from 'react'

export default function NoteListPage() {
  const layoutRef = useRef<{ scrollToTop: () => void }>(null)
  const { relayUrls } = useRelaySettings()
  const relayUrlsString = JSON.stringify(relayUrls)
  useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollToTop()
    }
  }, [relayUrlsString])

  if (!relayUrls.length) {
    return (
      <PrimaryPageLayout>
        <div className="w-full text-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button title="relay settings" size="lg">
                Choose a relay group
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 h-[450px] p-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <RelaySettings />
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </PrimaryPageLayout>
    )
  }

  return (
    <PrimaryPageLayout ref={layoutRef}>
      <NoteList relayUrls={relayUrls} />
    </PrimaryPageLayout>
  )
}
