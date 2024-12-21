import { Button } from '@/components/ui/button'
import { toNotifications } from '@/lib/link'
import { useSecondaryPage } from '@/PageManager'
import { Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function NotificationButton({
  variant = 'titlebar'
}: {
  variant?: 'sidebar' | 'titlebar' | 'small-screen-titlebar'
}) {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()

  if (variant === 'sidebar') {
    return (
      <Button
        variant={variant}
        size={variant}
        title={t('notifications')}
        onClick={() => push(toNotifications())}
      >
        <Bell />
        {t('Notifications')}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={variant}
      title={t('notifications')}
      onClick={() => push(toNotifications())}
    >
      <Bell />
    </Button>
  )
}
