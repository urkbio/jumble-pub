import { isNsfwEvent } from '@/lib/event'
import { cn } from '@/lib/utils'
import { Event } from 'nostr-tools'
import { memo } from 'react'
import {
  embedded,
  embeddedHashtagRenderer,
  embeddedNormalUrlRenderer,
  embeddedNostrNpubRenderer,
  embeddedNostrProfileRenderer,
  EmbeddedNote,
  embeddedWebsocketUrlRenderer
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
    const { content, images, videos, embeddedNotes, lastNonMediaUrl } = preprocess(event.content)
    const isNsfw = isNsfwEvent(event)
    const nodes = embedded(content, [
      embeddedNormalUrlRenderer,
      embeddedWebsocketUrlRenderer,
      embeddedHashtagRenderer,
      embeddedNostrNpubRenderer,
      embeddedNostrProfileRenderer
    ])

    // Add images
    if (images.length) {
      nodes.push(
        <ImageGallery
          className={`w-fit ${size === 'small' ? 'mt-1' : 'mt-2'}`}
          key={`image-gallery-${event.id}`}
          images={images}
          isNsfw={isNsfw}
          size={size}
        />
      )
    }

    // Add videos
    if (videos.length) {
      videos.forEach((src, index) => {
        nodes.push(
          <VideoPlayer
            className={size === 'small' ? 'mt-1' : 'mt-2'}
            key={`video-${index}-${src}`}
            src={src}
            isNsfw={isNsfw}
            size={size}
          />
        )
      })
    }

    // Add website preview
    if (lastNonMediaUrl) {
      nodes.push(
        <WebPreview
          className={size === 'small' ? 'mt-1' : 'mt-2'}
          key={`web-preview-${event.id}`}
          url={lastNonMediaUrl}
          size={size}
        />
      )
    }

    // Add embedded notes
    if (embeddedNotes.length) {
      embeddedNotes.forEach((note, index) => {
        const id = note.split(':')[1]
        nodes.push(
          <EmbeddedNote
            key={`embedded-event-${index}`}
            noteId={id}
            className={size === 'small' ? 'mt-1' : 'mt-2'}
          />
        )
      })
    }

    return <div className={cn('text-wrap break-words whitespace-pre-wrap', className)}>{nodes}</div>
  }
)
Content.displayName = 'Content'
export default Content

function preprocess(content: string) {
  const urlRegex = /(https?:\/\/[^\s"']+)/g
  const urls = content.match(urlRegex) || []
  let lastNonMediaUrl: string | undefined

  let c = content
  const images: string[] = []
  const videos: string[] = []

  urls.forEach((url) => {
    if (isImage(url)) {
      c = c.replace(url, '').trim()
      images.push(url)
    } else if (isVideo(url)) {
      c = c.replace(url, '').trim()
      videos.push(url)
    } else {
      lastNonMediaUrl = url
    }
  })

  const embeddedNotes: string[] = []
  const embeddedNoteRegex = /nostr:(note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/g
  ;(c.match(embeddedNoteRegex) || []).forEach((note) => {
    c = c.replace(note, '').trim()
    embeddedNotes.push(note)
  })

  return { content: c, images, videos, embeddedNotes, lastNonMediaUrl }
}

function isImage(url: string) {
  try {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.svg']
    return imageExtensions.some((ext) => new URL(url).pathname.toLowerCase().endsWith(ext))
  } catch {
    return false
  }
}

function isVideo(url: string) {
  try {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
    return videoExtensions.some((ext) => new URL(url).pathname.toLowerCase().endsWith(ext))
  } catch {
    return false
  }
}
