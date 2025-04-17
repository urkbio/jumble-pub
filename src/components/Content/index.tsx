import {
  EmbeddedEventParser,
  EmbeddedHashtagParser,
  EmbeddedImageParser,
  EmbeddedMentionParser,
  EmbeddedNormalUrlParser,
  EmbeddedVideoParser,
  EmbeddedWebsocketUrlParser,
  parseContent
} from '@/lib/content-parser'
import { isNsfwEvent } from '@/lib/event'
import { extractImageInfoFromTag } from '@/lib/tag'
import { cn } from '@/lib/utils'
import { TImageInfo } from '@/types'
import { Event } from 'nostr-tools'
import { memo } from 'react'
import {
  EmbeddedHashtag,
  EmbeddedMention,
  EmbeddedNormalUrl,
  EmbeddedNote,
  EmbeddedWebsocketUrl
} from '../Embedded'
import ImageGallery from '../ImageGallery'
import VideoPlayer from '../VideoPlayer'
import WebPreview from '../WebPreview'

const Content = memo(
  ({
    event,
    className,
    size = 'normal'
  }: {
    event: Event
    className?: string
    size?: 'normal' | 'small'
  }) => {
    const nodes = parseContent(event.content, [
      EmbeddedImageParser,
      EmbeddedVideoParser,
      EmbeddedNormalUrlParser,
      EmbeddedWebsocketUrlParser,
      EmbeddedEventParser,
      EmbeddedMentionParser,
      EmbeddedHashtagParser
    ])

    const imageInfos = event.tags
      .map((tag) => extractImageInfoFromTag(tag))
      .filter(Boolean) as TImageInfo[]

    const lastNormalUrlNode = nodes.findLast((node) => node.type === 'url')
    const lastNormalUrl =
      typeof lastNormalUrlNode?.data === 'string' ? lastNormalUrlNode.data : undefined

    return (
      <div className={cn('text-wrap break-words whitespace-pre-wrap', className)}>
        {nodes.map((node, index) => {
          if (node.type === 'text') {
            return node.data
          }
          if (node.type === 'image' || node.type === 'images') {
            const imageUrls = Array.isArray(node.data) ? node.data : [node.data]
            const images = imageUrls.map(
              (url) => imageInfos.find((image) => image.url === url) ?? { url }
            )
            return (
              <ImageGallery
                className={`${size === 'small' ? 'mt-1' : 'mt-2'}`}
                key={index}
                images={images}
                isNsfw={isNsfwEvent(event)}
                size={size}
              />
            )
          }
          if (node.type === 'video') {
            return (
              <VideoPlayer
                className={size === 'small' ? 'mt-1' : 'mt-2'}
                key={index}
                src={node.data}
                isNsfw={isNsfwEvent(event)}
                size={size}
              />
            )
          }
          if (node.type === 'url') {
            return <EmbeddedNormalUrl url={node.data} key={index} />
          }
          if (node.type === 'websocket-url') {
            return <EmbeddedWebsocketUrl url={node.data} key={index} />
          }
          if (node.type === 'event') {
            const id = node.data.split(':')[1]
            return (
              <EmbeddedNote
                key={index}
                noteId={id}
                className={size === 'small' ? 'mt-1' : 'mt-2'}
              />
            )
          }
          if (node.type === 'mention') {
            return <EmbeddedMention key={index} userId={node.data.split(':')[1]} />
          }
          if (node.type === 'hashtag') {
            return <EmbeddedHashtag hashtag={node.data} key={index} />
          }
          return null
        })}
        {lastNormalUrl && (
          <WebPreview
            className={size === 'small' ? 'mt-1' : 'mt-2'}
            url={lastNormalUrl}
            size={size}
          />
        )}
      </div>
    )
  }
)
Content.displayName = 'Content'
export default Content
