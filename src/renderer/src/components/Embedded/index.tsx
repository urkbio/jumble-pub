export * from './EmbeddedHashtag'
export * from './EmbeddedMention'
export * from './EmbeddedNormalUrl'
export * from './EmbeddedNote'
export * from './EmbeddedWebsocketUrl'

import reactStringReplace from 'react-string-replace'
import { TEmbeddedRenderer } from './types'

export function embedded(content: string, renderers: TEmbeddedRenderer[]) {
  let nodes: React.ReactNode[] = [content]

  renderers.forEach((renderer) => {
    nodes = reactStringReplace(nodes, renderer.regex, renderer.render)
  })

  return nodes
}
