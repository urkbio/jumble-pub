import NoteList from '@/components/NoteList'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { useFeed } from '@/providers/FeedProvider'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import FeedButton from './FeedButton'
import SearchButton from './SearchButton'
import SaveRelayDropdownMenu from '@/components/SaveRelayDropdownMenu'
import { Button } from '@/components/ui/button'
import { ListPlus } from 'lucide-react'

export default function NoteListPage() {
  const { t } = useTranslation()
  const layoutRef = useRef<{ scrollToTop: () => void }>(null)
  const { feedType, relayUrls, isReady, filter } = useFeed()

  useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollToTop()
    }
  }, [JSON.stringify(relayUrls), feedType])

  return (
    <PrimaryPageLayout
      pageName="home"
      ref={layoutRef}
      titlebar={
        <NoteListPageTitlebar temporaryRelayUrls={feedType === 'temporary' ? relayUrls : []} />
      }
      displayScrollToTopButton
    >
      {isReady ? (
        <NoteList relayUrls={relayUrls} filter={filter} />
      ) : (
        <div className="text-center text-sm text-muted-foreground">{t('loading...')}</div>
      )}
    </PrimaryPageLayout>
  )
}

function NoteListPageTitlebar({ temporaryRelayUrls = [] }: { temporaryRelayUrls?: string[] }) {
  return (
    <div className="flex gap-1 items-center h-full justify-between">
      <FeedButton />
      <div>
        <SearchButton />
        {temporaryRelayUrls.length > 0 && (
          <SaveRelayDropdownMenu urls={temporaryRelayUrls} asChild>
            <Button variant="ghost" size="titlebar-icon">
              <ListPlus />
            </Button>
          </SaveRelayDropdownMenu>
        )}
      </div>
    </div>
  )
}
