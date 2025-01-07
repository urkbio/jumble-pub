import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useRelaySets } from '@/providers/RelaySetsProvider'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RelaySetsSettingComponentProvider } from './provider'
import RelaySet from './RelaySet'
import TemporaryRelaySet from './TemporaryRelaySet'
import PushToRelaysButton from './PushToRelaysButton'
import PullFromRelaysButton from './PullFromRelaysButton'

export default function RelaySetsSetting() {
  const { t } = useTranslation()
  const { relaySets, addRelaySet } = useRelaySets()
  const [newRelaySetName, setNewRelaySetName] = useState('')
  const dummyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (dummyRef.current) {
      dummyRef.current.focus()
    }
  }, [])

  const saveRelaySet = () => {
    if (!newRelaySetName) return
    addRelaySet(newRelaySetName)
  }

  const handleNewRelaySetNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewRelaySetName(e.target.value)
  }

  const handleNewRelaySetNameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      saveRelaySet()
    }
  }

  return (
    <RelaySetsSettingComponentProvider>
      <div ref={dummyRef} tabIndex={-1} style={{ position: 'absolute', opacity: 0 }}></div>
      <div className="flex gap-4">
        <PushToRelaysButton />
        <PullFromRelaysButton />
      </div>
      <div className="space-y-2 mt-4">
        <TemporaryRelaySet />
        {relaySets.map((relaySet) => (
          <RelaySet key={relaySet.id} relaySet={relaySet} />
        ))}
      </div>
      {relaySets.length < 10 && (
        <>
          <Separator className="my-4" />
          <div className="w-full border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div className="font-semibold">{t('Add a new relay set')}</div>
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                placeholder={t('Relay set name')}
                value={newRelaySetName}
                onChange={handleNewRelaySetNameChange}
                onKeyDown={handleNewRelaySetNameKeyDown}
                onBlur={saveRelaySet}
              />
              <Button onClick={saveRelaySet}>{t('Add')}</Button>
            </div>
          </div>
        </>
      )}
    </RelaySetsSettingComponentProvider>
  )
}
