import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks'
import { createRelaySetDraftEvent } from '@/lib/draft-event'
import { useNostr } from '@/providers/NostrProvider'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import { CloudUpload, Loader } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRelaySetsSettingComponent } from './provider'

export default function PushToRelaysButton() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const { pubkey, publish } = useNostr()
  const { relaySets } = useRelaySets()
  const { selectedRelaySetIds } = useRelaySetsSettingComponent()
  const [pushing, setPushing] = useState(false)

  const push = async () => {
    const selectedRelaySets = relaySets.filter((r) => selectedRelaySetIds.includes(r.id))
    if (!selectedRelaySets.length) return

    setPushing(true)
    const draftEvents = selectedRelaySets.map((relaySet) => createRelaySetDraftEvent(relaySet))
    await Promise.allSettled(draftEvents.map((event) => publish(event)))
    toast({
      title: t('Push Successful'),
      description: t('Successfully pushed relay sets to relays')
    })
    setPushing(false)
  }

  return (
    <Button
      variant="secondary"
      className="w-full"
      disabled={!pubkey || pushing || selectedRelaySetIds.length === 0}
      onClick={push}
    >
      <CloudUpload />
      {t('Push to relays')}
      {pushing && <Loader className="animate-spin" />}
    </Button>
  )
}
