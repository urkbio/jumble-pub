import { EmbeddedHashtag } from '../components/Embedded'
import { TEmbeddedRenderer } from './types'

export const embeddedHashtagRenderer: TEmbeddedRenderer = {
  regex: /#([\p{L}\p{N}\p{M}]+)/gu,
  render: (hashtag: string, index: number) => {
    return <EmbeddedHashtag key={`hashtag-${index}-${hashtag}`} hashtag={hashtag} />
  }
}
