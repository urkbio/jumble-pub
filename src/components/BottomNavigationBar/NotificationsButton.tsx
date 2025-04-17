import { usePrimaryPage } from '@/PageManager'
import { useNostr } from '@/providers/NostrProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { Bell } from 'lucide-react'
import BottomNavigationBarItem from './BottomNavigationBarItem'

export default function NotificationsButton() {
  const { checkLogin } = useNostr()
  const { navigate, current } = usePrimaryPage()
  const { hasNewNotification } = useNotification()

  return (
    <BottomNavigationBarItem
      active={current === 'notifications'}
      onClick={() => checkLogin(() => navigate('notifications'))}
    >
      <div className="relative">
        <Bell />
        {hasNewNotification && (
          <div className="absolute -top-0.5 right-0.5 w-2 h-2 ring-2 ring-background bg-primary rounded-full" />
        )}
      </div>
    </BottomNavigationBarItem>
  )
}
