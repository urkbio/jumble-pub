export type TEmbeddedNodeType =
  | 'text'
  | 'image'
  | 'images'
  | 'video'
  | 'event'
  | 'mention'
  | 'legacy-mention'
  | 'hashtag'
  | 'websocket-url'
  | 'url'

export type TEmbeddedNode =
  | {
      type: Exclude<TEmbeddedNodeType, 'images'>
      data: string
    }
  | {
      type: 'images'
      data: string[]
    }

type TContentParser = { type: Exclude<TEmbeddedNodeType, 'images'>; regex: RegExp }

export const EmbeddedHashtagParser: TContentParser = {
  type: 'hashtag',
  regex: /#[\p{L}\p{N}\p{M}_]+/gu
}

export const EmbeddedMentionParser: TContentParser = {
  type: 'mention',
  regex: /nostr:(npub1[a-z0-9]{58}|nprofile1[a-z0-9]+)/g
}

export const EmbeddedLegacyMentionParser: TContentParser = {
  type: 'legacy-mention',
  regex: /npub1[a-z0-9]{58}|nprofile1[a-z0-9]+/g
}

export const EmbeddedEventParser: TContentParser = {
  type: 'event',
  regex: /nostr:(note1[a-z0-9]{58}|nevent1[a-z0-9]+|naddr1[a-z0-9]+)/g
}

export const EmbeddedImageParser: TContentParser = {
  type: 'image',
  regex:
    /https?:\/\/[\w\p{L}\p{N}\p{M}&.-/?=#\-@%+_:!~*]+\.(jpg|jpeg|png|gif|webp|bmp|tiff|heic|svg)(\?[\w\p{L}\p{N}\p{M}&.-/?=#\-@%+_:!~*]+)?/giu
}

export const EmbeddedVideoParser: TContentParser = {
  type: 'video',
  regex:
    /https?:\/\/[\w\p{L}\p{N}\p{M}&.-/?=#\-@%+_:!~*]+\.(mp4|webm|ogg|mov)(\?[\w\p{L}\p{N}\p{M}&.-/?=#\-@%+_:!~*]+)?/giu
}

export const EmbeddedWebsocketUrlParser: TContentParser = {
  type: 'websocket-url',
  regex: /wss?:\/\/[\w\p{L}\p{N}\p{M}&.-/?=#\-@%+_:!~*]+/gu
}

export const EmbeddedNormalUrlParser: TContentParser = {
  type: 'url',
  regex: /https?:\/\/[\w\p{L}\p{N}\p{M}&.-/?=#\-@%+_:!~*]+/gu
}

export function parseContent(content: string, parsers: TContentParser[]) {
  let nodes: TEmbeddedNode[] = [{ type: 'text', data: content.trim() }]

  parsers.forEach((parser) => {
    nodes = nodes
      .flatMap((node) => {
        if (node.type !== 'text') return [node]
        const matches = node.data.matchAll(parser.regex)
        const result: TEmbeddedNode[] = []
        let lastIndex = 0
        for (const match of matches) {
          const matchStart = match.index!
          // Add text before the match
          if (matchStart > lastIndex) {
            result.push({
              type: 'text',
              data: node.data.slice(lastIndex, matchStart)
            })
          }

          // Add the match as specific type
          result.push({
            type: parser.type,
            data: match[0] // The whole matched string
          })

          lastIndex = matchStart + match[0].length
        }

        // Add text after the last match
        if (lastIndex < node.data.length) {
          result.push({
            type: 'text',
            data: node.data.slice(lastIndex)
          })
        }

        return result
      })
      .filter((n) => n.data !== '')
  })

  nodes = mergeConsecutiveTextNodes(nodes)
  nodes = mergeConsecutiveImageNodes(nodes)
  nodes = removeExtraNewlines(nodes)

  return nodes
}

function mergeConsecutiveTextNodes(nodes: TEmbeddedNode[]) {
  const merged: TEmbeddedNode[] = []
  let currentText = ''

  nodes.forEach((node) => {
    if (node.type === 'text') {
      currentText += node.data
    } else {
      if (currentText) {
        merged.push({ type: 'text', data: currentText })
        currentText = ''
      }
      merged.push(node)
    }
  })

  if (currentText) {
    merged.push({ type: 'text', data: currentText })
  }

  return merged
}

function mergeConsecutiveImageNodes(nodes: TEmbeddedNode[]) {
  const merged: TEmbeddedNode[] = []
  nodes.forEach((node, i) => {
    if (node.type === 'image') {
      const lastNode = merged[merged.length - 1]
      if (lastNode && lastNode.type === 'images') {
        lastNode.data.push(node.data)
      } else {
        merged.push({ type: 'images', data: [node.data] })
      }
    } else if (node.type === 'text' && node.data.trim() === '') {
      // Only remove whitespace-only text nodes if they are sandwiched between image nodes.
      const prev = merged[merged.length - 1]
      const next = nodes[i + 1]
      if (prev && prev.type === 'images' && next && next.type === 'image') {
        return // skip this whitespace node
      } else {
        merged.push(node)
      }
    } else {
      merged.push(node)
    }
  })

  return merged
}

function removeExtraNewlines(nodes: TEmbeddedNode[]) {
  const isBlockNode = (node: TEmbeddedNode) => {
    return ['image', 'images', 'video', 'event'].includes(node.type)
  }

  const newNodes: TEmbeddedNode[] = []
  nodes.forEach((node, i) => {
    if (isBlockNode(node)) {
      newNodes.push(node)
      return
    }

    const prev = nodes[i - 1]
    const next = nodes[i + 1]
    let data = node.data as string
    if (prev && isBlockNode(prev)) {
      data = data.replace(/^[ ]*\n/, '')
    }
    if (next && isBlockNode(next)) {
      data = data.replace(/\n[ ]*$/, '')
    }
    newNodes.push({
      type: node.type as Exclude<TEmbeddedNodeType, 'images'>,
      data
    })
  })
  return newNodes
}
