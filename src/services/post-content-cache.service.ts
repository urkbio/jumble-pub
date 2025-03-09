import { Event } from 'nostr-tools'

class PostContentCacheService {
  static instance: PostContentCacheService

  private normalPostCache: Map<string, string> = new Map()
  private picturePostCache: {
    content: string
    pictureInfos: { url: string; tags: string[][] }[]
  } = { content: '', pictureInfos: [] }

  constructor() {
    if (!PostContentCacheService.instance) {
      PostContentCacheService.instance = this
    }
    return PostContentCacheService.instance
  }

  getNormalPostCache({
    defaultContent,
    parentEvent
  }: { defaultContent?: string; parentEvent?: Event } = {}) {
    return (
      this.normalPostCache.get(this.generateCacheKey(defaultContent, parentEvent)) ?? defaultContent
    )
  }

  setNormalPostCache(
    { defaultContent, parentEvent }: { defaultContent?: string; parentEvent?: Event },
    content: string
  ) {
    this.normalPostCache.set(this.generateCacheKey(defaultContent, parentEvent), content)
  }

  getPicturePostCache() {
    return this.picturePostCache
  }

  setPicturePostCache(content: string, pictureInfos: { url: string; tags: string[][] }[]) {
    this.picturePostCache = { content, pictureInfos }
  }

  generateCacheKey(defaultContent: string = '', parentEvent?: Event): string {
    return parentEvent ? parentEvent.id : defaultContent
  }
}

const instance = new PostContentCacheService()
export default instance
