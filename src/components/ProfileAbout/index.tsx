import {
  EmbeddedHashtagParser,
  EmbeddedMentionParser,
  EmbeddedNormalUrlParser,
  EmbeddedWebsocketUrlParser,
  parseContent
} from '@/lib/content-parser'
import { useMemo } from 'react'
import {
  EmbeddedHashtag,
  EmbeddedMention,
  EmbeddedNormalUrl,
  EmbeddedWebsocketUrl
} from '../Embedded'

export default function ProfileAbout({ about, className }: { about?: string; className?: string }) {
  const aboutNodes = useMemo(() => {
    if (!about) return null

    const nodes = parseContent(about, [
      EmbeddedWebsocketUrlParser,
      EmbeddedNormalUrlParser,
      EmbeddedHashtagParser,
      EmbeddedMentionParser
    ])
    return nodes.map((node, index) => {
      if (node.type === 'text') {
        return node.data
      }
      if (node.type === 'url') {
        return <EmbeddedNormalUrl key={index} url={node.data} />
      }
      if (node.type === 'websocket-url') {
        return <EmbeddedWebsocketUrl key={index} url={node.data} />
      }
      if (node.type === 'hashtag') {
        return <EmbeddedHashtag key={index} hashtag={node.data} />
      }
      if (node.type === 'mention') {
        return <EmbeddedMention key={index} userId={node.data.split(':')[1]} />
      }
    })
  }, [about])

  return <div className={className}>{aboutNodes}</div>
}
