import { useFavoriteRelays } from '@/providers/FavoriteRelaysProvider'
import { useTranslation } from 'react-i18next'
import AddNewRelay from './AddNewRelay'
import AddNewRelaySet from './AddNewRelaySet'
import { RelaySetsSettingComponentProvider } from './provider'
import RelayItem from './RelayItem'
import RelaySet from './RelaySet'
import TemporaryRelaySet from './TemporaryRelaySet'
import PullRelaySetsButton from './PullRelaySetsButton'

export default function FavoriteRelaysSetting() {
  const { t } = useTranslation()
  const { relaySets, favoriteRelays } = useFavoriteRelays()

  return (
    <RelaySetsSettingComponentProvider>
      <div className="space-y-4">
        <TemporaryRelaySet />
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-muted-foreground font-semibold select-nones shrink-0">
              {t('Relay sets')}
            </div>
            <PullRelaySetsButton />
          </div>
          {relaySets.map((relaySet) => (
            <RelaySet key={relaySet.id} relaySet={relaySet} />
          ))}
        </div>
        <AddNewRelaySet />
        <div className="space-y-2">
          <div className="text-muted-foreground font-semibold select-none">{t('Relays')}</div>
          {favoriteRelays.map((relay) => (
            <RelayItem key={relay} relay={relay} />
          ))}
        </div>
        <AddNewRelay />
      </div>
    </RelaySetsSettingComponentProvider>
  )
}
