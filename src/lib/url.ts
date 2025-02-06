export function isWebsocketUrl(url: string): boolean {
  return /^wss?:\/\/.+$/.test(url)
}

// copy from nostr-tools/utils
export function normalizeUrl(url: string): string {
  if (url.indexOf('://') === -1) url = 'wss://' + url
  const p = new URL(url)
  p.pathname = p.pathname.replace(/\/+/g, '/')
  if (p.pathname.endsWith('/')) p.pathname = p.pathname.slice(0, -1)
  if ((p.port === '80' && p.protocol === 'ws:') || (p.port === '443' && p.protocol === 'wss:'))
    p.port = ''
  p.searchParams.sort()
  p.hash = ''
  return p.toString()
}

export function normalizeHttpUrl(url: string): string {
  if (url.indexOf('://') === -1) url = 'https://' + url
  const p = new URL(url)
  p.pathname = p.pathname.replace(/\/+/g, '/')
  if (p.pathname.endsWith('/')) p.pathname = p.pathname.slice(0, -1)
  if ((p.port === '80' && p.protocol === 'http:') || (p.port === '443' && p.protocol === 'https:'))
    p.port = ''
  p.searchParams.sort()
  p.hash = ''
  return p.toString()
}

export function simplifyUrl(url: string): string {
  return url.replace('wss://', '').replace('ws://', '').replace(/\/$/, '')
}

export function isImage(url: string) {
  try {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.svg']
    return imageExtensions.some((ext) => new URL(url).pathname.toLowerCase().endsWith(ext))
  } catch {
    return false
  }
}

export function isVideo(url: string) {
  try {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
    return videoExtensions.some((ext) => new URL(url).pathname.toLowerCase().endsWith(ext))
  } catch {
    return false
  }
}
