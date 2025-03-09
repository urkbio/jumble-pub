import { Event } from 'nostr-tools'

class PostContentCacheService {
  static instance: PostContentCacheService

  private cache: Map<string, string> = new Map()

  constructor() {
    if (!PostContentCacheService.instance) {
      PostContentCacheService.instance = this
    }
    return PostContentCacheService.instance
  }

  get({ defaultContent, parentEvent }: { defaultContent?: string; parentEvent?: Event } = {}) {
    return this.cache.get(this.generateCacheKey(defaultContent, parentEvent)) ?? defaultContent
  }

  set(
    { defaultContent, parentEvent }: { defaultContent?: string; parentEvent?: Event },
    content: string
  ) {
    this.cache.set(this.generateCacheKey(defaultContent, parentEvent), content)
  }

  generateCacheKey(defaultContent: string = '', parentEvent?: Event): string {
    return parentEvent ? parentEvent.id : defaultContent
  }
}

const instance = new PostContentCacheService()
export default instance
