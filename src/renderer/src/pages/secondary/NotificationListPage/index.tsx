import NotificationList from '@renderer/components/NotificationList'
import SecondaryPageLayout from '@renderer/layouts/SecondaryPageLayout'
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
