import { COMMENT_EVENT_KIND, PICTURE_EVENT_KIND } from '@/constants'
import { TDraftEvent } from '@/types'
import dayjs from 'dayjs'
import { Event, kinds } from 'nostr-tools'
import {
  extractCommentMentions,
  extractHashtags,
  extractImagesFromContent,
  extractMentions,
  getEventCoordinate,
  isReplaceable
} from './event'

// https://github.com/nostr-protocol/nips/blob/master/25.md
export function createReactionDraftEvent(event: Event): TDraftEvent {
  const tags = event.tags.filter((tag) => tag.length >= 2 && ['e', 'p'].includes(tag[0]))
  tags.push(['e', event.id])
  tags.push(['p', event.pubkey])
  tags.push(['k', event.kind.toString()])

  if (isReplaceable(event.kind)) {
    tags.push(['a', getEventCoordinate(event)])
  }

  return {
    kind: kinds.Reaction,
    content: '+',
    tags,
    created_at: dayjs().unix()
  }
}

// https://github.com/nostr-protocol/nips/blob/master/18.md
export function createRepostDraftEvent(event: Event): TDraftEvent {
  const tags = [
    ['e', event.id], // TODO: url
    ['p', event.pubkey]
  ]

  return {
    kind: kinds.Repost,
    content: JSON.stringify(event),
    tags,
    created_at: dayjs().unix()
  }
}

export async function createShortTextNoteDraftEvent(
  content: string,
  options: {
    parentEvent?: Event
    addClientTag?: boolean
  } = {}
): Promise<TDraftEvent> {
  const { pubkeys, otherRelatedEventIds, quoteEventIds, rootEventId, parentEventId } =
    await extractMentions(content, options.parentEvent)
  const hashtags = extractHashtags(content)

  const tags = pubkeys
    .map((pubkey) => ['p', pubkey])
    .concat(otherRelatedEventIds.map((eventId) => ['e', eventId]))
    .concat(quoteEventIds.map((eventId) => ['q', eventId]))
    .concat(hashtags.map((hashtag) => ['t', hashtag]))

  if (rootEventId) {
    tags.push(['e', rootEventId, '', 'root'])
  }

  if (parentEventId) {
    tags.push(['e', parentEventId, '', 'reply'])
  }

  if (options.addClientTag) {
    tags.push(['client', 'jumble'])
  }

  return {
    kind: kinds.ShortTextNote,
    content,
    tags,
    created_at: dayjs().unix()
  }
}

export async function createPictureNoteDraftEvent(
  content: string,
  options: {
    addClientTag?: boolean
  } = {}
): Promise<TDraftEvent> {
  const { pubkeys, quoteEventIds } = await extractMentions(content)
  const hashtags = extractHashtags(content)
  const { images, contentWithoutImages } = extractImagesFromContent(content)
  if (!images || !images.length) {
    throw new Error('No images found in content')
  }

  const tags = images
    .map((image) => ['imeta', `url ${image}`])
    .concat(pubkeys.map((pubkey) => ['p', pubkey]))
    .concat(quoteEventIds.map((eventId) => ['q', eventId]))
    .concat(hashtags.map((hashtag) => ['t', hashtag]))

  if (options.addClientTag) {
    tags.push(['client', 'jumble'])
  }

  return {
    kind: PICTURE_EVENT_KIND,
    content: contentWithoutImages,
    tags,
    created_at: dayjs().unix()
  }
}

export async function createCommentDraftEvent(
  content: string,
  parentEvent: Event,
  options: {
    addClientTag?: boolean
  } = {}
): Promise<TDraftEvent> {
  const {
    pubkeys,
    quoteEventIds,
    rootEventId,
    rootEventKind,
    rootEventPubkey,
    parentEventId,
    parentEventKind,
    parentEventPubkey
  } = await extractCommentMentions(content, parentEvent)
  const hashtags = extractHashtags(content)

  const tags = [
    ['E', rootEventId],
    ['K', rootEventKind.toString()],
    ['P', rootEventPubkey],
    ['e', parentEventId],
    ['k', parentEventKind.toString()],
    ['p', parentEventPubkey]
  ].concat(
    pubkeys
      .map((pubkey) => ['p', pubkey])
      .concat(quoteEventIds.map((eventId) => ['q', eventId]))
      .concat(hashtags.map((hashtag) => ['t', hashtag]))
  )

  if (options.addClientTag) {
    tags.push(['client', 'jumble'])
  }

  return {
    kind: COMMENT_EVENT_KIND,
    content,
    tags,
    created_at: dayjs().unix()
  }
}
