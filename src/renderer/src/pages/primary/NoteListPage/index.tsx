import NoteList from '@renderer/components/NoteList'
import RelaySettings from '@renderer/components/RelaySettings'
import { Button } from '@renderer/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@renderer/components/ui/popover'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
import PrimaryPageLayout from '@renderer/layouts/PrimaryPageLayout'
import { useRelaySettings } from '@renderer/providers/RelaySettingsProvider'

export default function NoteListPage() {
  const { relayUrls } = useRelaySettings()

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
    <PrimaryPageLayout>
      <NoteList relayUrls={relayUrls} />
    </PrimaryPageLayout>
  )
}
