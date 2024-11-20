import { useMemo } from 'react'
import {
  embedded,
  embeddedHashtagRenderer,
  embeddedNormalUrlRenderer,
  embeddedNostrNpubRenderer,
  embeddedNpubRenderer,
  embeddedWebsocketUrlRenderer
} from '../Embedded'

export default function ProfileAbout({ about, className }: { about?: string; className?: string }) {
  const nodes = useMemo(() => {
    return about
      ? embedded(about, [
          embeddedWebsocketUrlRenderer,
          embeddedNormalUrlRenderer,
          embeddedHashtagRenderer,
          embeddedNostrNpubRenderer,
          embeddedNpubRenderer
        ])
      : null
  }, [about])

  return <div className={className}>{nodes}</div>
}
