import { cn } from '@/lib/utils'
import { useDeepBrowsing } from '@/providers/DeepBrowsingProvider'
import AccountButton from './AccountButton'
import HomeButton from './HomeButton'
import NotificationsButton from './NotificationsButton'
import PostButton from './PostButton'

export default function BottomNavigationBar() {
  const { deepBrowsing } = useDeepBrowsing()

  return (
    <div
      className={cn(
        'fixed bottom-0 w-full z-20 bg-background/80 backdrop-blur-xl duration-700 transition-transform flex items-center justify-around [&_svg]:size-4 [&_svg]:shrink-0',
        deepBrowsing ? 'translate-y-full' : ''
      )}
      style={{
        height: 'calc(3rem + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <HomeButton />
      <PostButton />
      <NotificationsButton />
      <AccountButton />
    </div>
  )
}
