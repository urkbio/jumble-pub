import Logo from '@/assets/Logo'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import AboutInfoDialog from '../AboutInfoDialog'
import AccountButton from '../AccountButton'
import NotificationButton from '../NotificationButton'
import PostButton from '../PostButton'
import RelaySettingsButton from '../RelaySettingsButton'
import SearchButton from '../SearchButton'

export default function PrimaryPageSidebar() {
  const { t } = useTranslation()
  return (
    <div className="w-52 h-full shrink-0 hidden xl:flex flex-col pb-8 pt-10 pl-4 justify-between relative">
      <div className="absolute top-0 left-0 h-11 w-full" />
      <div className="space-y-2">
        <div className="ml-4 mb-8 w-40">
          <Logo />
        </div>
        <PostButton variant="sidebar" />
        <RelaySettingsButton variant="sidebar" />
        <NotificationButton variant="sidebar" />
        <SearchButton variant="sidebar" />
        <AboutInfoDialog>
          <Button variant="sidebar" size="sidebar">
            <Info />
            {t('About')}
          </Button>
        </AboutInfoDialog>
      </div>
      <AccountButton variant="sidebar" />
    </div>
  )
}
