import { Avatar, AvatarFallback, AvatarImage } from '@renderer/components/ui/avatar'
import { Button } from '@renderer/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import { useFetchProfile } from '@renderer/hooks'
import { toProfile } from '@renderer/lib/link'
import { generateImageByPubkey } from '@renderer/lib/pubkey'
import { useSecondaryPage } from '@renderer/PageManager'
import { useNostr } from '@renderer/providers/NostrProvider'
import { useTranslation } from 'react-i18next'

export default function ProfileButton({
  pubkey,
  variant = 'titlebar'
}: {
  pubkey: string
  variant?: 'titlebar' | 'sidebar'
}) {
  const { t } = useTranslation()
  const { logout } = useNostr()
  const { profile } = useFetchProfile(pubkey)
  const { push } = useSecondaryPage()
  if (!profile) return null

  const { username, avatar } = profile
  const defaultAvatar = generateImageByPubkey(pubkey)

  let triggerComponent: React.ReactNode
  if (variant === 'titlebar') {
    triggerComponent = (
      <button>
        <Avatar className="w-6 h-6 hover:opacity-90">
          <AvatarImage src={avatar} />
          <AvatarFallback>
            <img src={defaultAvatar} />
          </AvatarFallback>
        </Avatar>
      </button>
    )
  } else {
    triggerComponent = (
      <Button variant="sidebar" size="sidebar" className="border hover:bg-muted px-2">
        <div className="flex gap-2 items-center flex-1 w-0">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar} />
            <AvatarFallback>
              <img src={defaultAvatar} />
            </AvatarFallback>
          </Avatar>
          <div className="truncate font-semibold text-lg">{username}</div>
        </div>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="non-draggable" asChild>
        {triggerComponent}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => push(toProfile(pubkey))}>{t('Profile')}</DropdownMenuItem>
        <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={logout}>
          {t('Logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
