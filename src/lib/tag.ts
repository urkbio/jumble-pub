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
