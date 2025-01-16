import NoteList from '@/components/NoteList'
import SaveRelayDropdownMenu from '@/components/SaveRelayDropdownMenu'
import { Button } from '@/components/ui/button'
import { SEARCHABLE_RELAY_URLS } from '@/constants'
import { useFetchRelayInfos, useSearchParams } from '@/hooks'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { isWebsocketUrl, simplifyUrl } from '@/lib/url'
import { useFeed } from '@/providers/FeedProvider'
import { ListPlus } from 'lucide-react'
import { Filter } from 'nostr-tools'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function NoteListPage({ index }: { index?: number }) {
  const { t } = useTranslation()
  const { relayUrls } = useFeed()
  const { searchableRelayUrls } = useFetchRelayInfos(relayUrls)
  const { searchParams } = useSearchParams()
  const relayUrlsString = JSON.stringify(relayUrls)
  const {
    title = '',
    filter,
    urls,
    type
  } = useMemo<{
    title?: string
    filter?: Filter
    urls: string[]
    type?: 'search' | 'hashtag' | 'relay'
  }>(() => {
    const hashtag = searchParams.get('t')
    if (hashtag) {
      return {
        title: `# ${hashtag}`,
        filter: { '#t': [hashtag] },
        urls: relayUrls,
        type: 'hashtag'
      }
    }
    const search = searchParams.get('s')
    if (search) {
      return {
        title: `${t('Search')}: ${search}`,
        filter: { search },
        urls: searchableRelayUrls.concat(SEARCHABLE_RELAY_URLS).slice(0, 4),
        type: 'search'
      }
    }
    const relayUrl = searchParams.get('relay')
    if (relayUrl && isWebsocketUrl(relayUrl)) {
      return { title: simplifyUrl(relayUrl), urls: [relayUrl], type: 'relay' }
    }
    return { urls: relayUrls }
  }, [searchParams, relayUrlsString])

  return (
    <SecondaryPageLayout
      index={index}
      title={title}
      controls={
        type === 'relay' && (
          <SaveRelayDropdownMenu urls={urls} asChild>
            <Button variant="ghost" size="titlebar-icon">
              <ListPlus />
            </Button>
          </SaveRelayDropdownMenu>
        )
      }
      displayScrollToTopButton
    >
      <NoteList key={title} filter={filter} relayUrls={urls} />
    </SecondaryPageLayout>
  )
}
