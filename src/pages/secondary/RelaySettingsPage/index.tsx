import MailboxSetting from '@/components/MailboxSetting'
import RelaySetsSetting from '@/components/RelaySetsSetting'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SecondaryPageLayout from '@/layouts/SecondaryPageLayout'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function RelaySettingsPage({ index }: { index?: number }) {
  const { t } = useTranslation()
  const [tabValue, setTabValue] = useState('mailbox')

  useEffect(() => {
    if (window.location.hash === '#relay-sets') {
      setTabValue('relay-sets')
    }
  }, [])

  return (
    <SecondaryPageLayout index={index} title={t('Relay settings')}>
      <Tabs
        defaultValue="mailbox"
        value={tabValue}
        onValueChange={setTabValue}
        className="px-4 space-y-4"
      >
        <TabsList>
          <TabsTrigger value="mailbox">{t('Read & Write Relays')}</TabsTrigger>
          <TabsTrigger value="relay-sets">{t('Relay Sets')}</TabsTrigger>
        </TabsList>
        <TabsContent value="mailbox">
          <MailboxSetting />
        </TabsContent>
        <TabsContent value="relay-sets">
          <RelaySetsSetting />
        </TabsContent>
      </Tabs>
    </SecondaryPageLayout>
  )
}
