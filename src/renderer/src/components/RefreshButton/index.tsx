import { Button } from '@renderer/components/ui/button'
import { usePrimaryPage } from '@renderer/PageManager'
import { RefreshCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function RefreshButton({
  variant = 'titlebar'
}: {
  variant?: 'titlebar' | 'sidebar'
}) {
  const { t } = useTranslation()
  const { refresh } = usePrimaryPage()
  return (
    <Button variant={variant} size={variant} onClick={refresh} title={t('Refresh')}>
      <RefreshCcw />
      {variant === 'sidebar' && <div>{t('Refresh')}</div>}
    </Button>
  )
}
