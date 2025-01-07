export function tagNameEquals(tagName: string) {
  return (tag: string[]) => tag[0] === tagName
}

export function isReplyETag([tagName, , , marker]: string[]) {
  return tagName === 'e' && marker === 'reply'
}

export function isRootETag([tagName, , , marker]: string[]) {
  return tagName === 'e' && marker === 'root'
}

export function isMentionETag([tagName, , , marker]: string[]) {
  return tagName === 'e' && marker === 'mention'
}

export function extractImetaUrlFromTag(tag: string[]) {
  if (tag[0] !== 'imeta') return null
  const urlItem = tag.find((item) => item.startsWith('url '))
  const url = urlItem?.slice(4)
  return url || null
}
