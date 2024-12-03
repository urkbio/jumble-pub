import { Button } from '@renderer/components/ui/button'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { SearchDialog } from '../SearchDialog'

export default function RefreshButton({
  variant = 'titlebar'
}: {
  variant?: 'titlebar' | 'sidebar' | 'small-screen-titlebar'
}) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={variant} onClick={() => setOpen(true)} title={t('Search')}>
        <Search />
        {variant === 'sidebar' && <div>{t('Search')}</div>}
      </Button>
      <SearchDialog open={open} setOpen={setOpen} />
    </>
  )
}
