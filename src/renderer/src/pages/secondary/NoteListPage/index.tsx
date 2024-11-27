import NoteList from '@renderer/components/NoteList'
import { useSearchParams } from '@renderer/hooks'
import SecondaryPageLayout from '@renderer/layouts/SecondaryPageLayout'
import { useRelaySettings } from '@renderer/providers/RelaySettingsProvider'
import { Filter } from 'nostr-tools'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

export default function NoteListPage() {
  const { t } = useTranslation()
  const { relayUrls, searchableRelayUrls } = useRelaySettings()
  const { searchParams } = useSearchParams()
  const [title, filter] = useMemo<[string, Filter] | [undefined, undefined]>(() => {
    const hashtag = searchParams.get('t')
    if (hashtag) {
      return [`# ${hashtag}`, { '#t': [hashtag] }]
    }
    const search = searchParams.get('s')
    if (search) {
      return [`${t('search')}: ${search}`, { search }]
    }
    return [undefined, undefined]
  }, [searchParams])

  if (!filter || (filter.search && searchableRelayUrls.length === 0)) {
    return (
      <SecondaryPageLayout titlebarContent={title}>
        <div className="text-center text-sm text-muted-foreground">
          {t('The relays you are connected to do not support search')}
        </div>
      </SecondaryPageLayout>
    )
  }

  return (
    <SecondaryPageLayout titlebarContent={title}>
      <NoteList key={title} filter={filter} relayUrls={relayUrls} />
    </SecondaryPageLayout>
  )
}
