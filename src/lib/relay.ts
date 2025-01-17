import { TMailboxRelay, TRelayInfo, TRelayList } from '@/types'

export function checkAlgoRelay(relayInfo: TRelayInfo | undefined) {
  return relayInfo?.software === 'https://github.com/bitvora/algo-relay' // hardcode for now
}

export function checkSearchRelay(relayInfo: TRelayInfo | undefined) {
  return relayInfo?.supported_nips?.includes(50)
}

export function relayListToMailboxRelay(relayList: TRelayList): TMailboxRelay[] {
  const mailboxRelays: TMailboxRelay[] = relayList.read.map((url) => ({ url, scope: 'read' }))
  relayList.write.forEach((url) => {
    const item = mailboxRelays.find((r) => r.url === url)
    if (item) {
      item.scope = 'both'
    } else {
      mailboxRelays.push({ url, scope: 'write' })
    }
  })
  return mailboxRelays
}
