import { Button } from '@renderer/components/ui/button'
import { useSecondaryPage } from '@renderer/PageManager'
import { ChevronLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function BackButton({
  hide = false,
  variant = 'titlebar'
}: {
  hide?: boolean
  variant?: 'titlebar' | 'small-screen-titlebar'
}) {
  const { t } = useTranslation()
  const { pop } = useSecondaryPage()

  return (
    <>
      {!hide && (
        <Button variant={variant} size={variant} title={t('back')} onClick={() => pop()}>
          <ChevronLeft />
        </Button>
      )}
    </>
  )
}
