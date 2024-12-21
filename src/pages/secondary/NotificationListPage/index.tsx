import NotificationList from '@/components/NotificationList'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useTranslation } from 'react-i18next'

export default function NotificationListPage() {
  const { t } = useTranslation()

  return (
    <SecondaryPageLayout titlebarContent={t('notifications')}>
      <div className="max-sm:px-4">
        <NotificationList />
      </div>
    </SecondaryPageLayout>
  )
}
