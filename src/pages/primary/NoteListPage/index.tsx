import NoteList from '@/components/NoteList'
import SaveRelayDropdownMenu from '@/components/SaveRelayDropdownMenu'
import { Button } from '@/components/ui/button'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { useFeed } from '@/providers/FeedProvider'
import { useNostr } from '@/providers/NostrProvider'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import FeedButton from './FeedButton'
import SearchButton from './SearchButton'

export default function NoteListPage() {
  const { t } = useTranslation()
  const layoutRef = useRef<{ scrollToTop: () => void }>(null)
  const { pubkey, checkLogin } = useNostr()
  const { feedType, relayUrls, isReady, filter } = useFeed()

  useEffect(() => {
    if (layoutRef.current) {
      layoutRef.current.scrollToTop()
    }
  }, [JSON.stringify(relayUrls), feedType])

  let content = <div className="text-center text-sm text-muted-foreground">{t('loading...')}</div>
  if (feedType === 'following' && !pubkey) {
    content = (
      <div className="flex justify-center w-full">
        <Button size="lg" onClick={() => checkLogin()}>
          {t('Please login to view following feed')}
        </Button>
      </div>
    )
  } else if (isReady) {
    content = <NoteList relayUrls={relayUrls} filter={filter} />
  }

  return (
    <PrimaryPageLayout
      pageName="home"
      ref={layoutRef}
      titlebar={
        <NoteListPageTitlebar temporaryRelayUrls={feedType === 'temporary' ? relayUrls : []} />
      }
      displayScrollToTopButton
    >
      {content}
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
          <SaveRelayDropdownMenu urls={temporaryRelayUrls} atTitlebar />
        )}
      </div>
    </div>
  )
}
