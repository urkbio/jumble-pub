import NoteList from '@renderer/components/NoteList'
import RelaySettings from '@renderer/components/RelaySettings'
import { Button } from '@renderer/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import PrimaryPageLayout from '@renderer/layouts/PrimaryPageLayout'
import { useRelaySettings } from '@renderer/providers/RelaySettingsProvider'
import { useEffect, useRef } from 'react'

export default function NoteListPage() {
  const layoutRef = useRef<{ scrollToTop: () => void }>(null)
  const { relayUrls } = useRelaySettings()

  useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollToTop()
    }
  }, [JSON.stringify(relayUrls)])

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
