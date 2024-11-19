import { Button } from '@renderer/components/ui/button'
import SecondaryPageLayout from '@renderer/layouts/SecondaryPageLayout'
import { toHome } from '@renderer/lib/link'
import { useSecondaryPage } from '@renderer/PageManager'
import { useTranslation } from 'react-i18next'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const { push } = useSecondaryPage()

  return (
    <SecondaryPageLayout hideBackButton>
      <div className="text-muted-foreground w-full h-full flex flex-col items-center justify-center gap-2">
        <div>{t('Lost in the void')} 🌌</div>
        <div>(404)</div>
        <Button variant="secondary" onClick={() => push(toHome())}>
          {t('Carry me home')}
        </Button>
      </div>
    </SecondaryPageLayout>
  )
}
