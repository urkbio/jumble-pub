import NoteList from '@/components/NoteList'
import RelayInfo from '@/components/RelayInfo'
import SaveRelayDropdownMenu from '@/components/SaveRelayDropdownMenu'
import { Button } from '@/components/ui/button'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { normalizeUrl, simplifyUrl } from '@/lib/url'
import { ListPlus } from 'lucide-react'
import { useMemo } from 'react'
import NotFoundPage from '../NotFoundPage'

export default function RelayPage({ url, index }: { url?: string; index?: number }) {
  const normalizedUrl = useMemo(() => (url ? normalizeUrl(url) : undefined), [url])
  const title = useMemo(() => (url ? simplifyUrl(url) : undefined), [url])

  if (!normalizedUrl) {
    return <NotFoundPage />
  }

  return (
    <SecondaryPageLayout
      index={index}
      title={title}
      controls={
        <SaveRelayDropdownMenu urls={[normalizedUrl]} asChild>
          <Button variant="ghost" size="titlebar-icon">
            <ListPlus />
          </Button>
        </SaveRelayDropdownMenu>
      }
      displayScrollToTopButton
    >
      <RelayInfo url={normalizedUrl} />
      <NoteList relayUrls={[normalizedUrl]} />
    </SecondaryPageLayout>
  )
}
