import { useToast } from '@/hooks'
import { useNostr } from '@/providers/NostrProvider'
import dayjs from 'dayjs'
import { CloudUpload, Loader } from 'lucide-react'
import { kinds } from 'nostr-tools'
import { useState } from 'react'
import { Button } from '../ui/button'
import { TMailboxRelay } from './types'

export default function SaveButton({
  mailboxRelays,
  hasChange,
  setHasChange
}: {
  mailboxRelays: TMailboxRelay[]
  hasChange: boolean
  setHasChange: (hasChange: boolean) => void
}) {
  const { toast } = useToast()
  const { pubkey, publish, updateRelayList } = useNostr()
  const [pushing, setPushing] = useState(false)

  const save = async () => {
    setPushing(true)
    const event = {
      kind: kinds.RelayList,
      content: '',
      tags: mailboxRelays.map(({ url, scope }) =>
        scope === 'both' ? ['r', url] : ['r', url, scope]
      ),
      created_at: dayjs().unix()
    }
    await publish(event)
    updateRelayList({
      write: mailboxRelays.filter(({ scope }) => scope !== 'read').map(({ url }) => url),
      read: mailboxRelays.filter(({ scope }) => scope !== 'write').map(({ url }) => url)
    })
    toast({
      title: 'Save Successful',
      description: 'Successfully saved mailbox relays'
    })
    setHasChange(false)
    setPushing(false)
  }

  return (
    <Button className="w-full" disabled={!pubkey || pushing || !hasChange} onClick={save}>
      {pushing ? <Loader className="animate-spin" /> : <CloudUpload />}
      Save
    </Button>
  )
}
