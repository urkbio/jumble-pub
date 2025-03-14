export function preprocessContent(content: string) {
  const regex = /(?<=^|\s)(nevent|naddr|nprofile|npub)[a-zA-Z0-9]+/g
  return content.replace(regex, (match) => {
    return `nostr:${match}`
  })
}
