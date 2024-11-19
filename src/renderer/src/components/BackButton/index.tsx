import { Button } from '@renderer/components/ui/button'
import { useSecondaryPage } from '@renderer/PageManager'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BackButton({ hide = false }: { hide?: boolean }) {
  const { t } = useTranslation()
  const { pop } = useSecondaryPage()

  return (
    <>
      {!hide && (
        <Button variant="titlebar" size="titlebar" title={t('back')} onClick={() => pop()}>
          <ChevronLeft />
        </Button>
      )}
    </>
  )
}
