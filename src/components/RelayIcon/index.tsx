import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Server } from 'lucide-react'
import { useMemo } from 'react'

export default function RelayIcon({
  url,
  className = 'w-6 h-6',
  iconSize = 14
}: {
  url: string
  className?: string
  iconSize?: number
}) {
  const icon = useMemo(() => {
    const u = new URL(url)
    return `${u.protocol === 'wss:' ? 'https:' : 'http:'}//${u.host}/favicon.ico`
  }, [url])

  return (
    <Avatar className={className}>
      <AvatarImage src={icon} />
      <AvatarFallback>
        <Server size={iconSize} />
      </AvatarFallback>
    </Avatar>
  )
}
