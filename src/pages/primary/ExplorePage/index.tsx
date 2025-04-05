import FollowingFavoriteRelayList from '@/components/FollowingFavoriteRelayList'
import RelayList from '@/components/RelayList'
import PrimaryPageLayout from '@/layouts/PrimaryPageLayout'
import { cn } from '@/lib/utils'
import { useDeepBrowsing } from '@/providers/DeepBrowsingProvider'
import { Compass } from 'lucide-react'
import { forwardRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

type TExploreTabs = 'following' | 'all'

const ExplorePage = forwardRef((_, ref) => {
  const [tab, setTab] = useState<TExploreTabs>('following')

  return (
    <PrimaryPageLayout
      ref={ref}
      pageName="explore"
      titlebar={<ExplorePageTitlebar />}
      displayScrollToTopButton
    >
      <Tabs value={tab} setValue={setTab} />
      {tab === 'following' ? <FollowingFavoriteRelayList /> : <RelayList />}
    </PrimaryPageLayout>
  )
})
ExplorePage.displayName = 'ExplorePage'
export default ExplorePage

function ExplorePageTitlebar() {
  const { t } = useTranslation()

  return (
    <div className="flex gap-2 items-center h-full pl-3">
      <Compass />
      <div className="text-lg font-semibold">{t('Explore')}</div>
    </div>
  )
}

function Tabs({
  value,
  setValue
}: {
  value: TExploreTabs
  setValue: (value: TExploreTabs) => void
}) {
  const { t } = useTranslation()
  const { deepBrowsing, lastScrollTop } = useDeepBrowsing()

  return (
    <div
      className={cn(
        'sticky top-12 bg-background z-30 duration-700 transition-transform select-none',
        deepBrowsing && lastScrollTop > 800 ? '-translate-y-[calc(100%+12rem)]' : ''
      )}
    >
      <div className="flex">
        <div
          className={`w-1/2 text-center py-2 font-semibold clickable cursor-pointer rounded-lg ${value === 'following' ? '' : 'text-muted-foreground'}`}
          onClick={() => setValue('following')}
        >
          {t("Following's Favorites")}
        </div>
        <div
          className={`w-1/2 text-center py-2 font-semibold clickable cursor-pointer rounded-lg ${value === 'all' ? '' : 'text-muted-foreground'}`}
          onClick={() => setValue('all')}
        >
          {t('All')}
        </div>
      </div>
      <div
        className={`w-1/2 px-4 sm:px-6 transition-transform duration-500 ${value === 'all' ? 'translate-x-full' : ''}`}
      >
        <div className="w-full h-1 bg-primary rounded-full" />
      </div>
    </div>
  )
}
